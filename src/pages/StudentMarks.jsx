import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BookOpen, Award, TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import useUserStore from '../store/userStore';

// ... (rest of the imports)

// ... (ChartJS registration)

function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUserStore();

  useEffect(() => {
    const fetchMarks = async () => {
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
          // Case 2: A regular student is viewing their own marks
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('id')
            .eq('email', user.email)
            .single();

          if (studentError) throw studentError;
          studentId = studentData.id;
        }

        const { data, error: marksError } = await supabase
          .from('marks')
          .select('id, subject, marks')
          .eq('student_id', studentId);
            
        if (marksError) throw marksError;

        setMarks(data);
      } catch (err) {
        console.error('Error fetching marks:', err);
        setError('Failed to fetch your marks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [user]);

  const chartData = {
    labels: marks.map((m) => m.subject),
    datasets: [
      {
        label: 'Marks Obtained',
        data: marks.map((m) => m.marks),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Subject-wise Performance',
        font: {
          size: 16,
        },
        padding: {
          bottom: 20,
        },
      },
    },
  };

  const averageMarks = marks.length > 0 ? (marks.reduce((acc, m) => acc + m.marks, 0) / marks.length).toFixed(2) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Marks</h1>
        <p className="text-sm text-gray-600 mt-1">An overview of your academic performance.</p>
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{marks.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageMarks}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-96">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
            <div className="xl:col-span-1 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="w-6 h-6 mr-2 text-blue-600" />
                Detailed Marks
              </h2>
              {marks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-500">No marks have been uploaded yet.</p>
                  <p className="text-sm text-gray-400">Your results will appear here once available.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="min-w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {marks.map((mark) => (
                        <tr key={mark.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{mark.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-700">{mark.marks} / 100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentMarks;
