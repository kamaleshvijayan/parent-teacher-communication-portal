import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { useMessages } from '../context/message-context';
import { mockStudents } from '../data/mock-data';
import { Send, X } from 'lucide-react';

export function Compose() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const replyTo = location.state?.replyTo;

  const [recipient, setRecipient] = useState(replyTo?.recipientId || '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [message, setMessage] = useState('');
  const [student, setStudent] = useState(replyTo?.studentName || '');
  const [availableRecipients, setAvailableRecipients] = useState<{id: string, name: string}[]>([]);
  const [availableStudents, setAvailableStudents] = useState<{name: string}[]>([]);

  const { sendMessage } = useMessages();

  useEffect(() => {
    // Fetch users for recipients dropdown
    fetch('http://localhost:5001/api/users')
      .then(res => res.json())
      .then(users => {
        if (user?.role === 'teacher') {
          setAvailableRecipients(users.filter((u: any) => u.role === 'parent').map((u: any) => ({ id: u.id, name: u.name })));
        } else if (user?.role === 'parent') {
          setAvailableRecipients(users.filter((u: any) => u.role === 'teacher').map((u: any) => ({ id: u.id, name: u.name })));
        }
      });

    // Fetch students for students dropdown
    fetch('http://localhost:5001/api/students')
      .then(res => res.json())
      .then(students => {
        if (user?.role === 'teacher') {
          setAvailableStudents(students.filter((s: any) => s.teacherId === user.id).map((s: any) => ({ name: s.name })));
        } else if (user?.role === 'parent') {
          setAvailableStudents(students.filter((s: any) => s.email === user.email).map((s: any) => ({ name: s.name })));
        }
      });
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!recipient) {
      alert("Please select a recipient.");
      return;
    }

    const selectedRecipientObj = availableRecipients.find(r => r.id === recipient);
    const recipientName = selectedRecipientObj ? selectedRecipientObj.name : 'Unknown';

    sendMessage({
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      recipientId: recipient,
      recipientName: recipientName,
      subject,
      content: message,
      studentName: student
    });

    navigate('/messages');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Message</h1>
          <p className="mt-2 text-gray-600">Send a message to a {user?.role === 'teacher' ? 'parent' : 'teacher'}</p>
        </div>
        <button
          onClick={() => navigate('/messages')}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <select
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select recipient...</option>
              {availableRecipients.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
              Regarding Student
            </label>
            <select
              id="student"
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select student...</option>
              {availableStudents.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter subject..."
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Type your message here..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/messages')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </button>
          </div>
        </form>
      </div>

      {replyTo && (
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Original Message</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p><span className="font-medium">From:</span> {replyTo.senderName}</p>
            <p><span className="font-medium">Subject:</span> {replyTo.subject}</p>
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="whitespace-pre-wrap">{replyTo.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
