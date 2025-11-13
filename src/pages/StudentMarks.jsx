import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      setLoading(true);
      // Placeholder for fetching the logged-in student's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: studentData } = await supabase.from('students').select('id').eq('email', user.email).single();
        if (studentData) {
          const { data, error } = await supabase.from('marks').select('*').eq('student_id', studentData.id);
          if (error) console.error('Error fetching marks:', error);
          else setMarks(data);
        }
      }
      setLoading(false);
    };
    fetchMarks();
  }, []);

  const chartData = {
    labels: marks.map(m => m.subject),
    datasets: [
      {
        label: 'Marks',
        data: marks.map(m => m.marks),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Marks</h1>
      {loading ? (
        <p>Loading marks...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Performance</h2>
            <Bar data={chartData} />
          </div>
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marks.map((mark) => (
                  <tr key={mark.id}>
                    <td className="px-6 py-4">{mark.subject}</td>
                    <td className="px-6 py-4">{mark.marks}</td>
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

export default StudentMarks;
