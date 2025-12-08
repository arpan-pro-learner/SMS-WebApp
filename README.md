# 🏫 School Management System (SMS)

## 🚀 Overview

The **School Management System (SMS)** is a full-stack web application designed to streamline administrative tasks, empower teachers, and engage students. Built as a demo version (MVP - Minimum Viable Product), it showcases key functionalities for managing students, teachers, classes, attendance, marks, and announcements with a modern, responsive UI.

This project utilizes **Supabase** as its backend, providing authentication, a PostgreSQL database, and API services out-of-the-box.

## ✨ Features

-   **Role-Based Access Control:** Secure login for Admin, Teacher, and Student roles with tailored dashboards.
-   **Admin Dashboard:** Comprehensive overview of students, teachers, and classes.
-   **Teacher Dashboard:** Tools for marking student attendance and managing marks.
-   **Student Dashboard:** Personalized view of attendance records, marks, and announcements.
-   **Class & Subject Management:** Admins can create, edit, and assign classes.
-   **Attendance Tracking:** Teachers can record daily attendance, students can view their history.
-   **Marks Management:** Teachers can input and manage student grades, with students viewing their performance.
-   **Announcements System:** Centralized platform for important notices.
-   **Modern UI:** Built with React and styled using Tailwind CSS for a responsive and intuitive user experience.

## 🛠️ Tech Stack

-   **Frontend:** React.js (with Vite)
-   **Styling:** Tailwind CSS
-   **State Management:** Zustand
-   **Backend & Database:** Supabase (PostgreSQL, Authentication, APIs)
-   **Charting:** Chart.js (via react-chartjs-2)
-   **UI Notifications:** React Hot Toast
-   **Form Management:** React Hook Form
-   **Routing:** React Router DOM

## ⚙️ Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

-   Node.js (LTS version recommended)
-   npm or Yarn (npm is used in these instructions)
-   A Supabase Project

### 1. Clone the Repository

```bash
git clone [YOUR_REPOSITORY_URL_HERE]
cd sms-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

You need to create a Supabase project and configure your `.env` file.

-   **Create a Project:** Go to [Supabase](https://app.supabase.com/) and create a new project.
-   **Get API Keys:** Navigate to `Project Settings > API` in your Supabase dashboard. Copy your `Project URL` and `anon public` key.
-   **Create `.env` file:** In the `sms-app` directory, create a file named `.env` and add the following:

    ```
    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```
    Replace the placeholders with your actual Supabase project URL and anon key.

### 4. Database Schema

The application expects certain tables and Row Level Security (RLS) policies in your Supabase project. You can find the schema in `schema.sql` at the root of the `sms-app` directory.

-   Go to your Supabase project's `SQL Editor`.
-   Run the SQL statements from `schema.sql` to create the necessary tables and RLS policies.
-   **Important:** Ensure you add a `UNIQUE` constraint on `(student_id, date)` for the `attendance` table and `(student_id, subject)` for the `marks` table for proper upsert functionality.

    ```sql
    -- For attendance table
    ALTER TABLE attendance
    ADD CONSTRAINT attendance_student_id_date_key UNIQUE (student_id, date);

    -- For marks table
    ALTER TABLE marks
    ADD CONSTRAINT marks_student_id_subject_key UNIQUE (student_id, subject);
    ```

### 5. Seeding Initial Data (Development Only)

The project includes a seeder script to populate your database with mock data. This runs automatically in development mode.

-   Ensure `NODE_ENV=development` or `VITE_NODE_ENV=development` (Vite's equivalent) in your environment.
-   **Admin Credentials for Seeder (if you want to create an admin manually for testing):**
    -   Email: `admin@example.com`
    -   Password: `password`
    (You would manually sign up or insert this user into `auth.users` and `public.users` with `role: 'admin'`)

### 6. Run the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:5173` (or another port if 5173 is in use).

## 📄 License

This project is licensed under the MIT License - see the LICENSE.md file for details.