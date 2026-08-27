import { useState, useEffect } from 'react';
import { Shield, Megaphone, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'event' | 'urgent';
  authorName: string;
  authorId: string;
  timestamp: string;
}

export function ManageAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    
    try {
      const response = await fetch('http://localhost:5001/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          content, 
          category,
          authorName: user?.name || 'Admin',
          authorId: user?.id || 'a1'
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        form.reset();
        fetchAnnouncements();
      } else {
        const errData = await response.json();
        alert('Failed to add announcement: ' + errData.message);
      }
    } catch (error) {
      console.error('Error adding announcement:', error);
      alert('Network error when adding announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/announcements/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchAnnouncements();
      } else {
        alert('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800',
      event: 'bg-blue-100 text-blue-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return styles[category as keyof typeof styles] || styles.general;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center bg-orange-50 p-6 rounded-2xl border border-orange-100">
        <div className="bg-orange-100 p-3 rounded-full mr-4">
          <Shield className="w-8 h-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Announcements</h1>
          <p className="text-gray-600">Create, view, or remove school announcements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Add Announcement Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <Megaphone className="w-6 h-6 text-orange-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">New Announcement</h2>
          </div>
          <form onSubmit={handleAddAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input name="title" required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" placeholder="e.g. Science Fair Tomorrow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none">
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea name="content" required rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" placeholder="Write the announcement details here..."></textarea>
            </div>

            <div className="pt-4 pb-2">
              <button type="submit" className="w-full inline-flex justify-center items-center bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer">
                Publish Announcement
              </button>
            </div>

            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center mt-4">
                <CheckCircle className="w-5 h-5 mr-2" />
                Announcement published successfully!
              </div>
            )}
          </form>
        </div>

        {/* Existing Announcements */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Announcements</h2>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-8">No announcements found. Add one to get started.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{a.title}</h4>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${getCategoryBadge(a.category)}`}>
                        {a.category.charAt(0).toUpperCase() + a.category.slice(1)}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    By {a.authorName} • {new Date(a.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
