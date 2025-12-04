import { supabase } from '../supabaseClient';

const teachersToCreate = [
  { name: 'Dr. Alan Turing', email: 'alan.turing@example.com', password: 'password' },
  { name: 'Dr. Marie Curie', email: 'marie.curie@example.com', password: 'password' },
];

const studentsToCreate = [
  { name: 'John Doe', email: 'john.doe@example.com', password: 'password' },
  { name: 'Jane Smith', email: 'jane.smith@example.com', password: 'password' },
  { name: 'Peter Jones', email: 'peter.jones@example.com', password: 'password' },
  { name: 'Mary Williams', email: 'mary.williams@example.com', password: 'password' },
];

const announcements = [
  {
    title: 'Welcome to the New School Year!',
    description: 'We are excited to start a new year of learning and growth.',
  },
  {
    title: 'Mid-Term Exams Schedule',
    description: 'The mid-term exams will be held from December 10th to December 15th.',
  },
];

// Seeding Function
export const seedSupabase = async () => {
  try {
    console.log('Starting Supabase seeding process...');



    // 2. --- CHECK IF SEEDING IS NEEDED ---
    const { data: existingTeacher } = await supabase.from('users').select('id').eq('email', 'alan.turing@example.com').single();
    if (existingTeacher) {
      console.log('Mock data already exists. Skipping seeding.');
      return;
    }

    console.log('Seeding new mock data...');

    // 3. --- CREATE TEACHER USERS ---
    const createdTeachers = [];
    for (const teacher of teachersToCreate) {
      const { data: authData, error: signUpError } = await supabase.auth.signUp(teacher);
      if (signUpError && !signUpError.message.includes('User already registered')) throw signUpError;
      
      const user = authData.user || (await supabase.auth.signInWithPassword(teacher)).data.user;
      if (!user) throw new Error(`Failed to create or sign in teacher: ${teacher.email}`);

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .upsert({ id: user.id, name: teacher.name, email: teacher.email, role: 'teacher' }, { onConflict: 'id' })
        .select()
        .single();
      if (profileError) throw profileError;
      createdTeachers.push(profile);
    }
    console.log('Teacher users created.');

    // 4. --- CREATE STUDENT USERS & PROFILES ---
    const createdStudents = [];
    for (const student of studentsToCreate) {
      const { data: authData, error: signUpError } = await supabase.auth.signUp(student);
      if (signUpError && !signUpError.message.includes('User already registered')) throw signUpError;

      const user = authData.user || (await supabase.auth.signInWithPassword(student)).data.user;
      if (!user) throw new Error(`Failed to create or sign in student: ${student.email}`);

      // Create a profile in `public.users` for role-based access
      const { error: profileError } = await supabase
        .from('users')
        .upsert({ id: user.id, name: student.name, email: student.email, role: 'student' }, { onConflict: 'id' });
      if (profileError) throw profileError;

      // Create a corresponding entry in `public.students`
      const { data: studentProfile, error: studentProfileError } = await supabase
        .from('students')
        .upsert({ name: student.name, email: student.email }, { onConflict: 'email' })
        .select()
        .single();
      if (studentProfileError) throw studentProfileError;
      createdStudents.push(studentProfile);
    }
    console.log('Student users and profiles created.');

    // 5. --- CREATE CLASSES AND ASSIGN TEACHERS ---
    const classesToCreate = [
      { name: 'Grade 10 Maths', teacher_id: createdTeachers[0].id },
      { name: 'Grade 11 Physics', teacher_id: createdTeachers[1].id },
    ];
    const { data: insertedClasses, error: classError } = await supabase.from('classes').insert(classesToCreate).select();
    if (classError) throw classError;
    console.log('Classes created.');

    // 6. --- ASSIGN STUDENTS TO CLASSES ---
    const studentUpdates = [
      { id: createdStudents[0].id, class_id: insertedClasses[0].id },
      { id: createdStudents[1].id, class_id: insertedClasses[0].id },
      { id: createdStudents[2].id, class_id: insertedClasses[1].id },
      { id: createdStudents[3].id, class_id: insertedClasses[1].id },
    ];
    const { error: studentUpdateError } = await supabase.from('students').upsert(studentUpdates);
    if (studentUpdateError) throw studentUpdateError;
    console.log('Students assigned to classes.');

    // 7. --- SEED ANNOUNCEMENTS ---
    const { error: announcementError } = await supabase.from('announcements').insert(announcements.map(a => ({ ...a, created_by: null })));
    if (announcementError) throw announcementError;
    console.log('Announcements seeded.');

    // 8. --- SEED ATTENDANCE & MARKS ---
    const attendanceData = [];
    const marksData = [];
    const subjects = ['Maths', 'Physics', 'Chemistry', 'Biology'];
    const today = new Date();

    for (const student of createdStudents) {
      // Attendance
      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        attendanceData.push({
          student_id: student.id,
          class_id: studentUpdates.find(u => u.id === student.id).class_id,
          date: date.toISOString().split('T')[0],
          status: Math.random() > 0.1 ? 'Present' : 'Absent',
        });
      }
      // Marks
      for (const subject of subjects) {
        marksData.push({
          student_id: student.id,
          subject: subject,
          marks: Math.floor(Math.random() * 41) + 60,
        });
      }
    }
    const { error: attendanceError } = await supabase.from('attendance').insert(attendanceData);
    if (attendanceError) throw attendanceError;
    const { error: marksError } = await supabase.from('marks').insert(marksData);
    if (marksError) throw marksError;
    console.log('Attendance and marks seeded.');



  } catch (error) {
    console.error('Error seeding Supabase:', error.message);
  }
};
