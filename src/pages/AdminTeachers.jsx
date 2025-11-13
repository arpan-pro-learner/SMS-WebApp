import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('teachers').select('*');
    if (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to fetch teachers.');
    } else {
      setTeachers(data);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTeacher = async () => {
    const { name, email } = formData;
    if (!name.trim() || !email.trim()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('teachers').insert([{ name, email }]).select();
    if (error) {
      console.error('Error adding teacher:', error);
      setError('Failed to add teacher.');
    } else {
      setTeachers((prevTeachers) => [...prevTeachers, ...data]);
      setShowModal(false);
      setFormData({ name: '', email: '' });
    }
    setLoading(false);
  };

  const handleUpdateTeacher = async () => {
    const { name, email } = formData;
    if (!name.trim() || !email.trim() || !editingTeacher) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('teachers')
      .update({ name, email })
      .eq('id', editingTeacher.id)
      .select();
      
    if (error) {
      console.error('Error updating teacher:', error);
      setError('Failed to update teacher.');
    } else {
      setTeachers((prevTeachers) =>
        prevTeachers.map((t) => (t.id === editingTeacher.id ? data[0] : t))
      );
      setShowModal(false);
      setFormData({ name: '', email: '' });
      setEditingTeacher(null);
    }
    setLoading(false);
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) {
      console.error('Error deleting teacher:', error);
      setError('Failed to delete teacher.');
    } else {
      setTeachers((prevTeachers) => prevTeachers.filter((t) => t.id !== id));
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({ name: '', email: '' });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({ name: teacher.name, email: teacher.email });
    setError(null);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Teachers</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Teacher
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
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">Loading teachers...</td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">No teachers found.</td>
              </tr>
            ) : (
              teachers.map((teacher, index) => (
                <tr key={teacher.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {teacher.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {teacher.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150 ease-in-out"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(teacher.id)}
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
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
              placeholder="Enter teacher name"
              disabled={loading}
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
              placeholder="Enter teacher email"
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
                onClick={editingTeacher ? handleUpdateTeacher : handleAddTeacher}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? (editingTeacher ? 'Updating...' : 'Adding...') : (editingTeacher ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTeachers;
