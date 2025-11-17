import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BookCopy, Users, CalendarCheck, BarChart3, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [stats, setStats] = useState({ classes: 0, students: 0 });
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [marksSummary, setMarksSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const { data: teacherData, error: teacherError } = await supabase
          .from('users')
          .select('id, name')
          .eq('email', user.email)
          .eq('role', 'teacher')
          .single();
        
        if (teacherError) throw teacherError;
        
        if (teacherData) {
          const { data: classesData, error: classesError } = await supabase
            .from('classes')
            .select('id, name, students:students(id)')
            .eq('teacher_id', teacherData.id);

          if (classesError) throw classesError;

          teacherData.classes = classesData;
        }

        setTeacher(teacherData);

        const classIds = teacherData.classes.map(c => c.id);
        const studentCount = teacherData.classes.reduce((acc, c) => acc + c.students.length, 0);
        setStats({ classes: classIds.length, students: studentCount });

        const studentIds = teacherData.classes.flatMap(c => c.students.map(s => s.id));

        // Fetch aggregated attendance and marks for all assigned classes
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status')
          .in('class_id', classIds);
        if (attendanceError) throw attendanceError;
        
        const attSummary = attendanceData.reduce((acc, record) => {
          acc[record.status] = (acc[record.status] || 0) + 1;
          return acc;
        }, { Present: 0, Absent: 0, Late: 0 });
        setAttendanceSummary(attSummary);

        const { data: marksData, error: marksError } = await supabase
          .from('marks')
          .select('subject, marks')
          .in('student_id', studentIds);
        if (marksError) throw marksError;

        const marksBySubject = marksData.reduce((acc, mark) => {
          if (!acc[mark.subject]) acc[mark.subject] = [];
          acc[mark.subject].push(mark.marks);
          return acc;
        }, {});

        const avgMarks = Object.entries(marksBySubject).map(([subject, marks]) => ({
          subject,
          average: marks.reduce((a, b) => a + b, 0) / marks.length,
        }));
        setMarksSummary(avgMarks);

      } catch (err) {
        console.error("Error fetching teacher dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const attendanceChartData = useMemo(() => ({
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [attendanceSummary?.Present || 0, attendanceSummary?.Absent || 0, attendanceSummary?.Late || 0],
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
      hoverBackgroundColor: ['#059669', '#DC2626', '#D97706'],
      borderColor: '#fff',
      borderWidth: 2,
    }],
  }), [attendanceSummary]);

  const marksChartData = useMemo(() => ({
    labels: marksSummary?.map(m => m.subject) || [],
    datasets: [{
      label: 'Average Marks',
      data: marksSummary?.map(m => m.average) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }), [marksSummary]);

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
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back, {teacher?.name || 'Teacher'}. Here's your overview.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg"><div className="flex items-center"><div className="bg-blue-100 p-3 rounded-full"><BookCopy className="w-6 h-6 text-blue-600" /></div><div className="ml-4"><p className="text-sm text-gray-500">Assigned Classes</p><p className="text-2xl font-bold text-gray-900">{stats.classes}</p></div></div></div>
        <div className="bg-white p-6 rounded-xl shadow-lg"><div className="flex items-center"><div className="bg-green-100 p-3 rounded-full"><Users className="w-6 h-6 text-green-600" /></div><div className="ml-4"><p className="text-sm text-gray-500">Total Students</p><p className="text-2xl font-bold text-gray-900">{stats.students}</p></div></div></div>
        <Link to="/teacher-attendance" className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"><div className="flex items-center"><div className="bg-yellow-100 p-3 rounded-full"><CalendarCheck className="w-6 h-6 text-yellow-600" /></div><div className="ml-4"><p className="text-sm text-gray-500">Manage Attendance</p><p className="text-lg font-semibold text-gray-900 flex items-center">Go to page <ArrowRight className="w-4 h-4 ml-1" /></p></div></div></Link>
        <Link to="/teacher-marks" className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"><div className="flex items-center"><div className="bg-red-100 p-3 rounded-full"><BarChart3 className="w-6 h-6 text-red-600" /></div><div className="ml-4"><p className="text-sm text-gray-500">Manage Marks</p><p className="text-lg font-semibold text-gray-900 flex items-center">Go to page <ArrowRight className="w-4 h-4 ml-1" /></p></div></div></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Attendance Summary</h2>
          {attendanceSummary ? (
            <div className="relative h-72 w-full max-w-sm mx-auto">
              <Doughnut data={attendanceChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          ) : <Info className="mx-auto text-gray-400" />}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Average Marks Across Subjects</h2>
          {marksSummary && marksSummary.length > 0 ? (
            <div className="relative h-72">
              <Bar data={marksChartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } }} />
            </div>
          ) : <Info className="mx-auto text-gray-400" />}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;