import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useAttendanceStore from '../store/attendanceStore';
import { supabase } from '../supabaseClient';

function StudentDashboard() {
  const { attendanceRecords, loading, error, fetchAttendance } = useAttendanceStore();
  const [studentId, setStudentId] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  useEffect(() => {
    const getStudentId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('id') // Assuming user.id in auth matches student.id in public.users
          .eq('id', user.id)
          .single();
        if (profile) {
          setStudentId(profile.id);
        }
      }
      setLoadingStudent(false);
    };
    getStudentId();
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchAttendance({ student_id: studentId });
    }
  }, [studentId, fetchAttendance]);

  if (loadingStudent) {
    return <Layout><div>Loading student data...</div></Layout>;
  }

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Dashboard</h2>

      {/* Attendance Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">My Attendance</h3>

        {error && <p className="text-red-500 mb-4">Error: {error.message}</p>}
        {loading && <p>Loading attendance records...</p>}
        {!loading && attendanceRecords.length === 0 && <p>No attendance records found.</p>}

        {!loading && attendanceRecords.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 border-b-2 border-gray-200">Date</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{record.status}</td>
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

export default StudentDashboard;
