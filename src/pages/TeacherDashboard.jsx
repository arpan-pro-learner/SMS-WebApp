import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useClassStore from '../store/classStore';
import useStudentStore from '../store/studentStore';
import useAttendanceStore from '../store/attendanceStore';
import { supabase } from '../supabaseClient';

function TeacherDashboard() {
  const { classes, fetchClasses } = useClassStore();
  const { students, fetchStudents } = useStudentStore();
  const { attendanceRecords, fetchAttendance, markAttendance } = useAttendanceStore();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [attendanceStatus, setAttendanceStatus] = useState({}); // { student_id: 'present' | 'absent' }
  const [teacherId, setTeacherId] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  useEffect(() => {
    const getTeacherId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();
        if (profile) {
          setTeacherId(profile.id);
        }
      }
      setLoadingTeacher(false);
    };
    getTeacherId();
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents({ class_id: selectedClass });
      fetchAttendance({ date: selectedDate, class_id: selectedClass }); // Assuming attendance can be filtered by class_id
    }
  }, [selectedClass, selectedDate, fetchStudents, fetchAttendance]);

  useEffect(() => {
    // Initialize attendance status based on fetched students and existing records
    const initialStatus = {};
    students.forEach(student => {
      const record = attendanceRecords.find(ar => ar.student_id === student.id && ar.date === selectedDate);
      initialStatus[student.id] = record ? record.status : 'absent'; // Default to absent if no record
    });
    setAttendanceStatus(initialStatus);
  }, [students, attendanceRecords, selectedDate]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceStatus(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass || !selectedDate || !teacherId) {
      alert('Please select a class and date, and ensure teacher ID is available.');
      return;
    }

    for (const student of students) {
      const status = attendanceStatus[student.id] || 'absent';
      const existingRecord = attendanceRecords.find(ar => ar.student_id === student.id && ar.date === selectedDate);

      if (existingRecord) {
        // Update existing record
        await supabase
          .from('attendance')
          .update({ status, teacher_id: teacherId })
          .eq('id', existingRecord.id);
      } else {
        // Insert new record
        await markAttendance({
          student_id: student.id,
          class_id: selectedClass,
          date: selectedDate,
          status,
          teacher_id: teacherId,
        });
      }
    }
    alert('Attendance submitted successfully!');
    fetchAttendance({ date: selectedDate, class_id: selectedClass }); // Re-fetch to update UI
  };

  if (loadingTeacher) {
    return <Layout><div>Loading teacher data...</div></Layout>;
  }

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Teacher Dashboard</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Mark Attendance</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="class-select" className="block text-sm font-medium text-gray-700">Select Class</label>
            <select
              id="class-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Select a Class --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date-select" className="block text-sm font-medium text-gray-700">Select Date</label>
            <input
              type="date"
              id="date-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {selectedClass && students.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-700 mb-3">Students in {classes.find(c => c.id === selectedClass)?.name}</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 border-b-2 border-gray-200">Student Name</th>
                    <th className="px-6 py-3 border-b-2 border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <label className="inline-flex items-center mr-4">
                          <input
                            type="radio"
                            className="form-radio"
                            name={`attendance-${student.id}`}
                            value="present"
                            checked={attendanceStatus[student.id] === 'present'}
                            onChange={() => handleAttendanceChange(student.id, 'present')}
                          />
                          <span className="ml-2">Present</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio"
                            name={`attendance-${student.id}`}
                            value="absent"
                            checked={attendanceStatus[student.id] === 'absent'}
                            onChange={() => handleAttendanceChange(student.id, 'absent')}
                          />
                          <span className="ml-2">Absent</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleSubmitAttendance}
              className="mt-4 px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Submit Attendance
            </button>
          </div>
        )}

        {selectedClass && students.length === 0 && (
          <p className="text-gray-600">No students found for this class. Please add students first.</p>
        )}
      </div>
    </Layout>
  );
}

export default TeacherDashboard;
