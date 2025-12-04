import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

import useUserStore from '../store/userStore';

// ... (rest of imports)

// ... (ChartJS registration)

function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUserStore();

  useEffect(() => {
    const fetchStudentAndAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) return;

        let studentId = null;

        // Case 1: Admin is viewing as a student
        if (user.originalRole === 'admin' && user.role === 'student') {
          // For demo purposes, fetch the first student's data
          const { data: firstStudent, error: firstStudentError } = await supabase
            .from('students')
            .select('id')
            .limit(1)
            .single();

          if (firstStudentError) throw firstStudentError;
          if (!firstStudent) throw new Error("No students found to display.");
          
          studentId = firstStudent.id;
        } else {
          // Case 2: A regular student is viewing their own attendance
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('id')
            .eq('email', user.email)
            .single();

          if (studentError) throw studentError;
          studentId = studentData.id;
        }

        const { data, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, date, status')
          .eq('student_id', studentId)
          .order('date', { ascending: false });

        if (attendanceError) throw attendanceError;
        
        setAttendance(data);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to fetch attendance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndAttendance();
  }, [user]);

  const attendanceSummary = attendance.reduce(
    (acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    },
    { Present: 0, Absent: 0, Late: 0 }
  );

  const chartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [
          attendanceSummary.Present,
          attendanceSummary.Absent,
          attendanceSummary.Late,
        ],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        hoverBackgroundColor: ['#059669', '#DC2626', '#D97706'],
        borderColor: 'transparent',
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const renderStatusBadge = (status) => {
    const baseClasses = 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'Present':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>{status}</span>;
      case 'Absent':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{status}</span>;
      case 'Late':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{status}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-sm text-gray-600 mt-1">A summary of your attendance records.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm" role="alert">
          <p className="font-bold">An error occurred</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Chart and Summary Section */}
          <div className="xl:col-span-1 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
              Attendance Summary
            </h2>
            <div className="relative h-64 w-full mx-auto mb-6">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-2" /> Present</span>
                <span>{attendanceSummary.Present} days</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center text-red-600"><XCircle className="w-4 h-4 mr-2" /> Absent</span>
                <span>{attendanceSummary.Absent} days</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center text-yellow-600"><Clock className="w-4 h-4 mr-2" /> Late</span>
                <span>{attendanceSummary.Late} days</span>
              </div>
            </div>
          </div>

          {/* Attendance Details Table */}
          <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              Detailed Records
            </h2>
            {attendance.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">No attendance records found.</p>
                <p className="text-sm text-gray-400">Your attendance history will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendance.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {renderStatusBadge(record.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentAttendance;
