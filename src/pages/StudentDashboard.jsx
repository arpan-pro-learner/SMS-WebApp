import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useAttendanceStore from '../store/attendanceStore';
import useMarksStore from '../store/marksStore'; // Import the marks store
import { supabase } from '../supabaseClient';
import { Bar } from 'react-chartjs-2'; // Import chart components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StudentDashboard() {
  const { attendanceRecords, loading: loadingAttendance, error: attendanceError, fetchAttendance } = useAttendanceStore();
  const { marksRecords, loading: loadingMarks, error: marksError, fetchMarks } = useMarksStore(); // Destructure marks store
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
      fetchMarks({ student_id: studentId }); // Fetch marks for the student
    }
  }, [studentId, fetchAttendance, fetchMarks]);

  if (loadingStudent) {
    return <Layout><div>Loading student data...</div></Layout>;
  }

  // Prepare data for marks chart
  const marksChartData = {
    labels: marksRecords.map(record => record.subject),
    datasets: [
      {
        label: 'Marks',
        data: marksRecords.map(record => record.marks),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const marksChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Student Performance by Subject',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Dashboard</h2>

      {/* Attendance Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">My Attendance</h3>

        {attendanceError && <p className="text-red-500 mb-4">Error: {attendanceError.message}</p>}
        {loadingAttendance && <p>Loading attendance records...</p>}
        {!loadingAttendance && attendanceRecords.length === 0 && <p>No attendance records found.</p>}

        {!loadingAttendance && attendanceRecords.length > 0 && (
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

      {/* Marks Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">My Marks</h3>

        {marksError && <p className="text-red-500 mb-4">Error: {marksError.message}</p>}
        {loadingMarks && <p>Loading marks records...</p>}
        {!loadingMarks && marksRecords.length === 0 && <p>No marks records found.</p>}

        {!loadingMarks && marksRecords.length > 0 && (
          <>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 border-b-2 border-gray-200">Subject</th>
                    <th className="px-6 py-3 border-b-2 border-gray-200">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {marksRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-80"> {/* Chart container */}
              <Bar data={marksChartData} options={marksChartOptions} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default StudentDashboard;
