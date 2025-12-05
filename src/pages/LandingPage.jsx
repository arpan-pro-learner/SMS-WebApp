import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarCheck, GraduationCap, ArrowRight, Shield, ClipboardList, User } from 'lucide-react';

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transform hover:-translate-y-2 transition-transform duration-300">
    <div className="mb-4 flex justify-center">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">{title}</h3>
    <p className="text-gray-600 text-left">{description}</p>
  </div>
);

// Role Card Component (new)
const RoleCard = ({ icon, title, description, colorClass, benefits }) => (
  <div className={`p-8 rounded-xl shadow-lg border border-gray-200 bg-white transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group`}>
    <div className={`flex items-center justify-center h-16 w-16 rounded-full ${colorClass} bg-opacity-20 text-4xl mb-6 transition-all duration-300 group-hover:bg-opacity-30`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <ul className="space-y-2 text-gray-700">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center text-sm">
          <ArrowRight className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
          {benefit}
        </li>
      ))}
    </ul>
  </div>
);

// Main Landing Page Component
function LandingPage() {
  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 py-4 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logoipsum-352.png" alt="SMS Logo" className="h-8 w-auto" />
            {/* <span className="text-xl font-bold text-gray-900">SMS</span> */}
          </Link>
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/login" className="bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg px-4 py-2 font-semibold transition">Login</Link>
            <Link to="/signup" className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 font-semibold transition">Sign Up</Link>
          </nav>
          <div className="md:hidden">
            <Link to="/login" className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 font-semibold transition">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 sm:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                The Modern <span className="text-blue-600">School Management</span> Solution
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
                An integrated platform to streamline administrative tasks, empower teachers, and engage students like never before.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/signup" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-8 py-3 text-lg font-semibold transition flex items-center justify-center">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto text-blue-600 font-semibold">
                  Request a Demo
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img src="/hero-college-img.png" alt="Dashboard Preview" className="rounded-lg" />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need in One Place</h2>
            <p className="mt-4 text-lg text-gray-600">Manage your entire institution with a suite of powerful, intuitive tools.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck size={24} />}
              title="Centralized Admin Control"
              description="Oversee all aspects of your institution, from class and teacher management to student enrollment, all from a single, powerful dashboard."
            />
            <FeatureCard
              icon={<CalendarCheck size={24} />}
              title="Effortless Teacher Workflow"
              description="Empower teachers with simple tools to mark attendance, enter grades, and communicate with students, freeing up time for what matters most."
            />
            <FeatureCard
              icon={<GraduationCap size={24} />}
              title="Engaging Student Portal"
              description="Provide students with instant access to their attendance records, grades, and class announcements to keep them informed and engaged."
            />
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Designed for Every Role</h2>
           <p className="mt-4 text-lg text-gray-600">A tailored experience for administrators, teachers, and students.</p>
           <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <RoleCard
                icon={<Shield size={32} />}
                title="For Admins"
                description="Gain complete oversight and control over your institution's operations."
                colorClass="bg-blue-100 text-blue-600"
                benefits={[
                  "Manage users, roles, and permissions",
                  "Create and assign classes to teachers",
                  "Monitor system-wide activity and reports",
                  "Centralize data for informed decisions"
                ]}
              />
              <RoleCard
                icon={<ClipboardList size={32} />}
                title="For Teachers"
                description="Streamline your daily tasks and focus more on teaching, less on administration."
                colorClass="bg-green-100 text-green-600"
                benefits={[
                  "Effortlessly mark student attendance",
                  "Input and manage student marks",
                  "Communicate with students and parents",
                  "Access class rosters and student profiles"
                ]}
              />
              <RoleCard
                icon={<User size={32} />}
                title="For Students"
                description="Stay informed, track your progress, and take control of your academic journey."
                colorClass="bg-yellow-100 text-yellow-600"
                benefits={[
                  "View personal attendance records",
                  "Check grades and academic performance",
                  "Access class schedules and announcements",
                  "Stay connected with teachers"
                ]}
              />
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Ready to Transform Your School?</h2>
          <p className="mt-4 text-lg text-gray-600">
            Join hundreds of institutions embracing the future of education management. Get started today and experience the difference.
          </p>
          <div className="mt-8">
            <Link
              to="/signup"
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-10 py-4 text-lg font-semibold transition"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-500">&copy; 2025 School Management System. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link>
            <Link to="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;