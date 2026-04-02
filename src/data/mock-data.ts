export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher' | 'admin';
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  studentName?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: 'teacher' | 'admin';
  timestamp: string;
  category: 'general' | 'event' | 'urgent';
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  className: string;
  teacherId: string;
  teacherName: string;
  parentIds: string[];
  email?: string;
  attendance: number;
  behavior: 'excellent' | 'good' | 'needs improvement';
  recentMarks: {
    subject: string;
    grade: string;
    score: number;
    maxScore: number;
    date: string;
    type: 'test' | 'quiz' | 'homework' | 'project';
  }[];
}

export const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: 't1',
    senderName: 'Ms. Sarah Johnson',
    senderRole: 'teacher',
    recipientId: 'p1',
    recipientName: 'John Smith',
    subject: 'Emma\'s Progress Update',
    content: 'Hi John, I wanted to share that Emma has been doing exceptionally well in her math class. She showed great improvement in her recent test scores and actively participates in class discussions. Keep up the great work!',
    timestamp: '2026-02-10T14:30:00',
    read: false,
    studentName: 'Emma Smith',
  },
  {
    id: 'm2',
    senderId: 'p1',
    senderName: 'John Smith',
    senderRole: 'parent',
    recipientId: 't1',
    recipientName: 'Ms. Sarah Johnson',
    subject: 'Question about homework',
    content: 'Hi Ms. Johnson, Emma had some questions about the science project due next week. Could you clarify what materials we need to bring from home?',
    timestamp: '2026-02-09T16:45:00',
    read: true,
    studentName: 'Emma Smith',
  },
  {
    id: 'm3',
    senderId: 't2',
    senderName: 'Mr. David Anderson',
    senderRole: 'teacher',
    recipientId: 'p1',
    recipientName: 'John Smith',
    subject: 'Parent-Teacher Conference',
    content: 'Dear John, I would like to schedule a parent-teacher conference to discuss Emma\'s upcoming science fair project. Are you available next Tuesday at 3:30 PM?',
    timestamp: '2026-02-08T10:15:00',
    read: false,
    studentName: 'Emma Smith',
  },
  {
    id: 'm4',
    senderId: 't1',
    senderName: 'Ms. Sarah Johnson',
    senderRole: 'teacher',
    recipientId: 'p2',
    recipientName: 'Lisa Brown',
    subject: 'Great Job on Presentation',
    content: 'Hi Lisa, I wanted to let you know that Michael did an excellent job on his history presentation today. He was well-prepared and spoke confidently. You should be proud!',
    timestamp: '2026-02-07T13:20:00',
    read: true,
    studentName: 'Michael Brown',
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'School Field Trip - Science Museum',
    content: 'We are organizing a field trip to the Science Museum on March 15th. Permission slips will be sent home this week. The cost is $15 per student, which includes transportation and admission.',
    authorName: 'Ms. Sarah Johnson',
    authorRole: 'teacher',
    timestamp: '2026-02-10T09:00:00',
    category: 'event',
  },
  {
    id: 'a2',
    title: 'Parent-Teacher Conference Week',
    content: 'Parent-teacher conferences will be held during the week of February 24-28. Please sign up for your preferred time slot using the online scheduler. Each conference is 20 minutes.',
    authorName: 'Principal Roberts',
    authorRole: 'admin',
    timestamp: '2026-02-09T08:30:00',
    category: 'general',
  },
  {
    id: 'a3',
    title: 'School Closure - Weather Alert',
    content: 'Due to the winter storm warning, school will be closed tomorrow, February 12th. All after-school activities are also cancelled. Stay safe!',
    authorName: 'Principal Roberts',
    authorRole: 'admin',
    timestamp: '2026-02-11T06:00:00',
    category: 'urgent',
  },
  {
    id: 'a4',
    title: 'Spring Concert Rehearsals Begin',
    content: 'Rehearsals for the Spring Concert will begin next week. Students participating should arrive at the music room by 3:15 PM on Tuesdays and Thursdays.',
    authorName: 'Ms. Emily Chen',
    authorRole: 'teacher',
    timestamp: '2026-02-08T14:00:00',
    category: 'event',
  },
];

export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Emma Smith',
    grade: '5th Grade',
    className: 'Room 204',
    teacherId: 't1',
    teacherName: 'Ms. Sarah Johnson',
    parentIds: ['p1'],
    email: 'emma.smith@school.com',
    attendance: 96,
    behavior: 'excellent',
    recentMarks: [
      { subject: 'Mathematics', grade: 'A', score: 92, maxScore: 100, date: '2026-02-08', type: 'test' },
      { subject: 'Science', grade: 'A-', score: 88, maxScore: 100, date: '2026-02-07', type: 'quiz' },
      { subject: 'English', grade: 'B+', score: 87, maxScore: 100, date: '2026-02-06', type: 'homework' },
      { subject: 'History', grade: 'A', score: 94, maxScore: 100, date: '2026-02-05', type: 'project' },
      { subject: 'Mathematics', grade: 'A+', score: 98, maxScore: 100, date: '2026-02-03', type: 'homework' },
    ],
  },
  {
    id: 's2',
    name: 'Michael Brown',
    grade: '5th Grade',
    className: 'Room 204',
    teacherId: 't1',
    teacherName: 'Ms. Sarah Johnson',
    parentIds: ['p2'],
    email: 'michael.brown@school.com',
    attendance: 92,
    behavior: 'good',
    recentMarks: [
      { subject: 'Mathematics', grade: 'B+', score: 85, maxScore: 100, date: '2026-02-08', type: 'test' },
      { subject: 'Science', grade: 'A', score: 91, maxScore: 100, date: '2026-02-07', type: 'quiz' },
      { subject: 'English', grade: 'B', score: 82, maxScore: 100, date: '2026-02-06', type: 'homework' },
      { subject: 'History', grade: 'A-', score: 89, maxScore: 100, date: '2026-02-05', type: 'project' },
      { subject: 'Physical Education', grade: 'A+', score: 100, maxScore: 100, date: '2026-02-04', type: 'test' },
    ],
  },
  {
    id: 's3',
    name: 'Sophia Garcia',
    grade: '5th Grade',
    className: 'Room 204',
    teacherId: 't1',
    teacherName: 'Ms. Sarah Johnson',
    parentIds: ['p3'],
    email: 'sophia.garcia@school.com',
    attendance: 98,
    behavior: 'excellent',
    recentMarks: [
      { subject: 'Mathematics', grade: 'A+', score: 97, maxScore: 100, date: '2026-02-08', type: 'test' },
      { subject: 'Science', grade: 'A+', score: 96, maxScore: 100, date: '2026-02-07', type: 'quiz' },
      { subject: 'English', grade: 'A', score: 93, maxScore: 100, date: '2026-02-06', type: 'homework' },
      { subject: 'History', grade: 'A+', score: 99, maxScore: 100, date: '2026-02-05', type: 'project' },
      { subject: 'Art', grade: 'A', score: 95, maxScore: 100, date: '2026-02-03', type: 'project' },
    ],
  },
];