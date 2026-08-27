# Parent-Teacher Communication Portal

A modern web application for seamless communication between parents and teachers, built with React and Express.

## 🌟 Features

- **Messaging System**: Send and receive messages between teachers and parents
- **Role-Based Access**: Separate dashboards for teachers and parents
- **Student Management**: Track student information and performance
- **Face Attendance**: Teachers can enroll student face descriptors and mark daily attendance from a camera scan
- **Real-Time Updates**: Messages are instantly saved and retrieved
- **File-Based Backend**: No database installation required - uses JSON file storage

## 🚀 Tech Stack

### Frontend
- React 18
- TypeScript
- React Router for navigation
- Zustand for state management
- Tailwind CSS for styling
- Vite for build tooling

### Backend
- Node.js
- Express.js
- File-based JSON storage
- CORS enabled for local development

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kamaleshvijayan/Parent-Teacher-Communication-Portal.git
   cd Parent-Teacher-Communication-Portal
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

## 🎯 Usage

### Running the Application

1. **Start the backend server** (in project root):
   ```bash
   npm run server
   ```
   Server will run on `http://localhost:5001`

2. **Start the frontend** (in a new terminal, in project root):
   ```bash
   npm start
   ```
   Frontend will run on `http://localhost:5173`

### Face attendance setup

Log in as a teacher and open **Face Attendance**. Start the camera, select a student, and capture an enrollment image. Later scans compare the browser-generated 128-value face descriptor against enrolled students; only a matching descriptor below the server threshold is marked present. Images are not uploaded or stored. The model weights are loaded from the face-api.js model host on first use, so the browser needs network access during model loading.

### Login Credentials

**Teacher Account:**
- Email: `teacher@school.com` (or any email containing "teacher")
- Password: any password

**Parent Account:**
- Email: `parent@school.com` (or any email NOT containing "teacher")
- Password: any password

## 📁 Project Structure

```
Parent-Teacher-Communication-Portal/
├── src/                      # Frontend source code
│   ├── components/          # React components
│   ├── context/            # Context providers
│   ├── hooks/              # Custom hooks
│   ├── data/               # Mock data
│   └── styles/             # CSS files
├── server/                  # Backend source code
│   ├── data/               # JSON data storage
│   │   └── messages.json   # Messages database
│   └── index.js            # Express server
├── package.json            # Frontend dependencies
└── README.md
```

## 💡 How It Works

1. **Authentication**: Simple role-based authentication using email patterns
2. **Messaging**: 
   - Teachers can send messages to parents
   - Parents can reply to teachers
   - All messages are stored in `server/data/messages.json`
3. **Data Persistence**: Messages persist across sessions using file-based storage

## 🔧 API Endpoints

- `GET /api/messages` - Retrieve all messages
- `POST /api/messages` - Create a new message
- `PATCH /api/messages/:id/read` - Mark message as read
- `PATCH /api/messages/:id` - Update message content
- `GET /api/attendance/today` - Retrieve today's face attendance records
- `PUT /api/students/:id/face` - Save or replace a student's face descriptor
- `POST /api/attendance/recognize` - Match a descriptor and record presence

## 🛠️ Development

### Available Scripts

- `npm start` - Start frontend development server
- `npm run server` - Start backend server
- `npm run build` - Build frontend for production

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Kamalesh Vijayan

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Made with ❤️ for better parent-teacher communication