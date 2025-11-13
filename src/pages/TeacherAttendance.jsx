import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function TeacherAttendance() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    // This is a placeholder. In a real app, you'd fetch classes assigned to the logged-in teacher.
    const { data, error } = await supabase.from('classes').select('*');
    if (error) console.error('Error fetching classes:', error);
    else setClasses(data);
  };

  const fetchStudentsAndAttendance = async () => {
    if (!selectedClass || !date) return;
    setLoading(true);

    // Fetch students in the selected class
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', selectedClass);
    if (studentsError) console.error('Error fetching students:', studentsError);
    else setStudents(studentsData);

    // Fetch existing attendance for the selected date
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

  useEffect(() => {
    fetchStudentsAndAttendance();
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

    // Upsert to handle both new and existing records
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mark Attendance</h1>
      <div className="flex space-x-4 mb-6">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-2 border rounded"
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
          className="p-2 border rounded"
        />
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
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
          <div className="p-4 text-right">
            <button onClick={handleSaveAttendance} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save Attendance</button>
          </div>
        </div>
      ) : (
        <p>Select a class and date to see students.</p>
      )}
    </div>
  );
}

export default TeacherAttendance;
