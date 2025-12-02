
import { supabase } from '../supabaseClient';

// Mock Data
const classes = [
  { name: 'Grade 10 Maths', teacher_id: null },
  { name: 'Grade 11 Physics', teacher_id: null },
];

const teachers = [
  { name: 'Dr. Alan Turing', email: 'alan.turing@example.com' },
  { name: 'Dr. Marie Curie', email: 'marie.curie@example.com' },
];

const students = [
  { name: 'John Doe', class_id: null },
  { name: 'Jane Smith', class_id: null },
  { name: 'Peter Jones', class_id: null },
  { name: 'Mary Williams', class_id: null },
];

const announcements = [
  {
    title: 'Welcome to the New School Year!',
    description: 'We are excited to start a new year of learning and growth. Please check your schedules and class assignments.',
    created_by: 'Admin',
  },
  {
    title: 'Mid-Term Exams Schedule',
    description: 'The mid-term exams will be held from December 10th to December 15th. The detailed schedule is available on the portal.',
    created_by: 'Admin',
  },
];

// Seeding Function
export const seedSupabase = async () => {
  try {
    // 0. Ensure Demo Admin User exists
    const demoEmail = 'demo@example.com';
    const demoPassword = 'password';

    // Check if the user already exists in the auth schema
    // Note: This is a simplified check. In a real app, you might not have access to query auth.users.
    // We are assuming that if a profile exists, the auth user does too.
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', demoEmail)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking for demo user:', userCheckError);
    }
    
    if (!existingUser) {
      console.log('Creating demo admin user...');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
      });

      if (signUpError) {
        // If the user already exists in auth but not in the public.users table
        if (signUpError.message.includes('User already registered')) {
            console.warn('Auth user exists but profile was missing. You may need to clean up inconsistent data.');
        } else {
            throw signUpError;
        }
      }

      // If signUp was successful, authData.user will be defined
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ id: authData.user.id, name: 'Demo Admin', email: demoEmail, role: 'admin' }]);
        if (profileError) throw profileError;
        console.log('Demo admin user created successfully.');
      }
    }

    // 1. Check if data has already been seeded to prevent duplication
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', 'alan.turing@example.com')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116: 'exact one row not found'
      console.error('Error checking for existing data:', checkError);
      return;
    }
    
    if (existingTeacher) {
      console.log('Mock data already exists. Skipping seeding.');
      return;
    }


    console.log('Seeding mock data...');

    // 2. Insert Teachers and get their IDs
    const { data: insertedTeachers, error: teacherError } = await supabase
      .from('teachers')
      .insert(teachers)
      .select();
    if (teacherError) throw teacherError;

    // 3. Assign teacher IDs to classes
    classes[0].teacher_id = insertedTeachers[0].id;
    classes[1].teacher_id = insertedTeachers[1].id;

    // 4. Insert Classes and get their IDs
    const { data: insertedClasses, error: classError } = await supabase
      .from('classes')
      .insert(classes)
      .select();
    if (classError) throw classError;

    // 5. Assign class IDs to students
    students[0].class_id = insertedClasses[0].id;
    students[1].class_id = insertedClasses[0].id;
    students[2].class_id = insertedClasses[1].id;
    students[3].class_id = insertedClasses[1].id;

    // 6. Insert Students and get their IDs
    const { data: insertedStudents, error: studentError } = await supabase
      .from('students')
      .insert(students)
      .select();
    if (studentError) throw studentError;

    // 7. Insert Announcements
    const { error: announcementError } = await supabase.from('announcements').insert(announcements);
    if (announcementError) throw announcementError;

    // 8. Generate Mock Attendance Data
    const attendanceData = [];
    const today = new Date();
    for (const student of insertedStudents) {
      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        attendanceData.push({
          student_id: student.id,
          date: date.toISOString().split('T')[0],
          status: Math.random() > 0.1 ? 'Present' : 'Absent', // 90% present
        });
      }
    }
    const { error: attendanceError } = await supabase.from('attendance').insert(attendanceData);
    if (attendanceError) throw attendanceError;

    // 9. Generate Mock Marks Data
    const marksData = [];
    const subjects = ['Maths', 'Physics', 'Chemistry', 'Biology'];
    for (const student of insertedStudents) {
      for (const subject of subjects) {
        marksData.push({
          student_id: student.id,
          subject: subject,
          marks: Math.floor(Math.random() * 41) + 60, // Marks between 60 and 100
        });
      }
    }
    const { error: marksError } = await supabase.from('marks').insert(marksData);
    if (marksError) throw marksError;

    console.log('Mock data seeded successfully!');

  } catch (error) {
    console.error('Error seeding Supabase:', error.message);
  }
};
