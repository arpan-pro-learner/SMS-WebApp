import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useClassStore from '../store/classStore';
import useStudentStore from '../store/studentStore';
import useAttendanceStore from '../store/attendanceStore';
import useMarksStore from '../store/marksStore'; // Import the new marks store
import { supabase } from '../supabaseClient';

function TeacherDashboard() {
  const { classes, fetchClasses } = useClassStore();
  const { students, fetchStudents } = useStudentStore();
  const { attendanceRecords, fetchAttendance, markAttendance } = useAttendanceStore();
  const { marksRecords, fetchMarks, addMark, updateMark } = useMarksStore(); // Destructure marks store actions

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [attendanceStatus, setAttendanceStatus] = useState({}); // { student_id: 'present' | 'absent' }
  const [teacherId, setTeacherId] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  // State for Marks Management
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studentMarks, setStudentMarks] = useState({}); // { student_id: mark_value }

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
      fetchAttendance({ date: selectedDate, class_id: selectedClass });
      fetchMarks({ class_id: selectedClass, subject: selectedSubject }); // Fetch marks for selected class and subject
    }
  }, [selectedClass, selectedDate, selectedSubject, fetchStudents, fetchAttendance, fetchMarks]);

  useEffect(() => {
    // Initialize attendance status based on fetched students and existing records
    const initialStatus = {};
    students.forEach(student => {
      const record = attendanceRecords.find(ar => ar.student_id === student.id && ar.date === selectedDate);
      initialStatus[student.id] = record ? record.status : 'absent'; // Default to absent if no record
    });
    setAttendanceStatus(initialStatus);

    // Initialize student marks based on fetched students and existing marks records
    const initialMarks = {};
    students.forEach(student => {
      const mark = marksRecords.find(mr => mr.student_id === student.id && mr.subject === selectedSubject);
      initialMarks[student.id] = mark ? mark.marks : ''; // Default to empty if no mark
    });
    setStudentMarks(initialMarks);
  }, [students, attendanceRecords, selectedDate, marksRecords, selectedSubject]);

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
        await supabase
          .from('attendance')
          .update({ status, teacher_id: teacherId })
          .eq('id', existingRecord.id);
      } else {
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
    fetchAttendance({ date: selectedDate, class_id: selectedClass });
  };

  const handleMarkChange = (studentId, mark) => {
    setStudentMarks(prev => ({ ...prev, [studentId]: mark }));
  };

  const handleSubmitMarks = async () => {
    if (!selectedClass || !selectedSubject || !teacherId) {
      alert('Please select a class and subject, and ensure teacher ID is available.');
      return;
    }

    for (const student of students) {
      const markValue = studentMarks[student.id];
      if (markValue === '' || markValue === undefined) continue; // Skip if no mark entered

      const existingMark = marksRecords.find(mr => mr.student_id === student.id && mr.subject === selectedSubject);

      if (existingMark) {
        await updateMark(existingMark.id, { marks: markValue, teacher_id: teacherId });
      } else {
        await addMark({
          student_id: student.id,
          class_id: selectedClass,
          subject: selectedSubject,
          marks: markValue,
          teacher_id: teacherId,
        });
      }
    }
    alert('Marks submitted successfully!');
    fetchMarks({ class_id: selectedClass, subject: selectedSubject }); // Re-fetch to update UI
  };

  if (loadingTeacher) {
    return <Layout><div>Loading teacher data...</div></Layout>;
  }

  // Dummy subjects for now, ideally fetched from a 'subjects' table
  const subjects = ['Math', 'Science', 'History', 'English'];

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Teacher Dashboard</h2>

      {/* Attendance Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Mark Attendance</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="class-select-attendance" className="block text-sm font-medium text-gray-700">Select Class</label>
            <select
              id="class-select-attendance"
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

      {/* Marks Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Input Marks</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="class-select-marks" className="block text-sm font-medium text-gray-700">Select Class</label>
            <select
              id="class-select-marks"
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
            <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700">Select Subject</label>
            <select
              id="subject-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">-- Select a Subject --</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedClass && selectedSubject && students.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-700 mb-3">Marks for {selectedSubject} in {classes.find(c => c.id === selectedClass)?.name}</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 border-b-2 border-gray-200">Student Name</th>
                    <th className="px-6 py-3 border-b-2 border-gray-200">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentMarks[student.id] || ''}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleSubmitMarks}
              className="mt-4 px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Marks
            </button>
          </div>
        )}

        {selectedClass && selectedSubject && students.length === 0 && (
          <p className="text-gray-600">No students found for this class. Please add students first.</p>
        )}
      </div>
    </Layout>
  );
}

export default TeacherDashboard;
