import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('classes').select('*');
    if (error) {
      console.error('Error fetching classes:', error);
    } else {
      setClasses(data);
    }
    setLoading(false);
  };

  const handleAddClass = async () => {
    if (!newClassName) return;
    const { data, error } = await supabase.from('classes').insert([{ name: newClassName }]);
    if (error) {
      console.error('Error adding class:', error);
    } else {
      setClasses([...classes, ...data]);
      setShowModal(false);
      setNewClassName('');
    }
  };

  const handleUpdateClass = async () => {
    if (!newClassName || !editingClass) return;
    const { data, error } = await supabase
      .from('classes')
      .update({ name: newClassName })
      .eq('id', editingClass.id);
    if (error) {
      console.error('Error updating class:', error);
    } else {
      fetchClasses(); // Refetch to get the updated list
      setShowModal(false);
      setNewClassName('');
      setEditingClass(null);
    }
  };

  const handleDeleteClass = async (id) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) {
      console.error('Error deleting class:', error);
    } else {
      setClasses(classes.filter((c) => c.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingClass(null);
    setNewClassName('');
    setShowModal(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setNewClassName(cls.name);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Classes</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2"
        >
          Add Class
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                <td colSpan="2" className="text-center py-4">Loading...</td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cls.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-red-600 hover:text-red-900"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h2>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              placeholder="Enter class name"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={editingClass ? handleUpdateClass : handleAddClass}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2"
              >
                {editingClass ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminClasses;
