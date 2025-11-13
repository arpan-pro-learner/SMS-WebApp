import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Welcome to the <span className="text-blue-600">School Management System</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          A modern, intuitive platform designed to streamline student, teacher, and class management for educational institutions.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/login"
            className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 focus:ring-2 rounded-lg px-8 py-3 text-lg font-semibold transition duration-150 ease-in-out"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500 focus:ring-offset-2 focus:ring-2 rounded-lg px-8 py-3 text-lg font-semibold transition duration-150 ease-in-out"
          >
            Sign Up
          </Link>
        </div>
      </div>
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-sm text-gray-500">
          &copy; 2025 School Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default LandingPage;
