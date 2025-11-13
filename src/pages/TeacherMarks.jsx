import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function TeacherMarks() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [marks, setMarks] = useState([]);
  const [subjects, setSubjects] = useState(['Math', 'Science', 'English', 'History']); // Example subjects
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    // Placeholder for fetching classes assigned to the logged-in teacher
    const { data, error } = await supabase.from('classes').select('*');
    if (error) console.error('Error fetching classes:', error);
    else setClasses(data);
  };

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsInClass();
    } else {
      setStudents([]);
      setSelectedStudent('');
    }
  }, [selectedClass]);

  const fetchStudentsInClass = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*').eq('class_id', selectedClass);
    if (error) console.error('Error fetching students:', error);
    else setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchMarksForStudent();
    } else {
      setMarks([]);
    }
  }, [selectedStudent]);

  const fetchMarksForStudent = async () => {
    const { data, error } = await supabase.from('marks').select('*').eq('student_id', selectedStudent);
    if (error) {
      console.error('Error fetching marks:', error);
    } else {
      const marksMap = data.reduce((acc, mark) => {
        acc[mark.subject] = mark.marks;
        return acc;
      }, {});
      setMarks(marksMap);
    }
  };

  const handleMarkChange = (subject, value) => {
    setMarks({ ...marks, [subject]: value });
  };

  const handleSaveChanges = async () => {
    const records = Object.entries(marks).map(([subject, markValue]) => ({
      student_id: selectedStudent,
      subject,
      marks: markValue,
    }));

    // Upsert to handle both new and existing marks
    const { error } = await supabase.from('marks').upsert(records, {
      onConflict: 'student_id, subject',
    });

    if (error) {
      console.error('Error saving marks:', error);
      alert('Failed to save marks.');
    } else {
      alert('Marks saved successfully!');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Enter Marks</h1>
      <div className="flex space-x-4 mb-6">
        <select onChange={(e) => setSelectedClass(e.target.value)} value={selectedClass} className="p-2 border rounded">
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select onChange={(e) => setSelectedStudent(e.target.value)} value={selectedStudent} className="p-2 border rounded" disabled={!selectedClass}>
          <option value="">Select Student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {selectedStudent && !loading && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Marks for {students.find(s => s.id === selectedStudent)?.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map(subject => (
              <div key={subject} className="flex items-center">
                <label className="w-1/3">{subject}</label>
                <input
                  type="number"
                  value={marks[subject] || ''}
                  onChange={(e) => handleMarkChange(subject, e.target.value)}
                  className="w-2/3 p-2 border rounded"
                  placeholder="Enter marks"
                />
              </div>
            ))}
          </div>
          <div className="text-right mt-6">
            <button onClick={handleSaveChanges} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherMarks;
