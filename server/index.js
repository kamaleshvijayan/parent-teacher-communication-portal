const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');
const Student = require('./models/Student');
const Message = require('./models/Message');
const Announcement = require('./models/Announcement');
const Attendance = require('./models/Attendance');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

require('dotenv').config();

// Connect to MongoDB Atlas
async function startDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('MONGODB_URI environment variable is missing.');
            return false;
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB Atlas');
        await seedDatabase(); // Ensure demo accounts exist before login requests are handled.
        return true;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        return false;
    }
}
const databaseReady = startDatabase();

async function seedDatabase() {
    try {
        // Seed admin if not exists
        const adminExists = await User.findOne({ email: 'admin@school.com' });
        if (!adminExists) {
            await User.create({
                id: 'a1',
                name: 'System Admin',
                email: 'admin@school.com',
                password: 'demo',
                role: 'admin'
            });
            console.log('Seeded default admin');
        }

        const teacherExists = await User.findOne({ email: 'teacher@school.com' });
        if (!teacherExists) {
            await User.create({
                id: 't1',
                name: 'Ms. Sarah Johnson',
                email: 'teacher@school.com',
                password: 'demo',
                role: 'teacher'
            });
            console.log('Seeded default teacher');
        }

        const parentExists = await User.findOne({ email: 'parent@example.com' });
        if (!parentExists) {
            await User.create({
                id: 'p1',
                name: 'John Smith',
                email: 'parent@example.com',
                password: 'demo',
                role: 'parent'
            });
            console.log('Seeded default parent');
        }
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}
app.get('/',(req,res)=>{
    res.send("hi")
})
// --- AUTHENTICATION ---
app.post('/api/login', async (req, res) => {
    try {
        if (!(await databaseReady) || mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database is unavailable' });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        
        if (user) {
            const userObj = user.toObject();
            delete userObj.password;
            res.json(userObj);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- USERS ---
app.get('/api/users', async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const newUser = new User({
            id: 't' + Date.now().toString(),
            name,
            email,
            password: password || 'demo',
            role: role || 'teacher'
        });

        await newUser.save();
        const userObj = newUser.toObject();
        delete userObj.password;
        res.status(201).json(userObj);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (password) updateData.password = password;

        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            updateData,
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const userObj = user.toObject();
        delete userObj.password;
        res.json(userObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ id: req.params.id });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- STUDENTS ---
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/attendance/today', async (req, res) => {
    try {
        const dateKey = new Date().toISOString().slice(0, 10);
        const records = await Attendance.find({ dateKey }).sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/students/:id/face', async (req, res) => {
    try {
        const { descriptor } = req.body;
        if (!Array.isArray(descriptor) || descriptor.length !== 128 || descriptor.some(value => typeof value !== 'number' || !Number.isFinite(value))) {
            return res.status(400).json({ message: 'A valid 128-value face descriptor is required.' });
        }

        const student = await Student.findOneAndUpdate(
            { id: req.params.id },
            { faceDescriptor: descriptor, faceEnrolledAt: new Date() },
            { new: true }
        ).select('+faceDescriptor');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json({ id: student.id, name: student.name, faceEnrolledAt: student.faceEnrolledAt });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/attendance/recognize', async (req, res) => {
    try {
        const { descriptor } = req.body;
        if (!Array.isArray(descriptor) || descriptor.length !== 128) {
            return res.status(400).json({ message: 'A valid face descriptor is required.' });
        }

        const students = await Student.find({ faceDescriptor: { $exists: true, $ne: [] } }).select('+faceDescriptor');
        let bestMatch = null;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (const student of students) {
            const distance = Math.sqrt(student.faceDescriptor.reduce((sum, value, index) => sum + Math.pow(value - descriptor[index], 2), 0));
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = student;
            }
        }

        const threshold = 0.55;
        if (!bestMatch || bestDistance > threshold) {
            return res.status(404).json({ message: 'Face not recognized', distance: bestDistance === Number.POSITIVE_INFINITY ? null : bestDistance });
        }

        const dateKey = new Date().toISOString().slice(0, 10);
        const record = await Attendance.findOneAndUpdate(
            { studentId: bestMatch.id, dateKey },
            { studentId: bestMatch.id, dateKey, status: 'present', confidence: Number((1 - bestDistance).toFixed(4)) },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ student: { id: bestMatch.id, name: bestMatch.name, grade: bestMatch.grade }, distance: bestDistance, record });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const parentEmail = req.body.email;
        let parentUser = null;
        
        if (parentEmail) {
            parentUser = await User.findOne({ email: parentEmail });
            if (!parentUser) {
                parentUser = new User({
                    id: 'p' + Date.now().toString(),
                    name: 'Parent of ' + req.body.name,
                    email: parentEmail,
                    password: req.body.parentPassword || 'demo',
                    role: 'parent'
                });
                await parentUser.save();
            }
        }
        
        const newStudent = new Student({
            id: 's' + Date.now().toString(),
            recentMarks: [],
            attendance: 100,
            behavior: 'good',
            ...req.body,
            parentIds: parentUser ? [parentUser.id] : []
        });

        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        const parentPassword = updateData.parentPassword;
        delete updateData.parentPassword;

        const existingStudent = await Student.findOne({ id: req.params.id });
        if (!existingStudent) return res.status(404).json({ message: 'Student not found' });

        const student = await Student.findOneAndUpdate(
            { id: req.params.id },
            updateData,
            { new: true }
        );

        if (existingStudent.parentIds && existingStudent.parentIds.length > 0) {
            const parentUpdate = {};
            if (updateData.email) parentUpdate.email = updateData.email;
            if (parentPassword) parentUpdate.password = parentPassword;
            if (updateData.name) parentUpdate.name = 'Parent of ' + updateData.name;

            if (Object.keys(parentUpdate).length > 0) {
                await User.findOneAndUpdate(
                    { id: existingStudent.parentIds[0] },
                    parentUpdate
                );
            }
        } else if (parentPassword && updateData.email) {
            await User.findOneAndUpdate(
                { email: updateData.email, role: 'parent' },
                { password: parentPassword }
            );
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({ id: req.params.id });
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- MESSAGES ---
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const newMessage = new Message({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false,
            ...req.body
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.patch('/api/messages/:id/read', async (req, res) => {
    try {
        const message = await Message.findOneAndUpdate(
            { id: req.params.id },
            { read: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/messages/:id', async (req, res) => {
    try {
        const updateData = {};
        if (req.body.subject) updateData.subject = req.body.subject;
        if (req.body.content) updateData.content = req.body.content;

        const message = await Message.findOneAndUpdate(
            { id: req.params.id },
            updateData,
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        const message = await Message.findOneAndDelete({ id: req.params.id });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- ANNOUNCEMENTS ---
app.get('/api/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ timestamp: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/announcements', async (req, res) => {
    try {
        const newAnnouncement = new Announcement({
            id: 'a' + Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...req.body
        });

        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/announcements/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findOneAndDelete({ id: req.params.id });

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
