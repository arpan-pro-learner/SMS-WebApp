import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState({});
  const [marks, setMarks] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState(['Math', 'Science', 'English', 'History']); // Example subjects

  useEffect(() => {
    const getTeacherId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setTeacherId(user.id);
      }
    };
    getTeacherId();
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    // In a real app, you'd fetch classes assigned to the logged-in teacher.
    // For now, fetching all classes.
    const { data, error } = await supabase.from('classes').select('*');
    if (error) console.error('Error fetching classes:', error);
    else setClasses(data);
  };

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsInClass();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const fetchStudentsInClass = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*').eq('class_id', selectedClass);
    if (error) console.error('Error fetching students:', error);
    else setStudents(data);
    setLoading(false);
  };

  const fetchAttendanceForClass = async () => {
    if (!selectedClass || !date) return;
    setLoading(true);
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('class_id', selectedClass)
      .eq('date', date);
    
    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError);
    } else {
      const attendanceMap = attendanceData.reduce((acc, record) => {
        acc[record.student_id] = record.status;
        return acc;
      }, {});
      setAttendance(attendanceMap);
    }
    setLoading(false);
  };

  const fetchMarksForClass = async () => {
    if (!selectedClass) return;
    const { data, error } = await supabase.from('marks').select('*, students(name)').eq('class_id', selectedClass);
    if (error) console.error('Error fetching marks:', error);
    else setMarks(data);
  };

  useEffect(() => {
    fetchAttendanceForClass();
    fetchMarksForClass();
  }, [selectedClass, date]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSaveAttendance = async () => {
    const records = Object.entries(attendance).map(([student_id, status]) => ({
      student_id,
      class_id: selectedClass,
      date,
      status,
    }));

    const { error } = await supabase.from('attendance').upsert(records, {
      onConflict: 'student_id, date',
    });

    if (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance.');
    } else {
      alert('Attendance saved successfully!');
    }
  };

  // Chart Data for Attendance
  const attendanceSummary = students.reduce((acc, student) => {
    const status = attendance[student.id] || 'Absent'; // Default to Absent if not marked
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { Present: 0, Absent: 0, Late: 0 });

  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [attendanceSummary.Present, attendanceSummary.Absent, attendanceSummary.Late],
        backgroundColor: ['#16A34A', '#DC2626', '#F59E0B'],
        hoverOffset: 4,
      },
    ],
  };

  // Chart Data for Marks (example: average marks per subject)
  const marksBySubject = marks.reduce((acc, mark) => {
    if (!acc[mark.subject]) {
      acc[mark.subject] = { total: 0, count: 0 };
    }
    acc[mark.subject].total += mark.marks;
    acc[mark.subject].count += 1;
    return acc;
  }, {});

  const averageMarks = Object.entries(marksBySubject).map(([subject, data]) => ({
    subject,
    average: data.total / data.count,
  }));

  const marksChartData = {
    labels: averageMarks.map(m => m.subject),
    datasets: [
      {
        label: 'Average Marks',
        data: averageMarks.map(m => m.average),
        backgroundColor: '#2563EB',
      },
    ],
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Teacher Dashboard</h2>

      {/* Class and Date Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Select Class & Date</h3>
        <div className="flex space-x-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="">Select a Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded-lg"
          />
        </div>
      </div>

      {selectedClass && (
        <>
          {/* Attendance Management */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Mark Attendance for {classes.find(c => c.id === selectedClass)?.name} on {date}</h3>
            {loading ? (
              <p>Loading students...</p>
            ) : students.length > 0 ? (
              <>
                <table className="min-w-full divide-y divide-gray-200 mb-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4">{student.name}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button onClick={() => handleAttendanceChange(student.id, 'Present')} className={`px-3 py-1 rounded-full text-xs ${attendance[student.id] === 'Present' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Present</button>
                            <button onClick={() => handleAttendanceChange(student.id, 'Absent')} className={`px-3 py-1 rounded-full text-xs ${attendance[student.id] === 'Absent' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Absent</button>
                            <button onClick={() => handleAttendanceChange(student.id, 'Late')} className={`px-3 py-1 rounded-full text-xs ${attendance[student.id] === 'Late' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>Late</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right">
                  <button onClick={handleSaveAttendance} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save Attendance</button>
                </div>
              </>
            ) : (
              <p>No students found for this class.</p>
            )}
          </div>

          {/* Attendance Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Attendance Summary for {classes.find(c => c.id === selectedClass)?.name}</h3>
            <div className="w-full md:w-1/2 mx-auto">
              <Doughnut data={attendanceChartData} />
            </div>
          </div>

          {/* Marks Management (Simplified for Dashboard) */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Marks Overview for {classes.find(c => c.id === selectedClass)?.name}</h3>
            {marks.length > 0 ? (
              <>
                <table className="min-w-full divide-y divide-gray-200 mb-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      {subjects.map(subject => (
                        <th key={subject} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{subject}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => {
                      const studentMarks = marks.filter(m => m.student_id === student.id);
                      return (
                        <tr key={student.id}>
                          <td className="px-6 py-4">{student.name}</td>
                          {subjects.map(subject => (
                            <td key={subject} className="px-6 py-4">
                              {studentMarks.find(m => m.subject === subject)?.marks || 'N/A'}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="text-right">
                  <button onClick={() => alert('Navigate to full marks management')} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Manage Marks</button>
                </div>
              </>
            ) : (
              <p>No marks recorded for this class yet.</p>
            )}
          </div>

          {/* Marks Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Average Marks by Subject for {classes.find(c => c.id === selectedClass)?.name}</h3>
            {averageMarks.length > 0 ? (
              <Bar data={marksChartData} />
            ) : (
              <p>No marks data to display chart.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TeacherDashboard;