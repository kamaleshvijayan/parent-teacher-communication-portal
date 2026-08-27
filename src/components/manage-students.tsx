import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, X, Check, ArrowLeft, GraduationCap, Plus } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string; // Parent Email
  parentPassword?: string;
  grade: string;
  teacherId: string;
  teacherName: string;
  attendance?: number;
  behavior?: string;
  recentMarks?: {
    subject: string;
    type: string;
    score: number;
    maxScore: number;
    grade: string;
    date: string;
  }[];
}

interface Teacher {
  id: string;
  name: string;
}

export function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

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

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditData({ 
      ...student,
      attendance: student.attendance ?? 100,
      behavior: student.behavior ?? 'good',
      recentMarks: student.recentMarks ?? [] 
    });
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setIsModalOpen(false);
  };

  const addMark = () => {
    setEditData({
      ...editData,
      recentMarks: [...(editData.recentMarks || []), { subject: '', type: 'test', score: 0, maxScore: 100, grade: 'A', date: new Date().toISOString().split('T')[0] }]
    });
  };

  const removeMark = (index: number) => {
    setEditData({
      ...editData,
      recentMarks: (editData.recentMarks || []).filter((_, i) => i !== index)
    });
  };

  const updateMark = (index: number, field: string, value: any) => {
    const newMarks = [...(editData.recentMarks || [])];
    newMarks[index] = { ...newMarks[index], [field]: value } as any;
    setEditData({ ...editData, recentMarks: newMarks });
  };

  const handleSave = async (id: string) => {
    if (!editData.name || !editData.email) {
      alert("Name and Parent Email are required.");
      return;
    }

    // Resolve teacher name if teacherId changed
    let selectedTeacherName = editData.teacherName;
    if (editData.teacherId) {
       const t = teachers.find(t => t.id === editData.teacherId);
       if (t) selectedTeacherName = t.name;
    }

    const payload = { ...editData, teacherName: selectedTeacherName } as any;
    delete payload._id;
    delete payload.__v;

    try {
      const response = await fetch(`http://localhost:5001/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const updatedStudent = await response.json();
        setStudents(students.map(s => s.id === id ? updatedStudent : s));
        setIsModalOpen(false);
        setEditingId(null);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        alert('Failed to update student: ' + errorData.message);
      }
    } catch (error) {
      console.error('Network error updating student:', error);
      alert('Error updating student');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/students/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setStudents(students.filter(s => s.id !== id));
      } else {
        alert('Failed to delete student');
      }
    } catch (error) {
      console.error('Network error deleting student:', error);
      alert('Error deleting student');
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
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <GraduationCap className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-gray-600">View, edit, and remove student profiles</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Teacher</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Email</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.grade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.teacherName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => startEdit(student)} className="text-blue-600 hover:text-blue-900 transition-colors p-1 hover:bg-blue-50 rounded">
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No students found. Go back to the dashboard to add some!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button 
              onClick={cancelEdit}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center mb-6">
              <Pencil className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Edit Student Profile: {editData.name}</h2>
            </div>
            
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Full Name</label>
                  <input 
                    name="name" 
                    value={editData.name || ''} 
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    required 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email Address</label>
                  <input 
                    name="email" 
                    value={editData.email || ''} 
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    required 
                    type="email" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Login Password</label>
                  <input
                    name="parentPassword"
                    value={editData.parentPassword || ''}
                    onChange={(e) => setEditData({...editData, parentPassword: e.target.value})}
                    type="text"
                    placeholder="Leave blank to keep unchanged"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select 
                    name="grade" 
                    value={editData.grade || ''} 
                    onChange={(e) => setEditData({...editData, grade: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="1st Grade">1st Grade</option>
                    <option value="2nd Grade">2nd Grade</option>
                    <option value="3rd Grade">3rd Grade</option>
                    <option value="4th Grade">4th Grade</option>
                    <option value="5th Grade">5th Grade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Teacher</label>
                  <select 
                    name="teacherId" 
                    value={editData.teacherId || ''} 
                    onChange={(e) => setEditData({...editData, teacherId: e.target.value})}
                    required 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select a Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Performance Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendance (%)</label>
                  <input 
                    type="number" 
                    min="0" max="100" 
                    value={editData.attendance || 100}
                    onChange={(e) => setEditData({...editData, attendance: Number(e.target.value)})}
                    required 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Performance</label>
                  <select 
                    value={editData.behavior || 'good'}
                    onChange={(e) => setEditData({...editData, behavior: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="needs improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>

              {/* Marks */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Marks & Assessments</label>
                  <button 
                    type="button" 
                    onClick={addMark}
                    className="text-sm flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Result
                  </button>
                </div>
                
                {(!editData.recentMarks || editData.recentMarks.length === 0) ? (
                  <p className="text-sm text-gray-500 italic">No marks added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {editData.recentMarks.map((mark, index) => (
                      <div key={index} className="flex flex-wrap gap-2 items-end bg-white p-3 rounded shadow-sm border border-gray-100">
                        <div className="flex-1 min-w-[100px]">
                          <label className="block text-xs text-gray-500 mb-1">Date</label>
                          <input type="date" value={mark.date} onChange={(e) => updateMark(index, 'date', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-200 rounded" required />
                        </div>
                        <div className="flex-1 min-w-[100px]">
                          <label className="block text-xs text-gray-500 mb-1">Subject</label>
                          <input type="text" value={mark.subject} onChange={(e) => updateMark(index, 'subject', e.target.value)} placeholder="Subject" className="w-full text-sm px-2 py-1 border border-gray-200 rounded" required />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs text-gray-500 mb-1">Type</label>
                          <select value={mark.type} onChange={(e) => updateMark(index, 'type', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-200 rounded">
                            <option value="test">Test</option>
                            <option value="quiz">Quiz</option>
                            <option value="project">Project</option>
                            <option value="homework">Homework</option>
                          </select>
                        </div>
                        <div className="w-16">
                          <label className="block text-xs text-gray-500 mb-1">Score</label>
                          <input type="number" value={mark.score} onChange={(e) => updateMark(index, 'score', Number(e.target.value))} className="w-full text-sm px-2 py-1 border border-gray-200 rounded" required />
                        </div>
                        <div className="w-16">
                          <label className="block text-xs text-gray-500 mb-1">Out of</label>
                          <input type="number" value={mark.maxScore} onChange={(e) => updateMark(index, 'maxScore', Number(e.target.value))} className="w-full text-sm px-2 py-1 border border-gray-200 rounded" required />
                        </div>
                        <div className="w-16">
                          <label className="block text-xs text-gray-500 mb-1">Grade</label>
                          <input type="text" value={mark.grade} onChange={(e) => updateMark(index, 'grade', e.target.value)} placeholder="A" className="w-full text-sm px-2 py-1 border border-gray-200 rounded" required />
                        </div>
                        <div className="flex items-center pb-1">
                          <button type="button" onClick={() => removeMark(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSave(editingId!)}
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
