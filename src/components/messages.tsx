import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { useMessages } from '../context/message-context';
import { Mail, MailOpen, Trash2, Reply } from 'lucide-react';

export function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { messages: allMessages, deleteMessage } = useMessages();
  const [selectedTab, setSelectedTab] = useState<'inbox' | 'sent'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  if (!user) return null;

  const messages = allMessages.filter(m =>
    selectedTab === 'inbox' ? m.recipientId === user.id : m.senderId === user.id
  );

  const selectedMessageData = messages.find(m => m.id === selectedMessage);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="mt-2 text-gray-600">Communicate with teachers and parents</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedTab('inbox')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'inbox'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Inbox ({messages.filter(m => m.recipientId === user.id).length})
            </button>
            <button
              onClick={() => setSelectedTab('sent')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${selectedTab === 'sent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Sent ({messages.filter(m => m.senderId === user.id).length})
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-200">
          {/* Message List */}
          <div className="lg:col-span-1 divide-y divide-gray-200 overflow-y-auto" style={{ maxHeight: '600px' }}>
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No messages</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMessage === message.id ? 'bg-blue-50' : ''
                    } ${!message.read && selectedTab === 'inbox' ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {!message.read && selectedTab === 'inbox' ? (
                        <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <MailOpen className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${!message.read && selectedTab === 'inbox' ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                          {selectedTab === 'inbox' ? message.senderName : message.recipientName}
                        </p>
                        <p className="text-sm font-medium text-gray-700 truncate mt-1">
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {message.content.substring(0, 60)}...
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessageData ? (
              <div className="p-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedMessageData.subject}
                      </h2>
                      {selectedMessageData.studentName && (
                        <p className="text-sm text-gray-500 mt-1">
                          Regarding: {selectedMessageData.studentName}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {selectedTab === 'inbox' && (
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Reply className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this message?')) {
                            deleteMessage(selectedMessageData.id);
                            setSelectedMessage(null);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {selectedTab === 'inbox'
                          ? selectedMessageData.senderName[0]
                          : selectedMessageData.recipientName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTab === 'inbox'
                            ? selectedMessageData.senderName
                            : selectedMessageData.recipientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedTab === 'inbox'
                            ? selectedMessageData.senderRole
                            : 'to you'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(selectedMessageData.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessageData.content}
                  </p>
                </div>

                {selectedTab === 'inbox' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => navigate('/compose', {
                        state: {
                          replyTo: selectedMessageData
                        }
                      })}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a message to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
