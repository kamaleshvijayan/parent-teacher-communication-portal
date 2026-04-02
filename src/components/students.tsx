import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Student } from '../data/mock-data';
import { User, MessageSquare, BookOpen, GraduationCap, Mail, ChevronDown, ChevronUp, Award, Calendar, TrendingUp, Users } from 'lucide-react';

export function Students() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [studentsData, setStudentsData] = useState<Student[]>([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/students')
      .then(res => res.json())
      .then(data => setStudentsData(data))
      .catch(err => console.error(err));
  }, []);

  const students = user?.role === 'teacher'
    ? studentsData.filter(s => s.teacherId === user.id)
    : studentsData.filter(s => s.email === user?.email);

  const toggleExpanded = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBehaviorBadge = (behavior: string) => {
    const styles = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      'needs improvement': 'bg-yellow-100 text-yellow-800',
    };
    return styles[behavior as keyof typeof styles] || styles.good;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateAverageScore = (marks: any[]) => {
    if (marks.length === 0) return 0;
    const total = marks.reduce((sum, mark) => sum + (mark.score / mark.maxScore) * 100, 0);
    return Math.round(total / marks.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'teacher' ? 'My Students' : 'My Children'}
        </h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'teacher'
            ? 'View and manage your students'
            : 'View your children\'s information and communicate with teachers'}
        </p>
      </div>

      <div className="space-y-4">
        {students.map((student) => {
          const isExpanded = expandedStudent === student.id;
          const avgScore = calculateAverageScore(student.recentMarks);

          return (
            <div key={student.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Student Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {student.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-1" />
                          {student.grade}
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {student.className}
                        </span>
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {student.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBehaviorBadge(student.behavior)}`}>
                          {student.behavior}
                        </span>
                        <span className="text-sm text-gray-600">
                          Attendance: <span className="font-semibold">{student.attendance}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Average Score</div>
                      <div className="text-2xl font-bold text-gray-900">{avgScore}%</div>
                    </div>
                    <button
                      onClick={() => toggleExpanded(student.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          View Details
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                {!isExpanded && (
                  <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {student.recentMarks.length}
                      </div>
                      <div className="text-xs text-gray-500">Recent Assessments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {student.recentMarks.filter(m => m.grade.startsWith('A')).length}
                      </div>
                      <div className="text-xs text-gray-500">A Grades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {student.recentMarks.filter(m => m.type === 'test').length}
                      </div>
                      <div className="text-xs text-gray-500">Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {student.recentMarks.filter(m => m.type === 'project').length}
                      </div>
                      <div className="text-xs text-gray-500">Projects</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Performance Overview */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-3">
                        <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="text-sm font-semibold text-gray-900">Performance</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average</span>
                          <span className="text-sm font-semibold">{avgScore}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Highest</span>
                          <span className="text-sm font-semibold text-green-600">
                            {Math.max(...student.recentMarks.map(m => m.score))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Lowest</span>
                          <span className="text-sm font-semibold text-orange-600">
                            {Math.min(...student.recentMarks.map(m => m.score))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-3">
                        <Calendar className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="text-sm font-semibold text-gray-900">Attendance</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Present</span>
                          <span className="text-sm font-semibold text-green-600">{student.attendance}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${student.attendance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Academic Performance */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-3">
                        <Award className="w-5 h-5 text-purple-600 mr-2" />
                        <h4 className="text-sm font-semibold text-gray-900">Academic Performance</h4>
                      </div>
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBehaviorBadge(student.behavior)}`}>
                          {student.behavior}
                        </span>
                        <p className="text-xs text-gray-600 mt-2">
                          {student.behavior === 'excellent'
                            ? 'Consistently demonstrates strong academic performance'
                            : student.behavior === 'good'
                              ? 'Generally performs well and participates actively'
                              : 'Working on improving academic performance'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Marks Table */}
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-900">Recent Marks & Assessments</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Grade
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {student.recentMarks.map((mark, index) => {
                            const percentage = Math.round((mark.score / mark.maxScore) * 100);
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {formatDate(mark.date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {mark.subject}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                    {mark.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {mark.score}/{mark.maxScore}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(mark.grade)}`}>
                                    {mark.grade}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {percentage}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => navigate('/compose', {
                        state: {
                          studentName: student.name,
                          teacherName: student.teacherName
                        }
                      })}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {user?.role === 'teacher' ? 'Message Parent' : 'Message Teacher'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No students found</p>
        </div>
      )}
    </div>
  );
}
