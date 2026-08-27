import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Bell, Users, LogOut, PenSquare, ScanFace } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = user?.role === 'admin' 
    ? [ { path: '/admin', label: 'Admin Dashboard', icon: Home } ]
    : [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/messages', label: 'Messages', icon: MessageSquare },
        { path: '/announcements', label: 'Announcements', icon: Bell },
        { path: '/students', label: user?.role === 'teacher' ? 'Students' : 'My Children', icon: Users },
        ...(user?.role === 'teacher' ? [{ path: '/attendance', label: 'Face Attendance', icon: ScanFace }] : []),
      ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-16 py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="flex min-w-0 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-semibold text-blue-600 whitespace-nowrap">ParentTeacher Portal</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 transition-colors ${isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-4">
            {user?.role !== 'admin' && (
              <Link
                to="/compose"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <PenSquare className="w-4 h-4 mr-2" />
                New Message
              </Link>
            )}
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
