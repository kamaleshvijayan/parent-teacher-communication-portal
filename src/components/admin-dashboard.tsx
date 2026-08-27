import { useState, useEffect, useRef } from 'react';
import { UserPlus, UserCheck, Shield, Plus, Trash2, Users, GraduationCap, Settings, Megaphone, Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { FACE_PROFILES_KEY } from '../data/local-attendance';

const FACE_MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Mark {
  subject: string;
  type: string;
  score: number;
  maxScore: number;
  grade: string;
  date: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [teacherSuccess, setTeacherSuccess] = useState(false);
  const [studentSuccess, setStudentSuccess] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [attendance, setAttendance] = useState<number>(100);
  const [behavior, setBehavior] = useState<string>('good');
  const [marks, setMarks] = useState<Mark[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [capturingFace, setCapturingFace] = useState(false);
  const [faceMessage, setFaceMessage] = useState('No face captured yet.');

  const addMark = () => {
    setMarks([...marks, { subject: '', type: 'test', score: 0, maxScore: 100, grade: 'A', date: new Date().toISOString().split('T')[0] }]);
  };

  const removeMark = (index: number) => {
    setMarks(marks.filter((_, i) => i !== index));
  };

  const updateMark = (index: number, field: keyof Mark, value: any) => {
    const newMarks = [...marks];
    newMarks[index] = { ...newMarks[index], [field]: value } as Mark;
    setMarks(newMarks);
  };
  
  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL),
    ]).then(() => setModelsReady(true)).catch(() => setFaceMessage('Face model failed to load. Check your network and reload.'));
    return () => stopFaceCamera();
  }, []);

  const stopFaceCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const startFaceCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setFaceMessage('Camera ready. Center the student\'s face, then capture.');
    } catch {
      setFaceMessage('Camera permission is required to capture the student face.');
    }
  };

  const captureStudentFace = async () => {
    if (!cameraReady) { setFaceMessage('Start the camera first.'); return; }
    if (!modelsReady) { setFaceMessage('Face model is still loading. Please wait.'); return; }
    setCapturingFace(true);
    try {
      const detection = await faceapi.detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })).withFaceLandmarks().withFaceDescriptor();
      if (!detection) throw new Error('No clear face found. Look at the camera and improve the lighting.');
      setFaceDescriptor(Array.from(detection.descriptor));
      setFaceMessage('Face captured. You can now create the student profile.');
    } catch (error) {
      setFaceMessage(error instanceof Error ? error.message : 'Face capture failed.');
    } finally { setCapturingFace(false); }
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

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    try {
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role: 'teacher' })
      });
      
      if (response.ok) {
        setTeacherSuccess(true);
        setTimeout(() => setTeacherSuccess(false), 3000);
        form.reset();
        // Refresh the teachers list so the new teacher is available in the dropdown
        fetchTeachers();
      } else {
        const errData = await response.json();
        alert('Failed to add teacher: ' + errData.message);
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Network error when adding teacher.');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string; // parent email
    const grade = formData.get('grade') as string;
    const teacherId = formData.get('teacherId') as string;
    const parentPassword = formData.get('parentPassword') as string;
    
    // Find the teacher by id to get their name
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) {
      alert('Teacher was not found. Please select a valid teacher.');
      return;
    }
    if (!faceDescriptor) {
      alert('Please start the camera and take a face snapshot before creating the student.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5001/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          grade, 
          teacherId: teacher.id,
          teacherName: teacher.name,
          parentPassword,
          parentIds: ['p1'], // Default parent ID for demo purposes
          attendance: Number(attendance),
          behavior,
          recentMarks: marks.map(m => ({
            ...m,
            score: Number(m.score),
            maxScore: Number(m.maxScore)
          }))
        })
      });

      if (response.ok) {
        const createdStudent = await response.json();
        const profiles = JSON.parse(localStorage.getItem(FACE_PROFILES_KEY) || '{}');
        profiles[createdStudent.id] = faceDescriptor;
        localStorage.setItem(FACE_PROFILES_KEY, JSON.stringify(profiles));
        setStudentSuccess(true);
        setTimeout(() => setStudentSuccess(false), 3000);
        form.reset();
        setAttendance(100);
        setBehavior('good');
        setMarks([]);
        setFaceDescriptor(null);
        setFaceMessage('No face captured yet.');
        stopFaceCamera();
      } else {
        const errData = await response.json();
        alert('Failed to add student: ' + errData.message);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Network error when adding student.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center bg-purple-50 p-6 rounded-2xl border border-purple-100">
        <div className="bg-purple-100 p-3 rounded-full mr-4">
          <Shield className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and system settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/admin/teachers')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center text-left"
        >
          <div className="bg-indigo-50 p-3 rounded-xl inline-block mb-4">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Teachers</h3>
            <p className="text-gray-500 text-sm mt-1">View, edit, or remove teacher accounts from the system</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/students')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center text-left"
        >
          <div className="bg-blue-50 p-3 rounded-xl inline-block mb-4">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Students</h3>
            <p className="text-gray-500 text-sm mt-1">View, edit, or remove student profiles and reassign teachers</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/admin/announcements')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center text-left"
        >
          <div className="bg-orange-50 p-3 rounded-xl inline-block mb-4">
            <Megaphone className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Announcements</h3>
            <p className="text-gray-500 text-sm mt-1">Create, view, or remove school wide announcements</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Add Teacher Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <UserPlus className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Teacher</h2>
          </div>
          <form onSubmit={handleAddTeacher} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="name" required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="e.g. Sarah Johnson" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input name="email" required type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="teacher@school.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Department</label>
                <input name="subject" required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="e.g. Mathematics" />
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-6 hover:bg-[#2b4c9e] transition cursor-pointer rounded">
                Create Teacher Account
              </button>
            </div>

            {teacherSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center mt-4">
                <UserCheck className="w-5 h-5 mr-2" />
                Teacher account created successfully!
              </div>
            )}
          </form>
        </div>

        {/* Add Student Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <UserPlus className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
          </div>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Full Name</label>
              <input name="name" required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="e.g. Michael Smith" />
            </div>

            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Face Enrollment</label>
              <div className="aspect-video max-h-56 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                {!cameraReady && <div className="text-center text-gray-300"><Camera className="w-8 h-8 mx-auto mb-1" /><p className="text-sm">Camera is off</p></div>}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" onClick={cameraReady ? stopFaceCamera : startFaceCamera} className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50">{cameraReady ? 'Stop camera' : 'Start camera'}</button>
                <button type="button" onClick={captureStudentFace} disabled={capturingFace} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">{capturingFace ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}{capturingFace ? 'Capturing...' : 'Take face snapshot'}</button>
              </div>
              <p className={`text-xs mt-2 ${faceDescriptor ? 'text-green-700' : 'text-gray-600'}`}>{faceMessage}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email Address</label>
              <input name="email" required type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="parent@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Login Password</label>
              <input name="parentPassword" required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Assign a password for parent login" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
              <select name="grade" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
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
              <select name="teacherId" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">Select a Teacher</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                ))}
              </select>
            </div>

            {/* Comprehensive student details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance (%)</label>
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={attendance}
                  onChange={(e) => setAttendance(Number(e.target.value))}
                  required 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Performance</label>
                <select 
                  value={behavior}
                  onChange={(e) => setBehavior(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="needs improvement">Needs Improvement</option>
                </select>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Recent Marks & Assessments</label>
                <button 
                  type="button" 
                  onClick={addMark}
                  className="text-sm flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Result
                </button>
              </div>
              
              {marks.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No marks added yet. Click 'Add Result' to include grades.</p>
              ) : (
                <div className="space-y-3">
                  {marks.map((mark, index) => (
                    <div key={index} className="flex flex-wrap gap-2 items-end bg-white p-3 rounded shadow-sm border border-gray-100">
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                        <input type="date" value={mark.date} onChange={(e) => updateMark(index, 'date', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-200 rounded" required />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs text-gray-500 mb-1">Subject</label>
                        <input type="text" value={mark.subject} onChange={(e) => updateMark(index, 'subject', e.target.value)} placeholder="e.g. Science" className="w-full text-sm px-2 py-1 border border-gray-200 rounded" required />
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
                        <input type="number" value={mark.score} onChange={(e) => updateMark(index, 'score', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-200 rounded" required />
                      </div>
                      <div className="w-16">
                        <label className="block text-xs text-gray-500 mb-1">Out of</label>
                        <input type="number" value={mark.maxScore} onChange={(e) => updateMark(index, 'maxScore', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-200 rounded" required />
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

            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition">
              Create Student Profile
            </button>

            {studentSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center mt-4">
                <UserCheck className="w-5 h-5 mr-2" />
                Student profile created successfully!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
