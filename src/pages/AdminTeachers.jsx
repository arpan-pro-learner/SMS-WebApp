import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingTeacher, setEditingTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('teachers').select('*');
    if (error) console.error('Error fetching teachers:', error);
    else setTeachers(data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTeacher = async () => {
    const { name, email } = formData;
    if (!name || !email) return;
    
    const { data, error } = await supabase.from('teachers').insert([{ name, email }]);
    if (error) {
      console.error('Error adding teacher:', error);
    } else {
      fetchTeachers();
      setShowModal(false);
      setFormData({ name: '', email: '' });
    }
  };

  const handleUpdateTeacher = async () => {
    const { name, email } = formData;
    if (!name || !email || !editingTeacher) return;

    const { data, error } = await supabase
      .from('teachers')
      .update({ name, email })
      .eq('id', editingTeacher.id);
      
    if (error) {
      console.error('Error updating teacher:', error);
    } else {
      fetchTeachers();
      setShowModal(false);
      setFormData({ name: '', email: '' });
      setEditingTeacher(null);
    }
  };

  const handleDeleteTeacher = async (id) => {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) console.error('Error deleting teacher:', error);
    else setTeachers(teachers.filter((t) => t.id !== id));
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({ name: '', email: '' });
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({ name: teacher.name, email: teacher.email });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Teachers</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2"
        >
          Add Teacher
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap">{teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{teacher.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => openEditModal(teacher)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => handleDeleteTeacher(teacher.id)} className="text-red-600 hover:text-red-900">Delete</button>
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
            <h2 className="text-xl font-bold mb-4">{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" className="w-full p-2 mb-4 border rounded"/>
            <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full p-2 mb-4 border rounded"/>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowModal(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
              <button onClick={editingTeacher ? handleUpdateTeacher : handleAddTeacher} className="bg-blue-600 text-white px-4 py-2 rounded">
                {editingTeacher ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTeachers;
