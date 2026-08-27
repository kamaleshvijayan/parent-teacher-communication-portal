import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Bell, AlertCircle, Calendar } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'event' | 'urgent';
  authorName: string;
  authorId: string;
  timestamp: string;
}

export function Announcements() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'general' | 'event' | 'urgent'>('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/announcements');
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = filter === 'all'
    ? announcements
    : announcements.filter(a => a.category === filter);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="mt-2 text-gray-600">Stay updated with school news and events</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'general', 'event', 'urgent'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${
              announcement.category === 'urgent' 
                ? 'border-red-500' 
                : announcement.category === 'event'
                ? 'border-blue-500'
                : 'border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getCategoryIcon(announcement.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(announcement.category)}`}>
                      {announcement.category}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    {announcement.content}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <span className="font-medium mr-1">Posted by:</span>
                      {announcement.authorName}
                    </span>
                    <span>•</span>
                    <span>{formatDate(announcement.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No announcements in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
