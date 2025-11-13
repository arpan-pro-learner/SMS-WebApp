import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', class_id: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('students').select('*, classes(name)');
    if (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students.');
    } else {
      setStudents(data);
    }
    setLoading(false);
  };

  const fetchClasses = async () => {
    setError(null);
    const { data, error } = await supabase.from('classes').select('*');
    if (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes.');
    } else {
      setClasses(data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddStudent = async () => {
    const { name, email, class_id } = formData;
    if (!name.trim() || !email.trim() || !class_id) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('students').insert([{ name, email, class_id }]).select();
    if (error) {
      console.error('Error adding student:', error);
      setError('Failed to add student.');
    } else {
      setStudents((prevStudents) => [...prevStudents, ...data]);
      setShowModal(false);
      setFormData({ name: '', email: '', class_id: '' });
    }
    setLoading(false);
  };

  const handleUpdateStudent = async () => {
    const { name, email, class_id } = formData;
    if (!name.trim() || !email.trim() || !class_id || !editingStudent) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('students')
      .update({ name, email, class_id })
      .eq('id', editingStudent.id)
      .select();
      
    if (error) {
      console.error('Error updating student:', error);
      setError('Failed to update student.');
    } else {
      setStudents((prevStudents) =>
        prevStudents.map((s) => (s.id === editingStudent.id ? { ...data[0], classes: {name: classes.find(c => c.id === data[0].class_id)?.name }} : s))
      );
      setShowModal(false);
      setFormData({ name: '', email: '', class_id: '' });
      setEditingStudent(null);
    }
    setLoading(false);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      console.error('Error deleting student:', error);
      setError('Failed to delete student.');
    } else {
      setStudents((prevStudents) => prevStudents.filter((s) => s.id !== id));
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ name: '', email: '', class_id: '' });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, email: student.email, class_id: student.class_id });
    setError(null);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Students</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Student
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">Loading students...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">No students found.</td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {student.classes?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(student)}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150 ease-in-out"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
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
              {editingStudent ? 'Edit Student' : 'Add New Student'}
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
              placeholder="Enter student name"
              disabled={loading}
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
              placeholder="Enter student email"
              disabled={loading}
            />
            <select
              name="class_id"
              value={formData.class_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
              disabled={loading}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg px-4 py-2 transition duration-150 ease-in-out"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={editingStudent ? handleUpdateStudent : handleAddStudent}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? (editingStudent ? 'Updating...' : 'Adding...') : (editingStudent ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStudents;
