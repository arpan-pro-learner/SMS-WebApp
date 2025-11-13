import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', class_id: '' });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*, classes(name)');
    if (error) console.error('Error fetching students:', error);
    else setStudents(data);
    setLoading(false);
  };

  const fetchClasses = async () => {
    const { data, error } = await supabase.from('classes').select('*');
    if (error) console.error('Error fetching classes:', error);
    else setClasses(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddStudent = async () => {
    const { name, email, class_id } = formData;
    if (!name || !email || !class_id) return;
    
    const { data, error } = await supabase.from('students').insert([{ name, email, class_id }]);
    if (error) {
      console.error('Error adding student:', error);
    } else {
      fetchStudents();
      setShowModal(false);
      setFormData({ name: '', email: '', class_id: '' });
    }
  };

  const handleUpdateStudent = async () => {
    const { name, email, class_id } = formData;
    if (!name || !email || !class_id || !editingStudent) return;

    const { data, error } = await supabase
      .from('students')
      .update({ name, email, class_id })
      .eq('id', editingStudent.id);
      
    if (error) {
      console.error('Error updating student:', error);
    } else {
      fetchStudents();
      setShowModal(false);
      setFormData({ name: '', email: '', class_id: '' });
      setEditingStudent(null);
    }
  };

  const handleDeleteStudent = async (id) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) console.error('Error deleting student:', error);
    else setStudents(students.filter((s) => s.id !== id));
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ name: '', email: '', class_id: '' });
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, email: student.email, class_id: student.class_id });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Students</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2"
        >
          Add Student
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.classes.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => openEditModal(student)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-900">Delete</button>
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
            <h2 className="text-xl font-bold mb-4">{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" className="w-full p-2 mb-4 border rounded"/>
            <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full p-2 mb-4 border rounded"/>
            <select name="class_id" value={formData.class_id} onChange={handleInputChange} className="w-full p-2 mb-4 border rounded">
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowModal(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
              <button onClick={editingStudent ? handleUpdateStudent : handleAddStudent} className="bg-blue-600 text-white px-4 py-2 rounded">
                {editingStudent ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStudents;
