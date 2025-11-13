import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, absent: 0, late: 0 });
  const [averageMarks, setAverageMarks] = useState(0);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
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
          fetchAttendanceSummary(studentData.id);
          fetchAverageMarks(studentData.id);
        }
      }
      setLoading(false);
    };

    fetchStudentData();
  }, []);

  const fetchAttendanceSummary = async (studentId) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('status', { count: 'exact' })
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching attendance summary:', error);
    } else {
      const summary = data.reduce((acc, record) => {
        acc[record.status.toLowerCase()] = (acc[record.status.toLowerCase()] || 0) + 1;
        return acc;
      }, { present: 0, absent: 0, late: 0 });
      setAttendanceSummary(summary);
    }
  };

  const fetchAverageMarks = async (studentId) => {
    const { data, error } = await supabase
      .from('marks')
      .select('marks')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching marks:', error);
    } else {
      const totalMarks = data.reduce((sum, record) => sum + record.marks, 0);
      const avg = data.length > 0 ? totalMarks / data.length : 0;
      setAverageMarks(avg.toFixed(2));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Dashboard</h2>

      {loading ? (
        <p>Loading student data...</p>
      ) : (
        <>
          {student && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Welcome, {student.name}!</h3>
              <p className="text-gray-600">Email: {student.email}</p>
              {/* Add more student-specific info here if needed */}
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700">Days Present</h4>
              <p className="text-3xl font-bold text-green-600">{attendanceSummary.present}</p>
              <Link to="/app/student/attendance" className="text-blue-600 hover:underline">View Details</Link>
            </div>
            <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700">Days Absent</h4>
              <p className="text-3xl font-bold text-red-600">{attendanceSummary.absent}</p>
              <Link to="/app/student/attendance" className="text-blue-600 hover:underline">View Details</Link>
            </div>
            <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700">Average Marks</h4>
              <p className="text-3xl font-bold text-purple-600">{averageMarks}</p>
              <Link to="/app/student/marks" className="text-blue-600 hover:underline">View Details</Link>
            </div>
          </div>

          {/* Quick Links / Other sections */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/app/announcements"
                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200"
              >
                View Announcements
              </Link>
              {/* Add more quick links as needed */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentDashboard;