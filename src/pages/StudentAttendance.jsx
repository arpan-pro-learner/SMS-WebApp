import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudentAndAttendance = async () => {
      setLoading(true);
      // Placeholder for fetching the logged-in student's ID
      // In a real app, you'd get this from the user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('email', user.email)
          .single();

        if (studentError) {
          console.error('Error fetching student data:', studentError);
        } else {
          setStudent(studentData);
          const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', studentData.id);

          if (error) {
            console.error('Error fetching attendance:', error);
          } else {
            setAttendance(data);
          }
        }
      }
      setLoading(false);
    };

    fetchStudentAndAttendance();
  }, []);

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
        backgroundColor: ['#16A34A', '#DC2626', '#F59E0B'],
        hoverBackgroundColor: ['#15803D', '#B91C1C', '#D97706'],
      },
    ],
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Attendance</h1>
      {loading ? (
        <p>Loading attendance...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <Doughnut data={chartData} />
          </div>
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4">{record.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'Absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentAttendance;
