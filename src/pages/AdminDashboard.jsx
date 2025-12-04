import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Users, GraduationCap, School, Megaphone, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

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

function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, announcements: 0 });
  const [classDistribution, setClassDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { count: students } = await supabase.from('students').select('*', { count: 'exact', head: true });
        const { count: teachers } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
        const { data: classes, count: classCount } = await supabase.from('classes').select('id, name, students(id)', { count: 'exact' });
        const { count: announcements } = await supabase.from('announcements').select('*', { count: 'exact', head: true });

        setStats({ students, teachers, classes: classCount, announcements });
        
        const distribution = classes.map(c => ({
          name: c.name,
          studentCount: c.students.length,
        }));
        setClassDistribution(distribution);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const classDistributionChartData = useMemo(() => ({
    labels: classDistribution.map(c => c.name),
    datasets: [
      {
        data: classDistribution.map(c => c.studentCount),
        backgroundColor: ['#3B82F6', '#10B981', '#F97316', '#EF4444', '#8B5CF6', '#F59E0B'],
        hoverBackgroundColor: ['#2563EB', '#059669', '#EA580C', '#DC2626', '#7C3AED', '#D97706'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  }), [classDistribution]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Student Distribution per Class',
        font: { size: 18 },
        padding: { bottom: 20 }
      },
    },
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">A quick overview of the school's status.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Students" value={stats.students} icon={<Users className="w-6 h-6 text-blue-600" />} color="text-blue-600" linkTo="/app/admin/students" />
        <StatCard title="Total Teachers" value={stats.teachers} icon={<GraduationCap className="w-6 h-6 text-green-600" />} color="text-green-600" linkTo="/app/admin/teachers" />
        <StatCard title="Total Classes" value={stats.classes} icon={<School className="w-6 h-6 text-orange-500" />} color="text-orange-500" linkTo="/app/admin/classes" />
        <StatCard title="Announcements" value={stats.announcements} icon={<Megaphone className="w-6 h-6 text-red-500" />} color="text-red-500" linkTo="/app/announcements" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="relative h-96 w-full max-w-2xl mx-auto">
          <Doughnut data={classDistributionChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;