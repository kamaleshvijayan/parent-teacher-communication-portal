const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');
const Student = require('./models/Student');
const Message = require('./models/Message');

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
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB Atlas');
        seedDatabase(); // Optional helper to seed initial data
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}
startDatabase();

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

// --- AUTHENTICATION ---
app.post('/api/login', async (req, res) => {
    try {
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
                    password: 'demo',
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
        const student = await Student.findOneAndUpdate(
            { id: req.params.id },
            updateData,
            { new: true }
        );

        if (!student) return res.status(404).json({ message: 'Student not found' });
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
