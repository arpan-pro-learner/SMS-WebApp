import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useClassStore from '../store/classStore';

function AdminDashboard() {
  const { classes, loading, error, fetchClasses, addClass, updateClass, deleteClass } = useClassStore();
  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState(null); // State to hold class being edited

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (newClassName.trim()) {
      await addClass({ name: newClassName });
      setNewClassName('');
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    if (editingClass && newClassName.trim()) {
      await updateClass(editingClass.id, { name: newClassName });
      setNewClassName('');
      setEditingClass(null);
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      await deleteClass(id);
    }
  };

  const startEditing = (cls) => {
    setEditingClass(cls);
    setNewClassName(cls.name);
  };

  const cancelEditing = () => {
    setEditingClass(null);
    setNewClassName('');
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      {/* Class Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Class Management</h3>

        {/* Add/Edit Class Form */}
        <form onSubmit={editingClass ? handleUpdateClass : handleAddClass} className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder={editingClass ? 'Edit class name' : 'New class name'}
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {editingClass ? 'Update Class' : 'Add Class'}
          </button>
          {editingClass && (
            <button
              type="button"
              onClick={cancelEditing}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </form>

        {error && <p className="text-red-500 mb-4">Error: {error.message}</p>}

        {/* Classes List */}
        {loading && <p>Loading classes...</p>}
        {!loading && classes.length === 0 && <p>No classes found. Add a new class!</p>}
        {!loading && classes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 border-b-2 border-gray-200">ID</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200">Class Name</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => startEditing(cls)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;
