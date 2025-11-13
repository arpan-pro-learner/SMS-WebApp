import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('classes').select('*');
    if (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes.');
    } else {
      setClasses(data);
    }
    setLoading(false);
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) {
      setError('Class name cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('classes').insert([{ name: newClassName.trim() }]).select();
    if (error) {
      console.error('Error adding class:', error);
      setError('Failed to add class.');
    } else {
      setClasses((prevClasses) => [...prevClasses, ...data]);
      setShowModal(false);
      setNewClassName('');
    }
    setLoading(false);
  };

  const handleUpdateClass = async () => {
    if (!newClassName.trim()) {
      setError('Class name cannot be empty.');
      return;
    }
    if (!editingClass) return;

    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('classes')
      .update({ name: newClassName.trim() })
      .eq('id', editingClass.id)
      .select();
    if (error) {
      console.error('Error updating class:', error);
      setError('Failed to update class.');
    } else {
      setClasses((prevClasses) =>
        prevClasses.map((cls) => (cls.id === editingClass.id ? data[0] : cls))
      );
      setShowModal(false);
      setNewClassName('');
      setEditingClass(null);
    }
    setLoading(false);
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) {
      console.error('Error deleting class:', error);
      setError('Failed to delete class.');
    } else {
      setClasses((prevClasses) => prevClasses.filter((c) => c.id !== id));
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingClass(null);
    setNewClassName('');
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setNewClassName(cls.name);
    setError(null);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Classes</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Class
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">Loading classes...</td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">No classes found.</td>
              </tr>
            ) : (
              classes.map((cls, index) => (
                <tr key={cls.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cls.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {cls.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150 ease-in-out"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h2>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
              placeholder="Enter class name"
              disabled={loading}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg px-4 py-2 transition duration-150 ease-in-out"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={editingClass ? handleUpdateClass : handleAddClass}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? (editingClass ? 'Updating...' : 'Adding...') : (editingClass ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminClasses;
