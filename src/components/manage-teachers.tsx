import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, X, Check, ArrowLeft, Users } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export function ManageTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users?role=teacher');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setEditName(teacher.name);
    setEditEmail(teacher.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail })
      });
      
      if (response.ok) {
        setTeachers(teachers.map(t => 
          t.id === id ? { ...t, name: editName, email: editEmail } : t
        ));
        setEditingId(null);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        alert('Failed to update teacher: ' + errorData.message);
      }
    } catch (error) {
      console.error('Network error updating teacher:', error);
      alert('Error updating teacher');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/users/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTeachers(teachers.filter(t => t.id !== id));
      } else {
        alert('Failed to delete teacher');
      }
    } catch (error) {
      console.error('Network error deleting teacher:', error);
      alert('Error deleting teacher');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate('/admin')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <Users className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          <p className="text-gray-600">View, edit, and remove teacher accounts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === teacher.id ? (
                      <input 
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === teacher.id ? (
                      <input 
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editEmail}
                        type="email"
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{teacher.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === teacher.id ? (
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleSave(teacher.id)} className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEdit} className="text-gray-600 hover:text-gray-900 bg-gray-100 p-1.5 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => startEdit(teacher)} className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 hover:bg-indigo-50 rounded">
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(teacher.id)} className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No teachers found. Go back to the dashboard to add some!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
