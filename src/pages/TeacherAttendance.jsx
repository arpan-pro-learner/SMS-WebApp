import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useUserStore from '../store/userStore';

function TeacherAttendance() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUserStore();

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        let teacherId = null;

        if (user.originalRole === 'admin' && user.role === 'teacher') {
          const { data: teachers, error: teacherError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'teacher')
            .limit(1);
            
          if (teacherError) throw teacherError;
          if (!teachers || teachers.length === 0) throw new Error("No teachers found to display.");
          teacherId = teachers[0].id;
        } else {
          teacherId = user.id;
        }

        const { data, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', teacherId);
        
        if (classesError) {
          throw classesError;
        } else {
          setClasses(data);
        }
      } catch (err) {
        console.error('Error fetching teacher data:', err);
        setError('Failed to fetch your classes.');
      }
      setLoading(false);
    };

    fetchTeacherClasses();
  }, [user]);

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedClass || !date) {
        setStudents([]);
        setAttendance({});
        return;
      };
      setLoading(true);
      setError(null);

      try {
        // Fetch students in the selected class
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', selectedClass);
        if (studentsError) throw studentsError;
        setStudents(studentsData);

        // Fetch existing attendance for the selected date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('date', date);
        
        if (attendanceError) throw attendanceError;
        
        const attendanceMap = attendanceData.reduce((acc, record) => {
          acc[record.student_id] = record.status;
          return acc;
        }, {});
        setAttendance(attendanceMap);
      } catch (err) {
        console.error('Error fetching students and attendance:', err);
        setError('Failed to load class data.');
      }
      setLoading(false);
    };

    fetchStudentsAndAttendance();
  }, [selectedClass, date]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    setError(null);
    const records = students
      .filter(student => attendance[student.id]) // Only upsert students with a status
      .map(student => ({
        student_id: student.id,
        class_id: selectedClass,
        date,
        status: attendance[student.id],
    }));

    if (records.length === 0) {
        alert("No attendance changes to save.");
        setLoading(false);
        return;
    }

    // Upsert to handle both new and existing records
    const { error } = await supabase.from('attendance').upsert(records, {
      onConflict: 'student_id, date',
    });

    if (error) {
      console.error('Error saving attendance:', error.message, error.details, error.hint, error);
      setError('Failed to save attendance.');
    } else {
      alert('Attendance saved successfully!'); // Replace with toast message later
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mark Attendance</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Select Class & Date</h3>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={loading || classes.length === 0}
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
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={loading}
          />
        </div>
      </div>

      {selectedClass && date && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h3 className="text-xl font-semibold text-gray-700 p-6 border-b border-gray-200">Students in {classes.find(c => c.id == selectedClass)?.name}</h3>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading students...</div>
          ) : students.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'Present')}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition duration-150 ease-in-out ${attendance[student.id] === 'Present' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-800'}`}
                            disabled={loading}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'Absent')}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition duration-150 ease-in-out ${attendance[student.id] === 'Absent' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-800'}`}
                            disabled={loading}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'Late')}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition duration-150 ease-in-out ${attendance[student.id] === 'Late' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-100 hover:text-yellow-800'}`}
                            disabled={loading}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 text-right border-t border-gray-200">
                <button
                  onClick={handleSaveAttendance}
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">No students found for this class.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default TeacherAttendance;
