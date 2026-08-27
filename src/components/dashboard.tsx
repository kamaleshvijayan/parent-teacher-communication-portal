import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { MessageSquare, Bell, Users, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Message } from '../data/mock-data';
import { ATTENDANCE_UPDATED_EVENT, getAttendanceRecords, getStudentAttendanceStats } from '../data/local-attendance';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [attendanceDays, setAttendanceDays] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/messages');
        if (response.ok) {
          const data = await response.json();
          const userMessages = data
            .filter((m: Message) => m.recipientId === user.id);
          setMessages(userMessages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/students');
        if (response.ok) {
          const data = await response.json();
          const userStudents = user.role === 'teacher'
            ? data.filter((s: any) => s.teacherId === user.id)
            : data.filter((s: any) => s.email === user.email);
          setStudents(userStudents);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };

    fetchMessages();
    fetchStudents();
    const updateAttendance = () => {
      const records = getAttendanceRecords();
      setAttendanceDays(Object.keys(records).length);
      setPresentIds(records[new Date().toISOString().slice(0, 10)] || []);
    };
    updateAttendance();
    window.addEventListener(ATTENDANCE_UPDATED_EVENT, updateAttendance);
    const interval = setInterval(fetchMessages, 5000);
    return () => { clearInterval(interval); window.removeEventListener(ATTENDANCE_UPDATED_EVENT, updateAttendance); };
  }, [user, navigate]);

  if (!user) return null;

  const unreadMessages = messages.filter(m => !m.read).length;
  const totalPresentDays = students.reduce((total, student) => total + getStudentAttendanceStats(student.id).presentDays, 0);
  const totalAbsentDays = students.reduce((total, student) => total + getStudentAttendanceStats(student.id).absentDays, 0);

  const stats = [
    {
      title: 'Unread Messages',
      value: loading ? '...' : unreadMessages,
      icon: MessageSquare,
      color: 'bg-blue-500',
      action: () => navigate('/messages'),
    },
    {
      title: 'New Announcements',
      value: 3,
      icon: Bell,
      color: 'bg-green-500',
      action: () => navigate('/announcements'),
    },
    {
      title: user.role === 'teacher' ? 'Students' : 'Children',
      value: loading ? '...' : students.length,
      icon: Users,
      color: 'bg-purple-500',
      action: () => navigate('/students'),
    },
    {
      title: 'Present Today',
      value: loading ? '...' : user.role === 'teacher' ? presentIds.filter(id => students.some(student => student.id === id)).length : students.filter(student => presentIds.includes(student.id)).length,
      icon: Calendar,
      color: 'bg-emerald-500',
      action: () => navigate('/students'),
    },
    {
      title: 'Tracked Attendance Days',
      value: loading ? '...' : attendanceDays,
      icon: Calendar,
      color: 'bg-amber-500',
      action: () => navigate('/students'),
    },
    {
      title: 'Present Days',
      value: loading ? '...' : totalPresentDays,
      icon: Calendar,
      color: 'bg-green-600',
      action: () => navigate('/students'),
    },
    {
      title: 'Absent Days',
      value: loading ? '...' : totalAbsentDays,
      icon: Calendar,
      color: 'bg-red-500',
      action: () => navigate('/students'),
    },
    {
      title: 'Upcoming Events',
      value: 5,
      icon: Calendar,
      color: 'bg-orange-500',
      action: () => { },
    },
  ];

  const recentActivity = [
    { type: 'message', text: 'New message from Ms. Johnson', time: '2 hours ago' },
    { type: 'announcement', text: 'School trip announcement posted', time: '1 day ago' },
    { type: 'message', text: 'Reply from Mr. Anderson', time: '2 days ago' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your {user.role === 'teacher' ? 'students' : 'children'} today
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              onClick={stat.action}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-200 last:border-0">
                <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${activity.type === 'message' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/compose')}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Send a Message</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">View All Messages</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/students')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  View {user.role === 'teacher' ? 'Students' : 'Children'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
