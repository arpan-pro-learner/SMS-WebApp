import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Megaphone, Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const fetchUserRole = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('Error fetching user role:', error);
      } else {
        setUserRole(userProfile.role);
      }
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, user:created_by(email)') // Assuming a relationship exists
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to fetch announcements.');
      toast.error('Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserRole();
    fetchAnnouncements();
  }, [fetchUserRole, fetchAnnouncements]);

  const handleCreateAnnouncement = async (formData) => {
    const toastId = toast.loading('Posting announcement...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('announcements')
        .insert([{ ...formData, created_by: user.id }])
        .select('*, user:created_by(email)')
        .single();
      
      if (error) throw error;

      setAnnouncements((prev) => [data, ...prev]);
      reset();
      toast.success('Announcement posted successfully!', { id: toastId });
    } catch (err) {
      console.error('Error creating announcement:', err);
      toast.error('Failed to post announcement.', { id: toastId });
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      const toastId = toast.loading('Deleting announcement...');
      try {
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) throw error;
        setAnnouncements(announcements.filter((a) => a.id !== id));
        toast.success('Announcement deleted.', { id: toastId });
      } catch (err) {
        console.error('Error deleting announcement:', err);
        toast.error('Failed to delete announcement.', { id: toastId });
      }
    }
  };

  const canManage = userRole === 'admin' || userRole === 'teacher';

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Megaphone className="w-8 h-8 mr-3 text-blue-600" />
            Announcements
          </h1>
          <p className="text-sm text-gray-600 mt-1">Stay updated with the latest news and events.</p>
        </header>

        {canManage && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Plus className="w-6 h-6 mr-2" /> Create New Announcement
            </h2>
            <form onSubmit={handleSubmit(handleCreateAnnouncement)} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  id="title"
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                  placeholder="e.g., School Holiday"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  rows="4"
                  className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                  placeholder="Provide details about the announcement..."
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition"
                >
                  {isSubmitting ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-2 bg-gray-200 rounded w-1/4 mt-4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex items-center" role="alert">
            <AlertCircle className="w-6 h-6 mr-3" />
            <div>
              <p className="font-bold">An error occurred</p>
              <p>{error}</p>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <Info size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Announcements Yet</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{announcement.title}</h3>
                    {canManage && (
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Delete announcement"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{announcement.description}</p>
                </div>
                <div className="bg-gray-50 px-6 py-3 rounded-b-xl">
                  <p className="text-xs text-gray-500">
                    Posted on {new Date(announcement.created_at).toLocaleDateString()}
                    {announcement.user && ` by ${announcement.user.email}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Announcements;
