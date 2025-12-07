import { supabase } from '../supabaseClient';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const teachersToCreate = [
    { name: 'Global Firms', email: 'torege9893@gusronk.com', password: 'password' },
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
    console.log('[Seeder] Starting Supabase seeding process...');

    // 2. --- CHECK IF SEEDING IS NEEDED ---
    console.log('[Seeder] Checking for existing teachers...');
    const { data: existingTeachers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher')
      .limit(1);

    if (checkError) {
      console.error('[Seeder] ABORTING: Error while checking for existing teachers:', checkError);
      return;
    }

    if (existingTeachers && existingTeachers.length > 0) {
      console.log('[Seeder] SKIPPING: Found existing teacher(s). Assuming mock data is present.');
      return;
    }

    console.log('[Seeder] No teachers found. Proceeding with full data seeding...');

    // 3. --- CREATE TEACHER USERS ---
    console.log('[Seeder] Step 3: Creating teacher users...');
    const createdTeachers = [];
    for (const teacher of teachersToCreate) {
      console.log(`[Seeder] Attempting to sign up ${teacher.email}...`);
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: teacher.email,
        password: teacher.password,
        options: {
          data: {
            name: teacher.name,
            role: 'teacher',
          }
        }
      });
      if (signUpError && !signUpError.message.includes('User already registered')) {
        console.error(`[Seeder] ABORTING: Error signing up ${teacher.email}.`, signUpError);
        throw signUpError;
      }
      
      const user = authData.user || (await supabase.auth.signInWithPassword(teacher)).data.user;
      if (!user) {
        throw new Error(`[Seeder] ABORTING: Failed to create or sign in teacher: ${teacher.email}`);
      }
      console.log(`[Seeder] User object for ${teacher.email} obtained, ID: ${user.id}`);
      createdTeachers.push({ id: user.id, name: teacher.name, email: teacher.email, role: 'teacher' });

      // Also add to the public.teachers table for consistency
      const { error: teacherProfileError } = await supabase
        .from('teachers')
        .upsert({ name: teacher.name, email: teacher.email }, { onConflict: 'email' });

      if (teacherProfileError) {
        console.error(`[Seeder] ABORTING: Error upserting into public.teachers for ${teacher.email}.`, teacherProfileError);
        throw teacherProfileError;
      }
      console.log(`[Seeder] Successfully upserted into public.teachers for: ${teacher.name}`);
    }
    console.log('[Seeder] Step 3 COMPLETE: Teacher users created.');

    // 4. --- CREATE STUDENT USERS & PROFILES ---
    console.log('[Seeder] Step 4: Creating student users and profiles...');
    const createdStudents = [];
    for (const student of studentsToCreate) {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: student.email,
        password: student.password,
        options: {
          data: {
            name: student.name,
            role: 'student',
          }
        }
      });
      if (signUpError && !signUpError.message.includes('User already registered')) throw signUpError;

      const user = authData.user || (await supabase.auth.signInWithPassword(student)).data.user;
      if (!user) throw new Error(`Failed to create or sign in student: ${student.email}`);

      // Create a corresponding entry in `public.students`
      const { data: studentProfile, error: studentProfileError } = await supabase
        .from('students')
        .upsert({ name: student.name, email: student.email }, { onConflict: 'email' })
        .select()
        .single();
      if (studentProfileError) throw studentProfileError;
      createdStudents.push(studentProfile);
    }
    console.log('[Seeder] Step 4 COMPLETE: Student users and profiles created.');

    // 5. --- CREATE CLASSES AND ASSIGN TEACHERS ---
    console.log('[Seeder] Step 5: Creating classes and assigning teachers...');
    const classesToCreate = [
      { name: 'Grade 10 Maths', teacher_id: createdTeachers[0].id },
      { name: 'Grade 11 Physics', teacher_id: createdTeachers[1].id },
    ];
    const { data: insertedClasses, error: classError } = await supabase.from('classes').insert(classesToCreate).select();
    if (classError) throw classError;
    console.log('[Seeder] Step 5 COMPLETE: Classes created.');

    // 6. --- ASSIGN STUDENTS TO CLASSES ---
    console.log('[Seeder] Step 6: Assigning students to classes...');
    const studentUpdates = [
      { id: createdStudents[0].id, class_id: insertedClasses[0].id },
      { id: createdStudents[1].id, class_id: insertedClasses[0].id },
      { id: createdStudents[2].id, class_id: insertedClasses[1].id },
      { id: createdStudents[3].id, class_id: insertedClasses[1].id },
    ];
    const { error: studentUpdateError } = await supabase.from('students').upsert(studentUpdates);
    if (studentUpdateError) throw studentUpdateError;
    console.log('[Seeder] Step 6 COMPLETE: Students assigned to classes.');

    // 7. --- SEED ANNOUNCEMENTS ---
    console.log('[Seeder] Step 7: Seeding announcements...');
    const { error: announcementError } = await supabase.from('announcements').insert(announcements.map(a => ({ ...a, created_by: null })));
    if (announcementError) throw announcementError;
    console.log('[Seeder] Step 7 COMPLETE: Announcements seeded.');

    // 8. --- SEED ATTENDANCE & MARKS ---
    console.log('[Seeder] Step 8: Seeding attendance and marks...');
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
    console.log('[Seeder] Step 8 COMPLETE: Attendance and marks seeded.');

    console.log('[Seeder] SUCCESSFULLY COMPLETED FULL SEEDING PROCESS.');

  } catch (error) {
    console.error('[Seeder] A CRITICAL ERROR occurred during the seeding process:', error.message);
  }
};
