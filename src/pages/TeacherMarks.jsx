import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BookMarked, User, Edit, Trash2, Save, AlertCircle, Info } from 'lucide-react';

function TeacherMarks() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState({ classes: false, students: false, marks: false });
  const [error, setError] = useState(null);

  const { control, handleSubmit, reset, setValue } = useForm();

  const fetchTeacherClasses = useCallback(async () => {
    setLoading(prev => ({ ...prev, classes: true }));
    try {
      const { data, error } = await supabase.from('classes').select('id, name');
      if (error) throw error;
      setClasses(data);
    } catch (err) {
      setError('Failed to fetch classes.');
      toast.error('Failed to fetch classes.');
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  }, []);

  useEffect(() => {
    fetchTeacherClasses();
  }, [fetchTeacherClasses]);

  const fetchStudentsInClass = useCallback(async (classId) => {
    if (!classId) {
      setStudents([]);
      setSelectedStudent(null);
      return;
    }
    setLoading(prev => ({ ...prev, students: true }));
    try {
      const { data, error } = await supabase.from('students').select('id, name').eq('class_id', classId);
      if (error) throw error;
      setStudents(data);
    } catch (err) {
      setError('Failed to fetch students.');
      toast.error('Failed to fetch students.');
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  }, []);

  const fetchMarksForStudent = useCallback(async (studentId) => {
    if (!studentId) {
      setMarks([]);
      return;
    }
    setLoading(prev => ({ ...prev, marks: true }));
    try {
      const { data, error } = await supabase.from('marks').select('*').eq('student_id', studentId);
      if (error) throw error;
      setMarks(data);
      // Set form values
      data.forEach(mark => setValue(mark.subject, mark.marks));
    } catch (err) {
      setError('Failed to fetch marks.');
      toast.error('Failed to fetch marks.');
    } finally {
      setLoading(prev => ({ ...prev, marks: false }));
    }
  }, [setValue]);

  useEffect(() => {
    fetchStudentsInClass(selectedClass);
  }, [selectedClass, fetchStudentsInClass]);

  useEffect(() => {
    fetchMarksForStudent(selectedStudent?.id);
  }, [selectedStudent, fetchMarksForStudent]);

  const onSaveChanges = async (formData) => {
    const toastId = toast.loading('Saving marks...');
    try {
      const records = Object.entries(formData).map(([subject, markValue]) => ({
        student_id: selectedStudent.id,
        subject,
        marks: parseInt(markValue, 10),
      }));

      const { error } = await supabase.from('marks').upsert(records, { onConflict: 'student_id, subject' });
      if (error) throw error;

      toast.success('Marks saved successfully!', { id: toastId });
      fetchMarksForStudent(selectedStudent.id); // Refresh marks
    } catch (err) {
      toast.error('Failed to save marks.', { id: toastId });
    }
  };
  
  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student);
    reset(); // Reset form on student change
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BookMarked className="w-8 h-8 mr-3 text-blue-600" />
          Manage Student Marks
        </h1>
        <p className="text-sm text-gray-600 mt-1">Select a class and student to view or update their marks.</p>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex items-center mb-6" role="alert">
          <AlertCircle className="w-6 h-6 mr-3" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            id="class-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={loading.classes}
          >
            <option value="">{loading.classes ? 'Loading...' : 'Select a Class'}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-1">Student</label>
          <select
            id="student-select"
            value={selectedStudent?.id || ''}
            onChange={(e) => handleStudentChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedClass || loading.students}
          >
            <option value="">{loading.students ? 'Loading...' : 'Select a Student'}</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {selectedStudent ? (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Edit className="w-6 h-6 mr-2 text-blue-600" />
            Editing Marks for: <span className="ml-2 font-bold">{selectedStudent.name}</span>
          </h2>
          {loading.marks ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading Marks...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSaveChanges)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {['Math', 'Science', 'English', 'History', 'Geography', 'Art'].map(subject => (
                  <div key={subject}>
                    <label htmlFor={subject} className="block text-sm font-medium text-gray-700 mb-1">{subject}</label>
                    <Controller
                      name={subject}
                      control={control}
                      defaultValue={marks.find(m => m.subject === subject)?.marks || ''}
                      render={({ field }) => (
                        <input
                          {...field}
                          id={subject}
                          type="number"
                          min="0"
                          max="100"
                          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0-100"
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
              <div className="text-right mt-6 pt-4 border-t">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
          <Info size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Student</h3>
          <p className="mt-1 text-sm text-gray-500">Please select a class and a student to manage their marks.</p>
        </div>
      )}
    </div>
  );
}

export default TeacherMarks;
