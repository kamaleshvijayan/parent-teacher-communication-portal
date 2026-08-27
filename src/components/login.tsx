import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { GraduationCap } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  const quickLogin = async (type: 'parent' | 'teacher' | 'admin') => {
    setError('');
    const credentials = 
      type === 'teacher' ? { email: 'teacher@school.com', password: 'demo' } :
      type === 'admin' ? { email: 'admin@school.com', password: 'demo' } :
      { email: 'parent@example.com', password: 'demo' };

    const user = await login(credentials.email, credentials.password);
    if (user) {
      navigate('/dashboard');
    } else {
      setError('Demo login failed. Please make sure the backend server is running.');
    }
  };

  return (
    <div className="min-h-screen flex flex-row w-full bg-white overflow-x-auto">
      {/* Left Side - Application Information */}
      <div
        className="w-1/2 p-8 md:p-12 lg:p-16 flex items-center justify-center relative overflow-hidden min-w-[500px]"
        style={{
          background: 'linear-gradient(135deg, #4338ca 0%, #3b82f6 50%, #2563eb 100%)'
        }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        <div className="max-w-lg text-white relative z-10 w-full">
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <div className="ml-6">
                <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">SAPPS</h1>
                <p className="mt-1 max-w-xs text-sm text-white/85">Smart Attendance and Performance Prediction System</p>
              </div>
            </div>

            <h2 className="text-3xl font-light mb-6 leading-tight text-blue-50">
              Strengthening Education Through <span className="font-semibold text-white">Better Communication</span>
            </h2>

            <p className="text-lg text-blue-100 leading-relaxed font-medium opacity-90">
              A modern platform designed to bridge the gap between parents and teachers,
              fostering collaboration with transparency.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center group p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10">
              <div className="flex-shrink-0">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-bold text-white mb-1">Real-Time Messaging</h3>
                <p className="text-blue-200 text-sm font-medium">Instant, organized communication</p>
              </div>
            </div>

            <div className="flex items-center group p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10">
              <div className="flex-shrink-0">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-bold text-white mb-1">Student Progress</h3>
                <p className="text-blue-200 text-sm font-medium">Track academic performance</p>
              </div>
            </div>

            <div className="flex items-center group p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10">
              <div className="flex-shrink-0">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-bold text-white mb-1">Secure & Private</h3>
                <p className="text-blue-200 text-sm font-medium">Protected, role-based access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center p-8 bg-gray-50 min-w-[500px]">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Welcome Back
            </h2>
            <p className="text-gray-500 font-medium">
              We're glad to see you again. Sign in below.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100 animate-pulse">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Login Failed
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              style={{ backgroundColor: '#4f46e5' }}
              className="w-32 mx-auto block flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition hover:-translate-y-0.5"
            >
              Login
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Quick Access Demo
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => quickLogin('teacher')}
                  className="group relative w-full flex justify-center py-3 px-4 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                  Teacher Demo
                </button>
                <button
                  onClick={() => quickLogin('parent')}
                  className="group relative w-full flex justify-center py-3 px-4 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                  Parent Demo
                </button>
              </div>
              <button
                onClick={() => quickLogin('admin')}
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
