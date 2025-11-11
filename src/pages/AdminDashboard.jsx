import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useClassStore from '../store/classStore';
import useAnnouncementStore from '../store/announcementStore';
import { supabase } from '../supabaseClient';

function AdminDashboard() {
  const { classes, loading: loadingClasses, error: classError, fetchClasses, addClass, updateClass, deleteClass } = useClassStore();
  const { announcements, loading: loadingAnnouncements, error: announcementError, fetchAnnouncements, addAnnouncement, deleteAnnouncement } = useAnnouncementStore();

  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState(null);

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementDescription, setAnnouncementDescription] = useState('');
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const getAdminId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminId(user.id);
      }
    };
    getAdminId();
    fetchClasses();
    fetchAnnouncements();
  }, [fetchClasses, fetchAnnouncements]);

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

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (announcementTitle.trim() && announcementDescription.trim() && adminId) {
      await addAnnouncement({
        title: announcementTitle,
        description: announcementDescription,
        created_by: adminId,
      });
      setAnnouncementTitle('');
      setAnnouncementDescription('');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      await deleteAnnouncement(id);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      {/* Class Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Class Management</h3>
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
            disabled={loadingClasses}
          >
            {editingClass ? 'Update Class' : 'Add Class'}
          </button>
          {editingClass && (
            <button
              type="button"
              onClick={cancelEditing}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </form>
        {classError && <p className="text-red-500 mb-4">Error: {classError.message}</p>}
        {loadingClasses && <p>Loading classes...</p>}
        {!loadingClasses && classes.length > 0 && (
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
                      <button onClick={() => startEditing(cls)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDeleteClass(cls.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Announcement Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Announcements</h3>
        <form onSubmit={handleAddAnnouncement} className="space-y-4 mb-6">
          <div>
            <label htmlFor="announcement-title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              id="announcement-title"
              type="text"
              placeholder="Announcement Title"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="announcement-desc" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="announcement-desc"
              placeholder="Announcement Description"
              value={announcementDescription}
              onChange={(e) => setAnnouncementDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loadingAnnouncements}
          >
            Post Announcement
          </button>
        </form>

        {announcementError && <p className="text-red-500 mb-4">Error: {announcementError.message}</p>}
        {loadingAnnouncements && <p>Loading announcements...</p>}
        {!loadingAnnouncements && announcements.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">Posted Announcements</h4>
            <ul className="space-y-4">
              {announcements.map((ann) => (
                <li key={ann.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{ann.title}</p>
                      <p className="text-sm text-gray-600">{ann.description}</p>
                      <p className="text-xs text-gray-400 mt-2">Posted on: {new Date(ann.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;
