import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, Loader2, ScanFace, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { ATTENDANCE_KEY, ATTENDANCE_UPDATED_EVENT, getAttendanceRecords, getTodayPresentIds } from '../data/local-attendance';

type Student = { id: string; name: string; grade?: string; faceEnrolledAt?: string };
type Result = { kind: 'success' | 'error' | 'info'; message: string };

const API = 'http://localhost:5001/api';
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
const FACE_PROFILES_KEY = 'face-attendance-profiles';

export function FaceAttendance() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const enrolledCount = students.filter(student => student.faceEnrolledAt).length;

  useEffect(() => {
    let mounted = true;
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).then(() => {
      if (mounted) setModelsReady(true);
    }).catch(() => {
      if (mounted) setResult({ kind: 'error', message: 'The face model could not be loaded. Check your network connection and reload.' });
    });
    fetch(`${API}/students`).then(response => response.json()).then((data: Student[]) => {
      const profiles = getFaceProfiles();
      setStudents(data.map(student => profiles[student.id] ? { ...student, faceEnrolledAt: 'local' } : student));
    }).catch(() => setResult({ kind: 'error', message: 'Unable to load students.' }));
    setTodayCount(getTodayAttendance().length);
    return () => { mounted = false; stopCamera(); };
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const getFaceProfiles = (): Record<string, number[]> => {
    try { return JSON.parse(localStorage.getItem(FACE_PROFILES_KEY) || '{}'); } catch { return {}; }
  };

  const getTodayAttendance = (): string[] => {
    try {
      const records = getAttendanceRecords();
      return records[new Date().toISOString().slice(0, 10)] || [];
    } catch { return []; }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setResult({ kind: 'info', message: 'Camera ready. Center one face in the frame.' });
    } catch {
      setResult({ kind: 'error', message: 'Camera permission is required for face attendance.' });
    }
  };

  const getDescriptor = async () => {
    if (!videoRef.current || !modelsReady) throw new Error('Face model is still loading.');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })).withFaceLandmarks().withFaceDescriptor();
      if (detection) return Array.from(detection.descriptor);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error('No clear face found. Look at the camera, move closer, and improve the lighting.');
  };

  const enroll = async () => {
    if (!selectedStudent) { setResult({ kind: 'error', message: 'Select a student before enrolling a face.' }); return; }
    if (!cameraReady) { setResult({ kind: 'error', message: 'Start the camera before capturing enrollment.' }); return; }
    if (!modelsReady) { setResult({ kind: 'error', message: 'The face model is still loading. Please try again in a moment.' }); return; }
    setBusy(true);
    try {
      const descriptor = await getDescriptor();
      const profiles = getFaceProfiles();
      profiles[selectedStudent] = descriptor;
      localStorage.setItem(FACE_PROFILES_KEY, JSON.stringify(profiles));
      setStudents(current => current.map(student => student.id === selectedStudent ? { ...student, faceEnrolledAt: new Date().toISOString() } : student));
      setResult({ kind: 'success', message: 'Face enrolled. The student can now be recognized.' });
    } catch (error) {
      setResult({ kind: 'error', message: error instanceof Error ? error.message : 'Enrollment failed.' });
    } finally { setBusy(false); }
  };

  const recognize = async () => {
    if (!cameraReady) { setResult({ kind: 'error', message: 'Start the camera before recognizing a face.' }); return; }
    if (!modelsReady) { setResult({ kind: 'error', message: 'The face model is still loading. Please try again in a moment.' }); return; }
    if (enrolledCount === 0) { setResult({ kind: 'error', message: 'No students are enrolled yet. Select a student and capture face enrollment first.' }); return; }
    setBusy(true);
    try {
      const descriptor = await getDescriptor();
      const profiles = getFaceProfiles();
      let bestStudent: Student | undefined;
      let bestDistance = Number.POSITIVE_INFINITY;
      students.forEach(student => {
        const profile = profiles[student.id];
        if (!profile) return;
        const distance = Math.sqrt(profile.reduce((sum, value, index) => sum + Math.pow(value - descriptor[index], 2), 0));
        if (distance < bestDistance) { bestDistance = distance; bestStudent = student; }
      });
      if (!bestStudent || bestDistance > 0.6) {
        const distanceText = Number.isFinite(bestDistance) ? ` Similarity distance: ${bestDistance.toFixed(3)}.` : '';
        throw new Error(`Face not recognized. Keep your face centered and try again.${distanceText}`);
      }
      const dateKey = new Date().toISOString().slice(0, 10);
      const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}');
      records[dateKey] = Array.from(new Set([...(records[dateKey] || []), bestStudent.id]));
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
      setTodayCount(records[dateKey].length);
      window.dispatchEvent(new Event(ATTENDANCE_UPDATED_EVENT));
      setResult({ kind: 'success', message: `${bestStudent.name} marked present.` });
    } catch (error) {
      setResult({ kind: 'error', message: error instanceof Error ? error.message : 'Recognition failed.' });
    } finally { setBusy(false); }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back to dashboard"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <div className="bg-blue-100 p-3 rounded-full"><ScanFace className="w-7 h-7 text-blue-600" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Face Attendance</h1><p className="text-gray-600">Enroll students and record today&apos;s presence securely.</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <section className="bg-gray-900 rounded-2xl p-4 shadow-sm">
          <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {!cameraReady && <div className="absolute text-center text-gray-300"><Camera className="w-10 h-10 mx-auto mb-2" /><p>Camera is off</p></div>}
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={cameraReady ? stopCamera : startCamera} className="px-4 py-2 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100">{cameraReady ? 'Stop camera' : 'Start camera'}</button>
            <button onClick={recognize} disabled={busy} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-50">{busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Recognize & mark present'}</button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enroll a student</h2>
            <select value={selectedStudent} onChange={event => setSelectedStudent(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option value="">Select student</option>
              {students.map(student => <option key={student.id} value={student.id}>{student.name}{student.faceEnrolledAt ? ' (enrolled)' : ''}</option>)}
            </select>
            <button type="button" onClick={enroll} disabled={busy} className="w-full mt-5 min-h-12 px-4 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              {busy ? 'Capturing face...' : 'Capture face enrollment'}
            </button>
            <p className="mt-2 text-xs text-gray-500">Start the camera, choose a student, then capture one clear face.</p>
          </div>
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6"><p className="text-sm text-blue-900">Present today</p><p className="text-3xl font-bold text-blue-950 mt-1">{todayCount}</p></div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-sm text-gray-700">{enrolledCount} of {students.length} students have face enrollment.</div>
          {result && <div className={`rounded-2xl border p-4 flex gap-3 ${result.kind === 'success' ? 'bg-green-50 border-green-200 text-green-800' : result.kind === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>{result.kind === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}<p className="text-sm">{result.message}</p></div>}
        </section>
      </div>
    </main>
  );
}
