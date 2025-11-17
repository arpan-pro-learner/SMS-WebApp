import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Megaphone, ArrowRight, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon, color, linkTo }) => (
  <Link to={linkTo} className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-')}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm text-gray-500 hover:text-blue-600">
      <span>View Details</span>
      <ArrowRight className="w-4 h-4 ml-1" />
    </div>
  </Link>
);

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, absent: 0, late: 0 });
  const [averageMarks, setAverageMarks] = useState(0);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, name, email')
          .eq('email', user.email)
          .single();
        if (studentError) throw studentError;
        setStudent(studentData);

        // Fetch Attendance
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', studentData.id);
        if (attendanceError) throw attendanceError;
        const summary = attendanceData.reduce((acc, record) => {
          acc[record.status.toLowerCase()] = (acc[record.status.toLowerCase()] || 0) + 1;
          return acc;
        }, { present: 0, absent: 0, late: 0 });
        setAttendanceSummary(summary);

        // Fetch Marks
        const { data: marksData, error: marksError } = await supabase
          .from('marks')
          .select('marks')
          .eq('student_id', studentData.id);
        if (marksError) throw marksError;
        const totalMarks = marksData.reduce((sum, record) => sum + record.marks, 0);
        const avg = marksData.length > 0 ? (totalMarks / marksData.length).toFixed(1) : 0;
        setAverageMarks(avg);

        // Fetch Recent Announcements
        const { data: announcements, error: announcementError } = await supabase
          .from('announcements')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(3);
        if (announcementError) throw announcementError;
        setRecentAnnouncements(announcements);

      } catch (err) {
        console.error("Error fetching student dashboard data:", err);
        setError("Failed to load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md flex items-center" role="alert">
          <AlertCircle className="w-8 h-8 mr-4" />
          <div>
            <p className="font-bold text-lg">An error occurred</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back, {student?.name || 'Student'}!</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <StatCard title="Days Present" value={attendanceSummary.present} icon={<CheckCircle className="w-6 h-6 text-green-600" />} color="text-green-600" linkTo="/student-attendance" />
        <StatCard title="Days Absent" value={attendanceSummary.absent} icon={<XCircle className="w-6 h-6 text-red-600" />} color="text-red-600" linkTo="/student-attendance" />
        <StatCard title="Average Score" value={`${averageMarks}%`} icon={<Award className="w-6 h-6 text-purple-600" />} color="text-purple-600" linkTo="/student-marks" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Megaphone className="w-6 h-6 mr-2 text-blue-600" />
          Recent Announcements
        </h2>
        {recentAnnouncements.length > 0 ? (
          <ul className="space-y-3">
            {recentAnnouncements.map(ann => (
              <li key={ann.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Link to="/announcements" className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{ann.title}</span>
                  <span className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent announcements.</p>
        )}
        <div className="mt-4">
          <Link to="/announcements" className="text-sm font-medium text-blue-600 hover:underline flex items-center">
            View All Announcements <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;