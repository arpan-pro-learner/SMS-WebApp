import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchUserAndAnnouncements = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single();
        setUser({ ...user, role: userProfile.role });
      }

      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) console.error('Error fetching announcements:', error);
      else setAnnouncements(data);
      setLoading(false);
    };
    fetchUserAndAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    const { data, error } = await supabase.from('announcements').insert([{ title, description, created_by: user.id }]);
    if (error) {
      console.error('Error creating announcement:', error);
    } else {
      setAnnouncements([data[0], ...announcements]);
      setTitle('');
      setDescription('');
    }
  };

  const canCreate = user && (user.role === 'admin' || user.role === 'teacher');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>
      
      {canCreate && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Announcement</h2>
          <form onSubmit={handleCreateAnnouncement}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              ></textarea>
            </div>
            <div className="text-right">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Post Announcement</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading announcements...</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
              <p className="text-gray-600 mt-2">{announcement.description}</p>
              <p className="text-xs text-gray-400 mt-4">
                Posted on {new Date(announcement.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Announcements;
