const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'students.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureData() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ students: [] }, null, 2));
    }
}

function readData() {
    ensureData();
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
    ensureData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function nextId(students) {
    return students.length ? Math.max(...students.map(s => Number(s.id))) + 1 : 1;
}

app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        application: 'Student Management System',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/stats', (req, res) => {
    const { students } = readData();
    const total = students.length;
    const avgAttendance = total ? students.reduce((a,s)=>a+Number(s.attendance||0),0)/total : 0;
    const avgMarks = total ? students.reduce((a,s)=>a+Number(s.marks||0),0)/total : 0;
    const departments = [...new Set(students.map(s => s.department).filter(Boolean))];
    res.json({
        totalStudents: total,
        averageAttendance: Number(avgAttendance.toFixed(2)),
        averageMarks: Number(avgMarks.toFixed(2)),
        departments: departments.length
    });
});

app.get('/api/students', (req, res) => {
    const { students } = readData();
    const q = String(req.query.q || '').toLowerCase();
    const department = String(req.query.department || '').toLowerCase();

    let result = students.filter(s => {
        const matchesQ = !q ||
            String(s.name).toLowerCase().includes(q) ||
            String(s.rollNo).toLowerCase().includes(q) ||
            String(s.email).toLowerCase().includes(q);
        const matchesDept = !department || String(s.department).toLowerCase() === department;
        return matchesQ && matchesDept;
    });

    res.json(result);
});

app.get('/api/students/:id', (req, res) => {
    const { students } = readData();
    const student = students.find(s => Number(s.id) === Number(req.params.id));
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
});

app.post('/api/students', (req, res) => {
    const data = readData();
    const { name, rollNo, department, year, email, phone, attendance, marks } = req.body;

    if (!name || !rollNo || !department || !year || !email) {
        return res.status(400).json({ error: 'Name, roll number, department, year and email are required' });
    }

    if (data.students.some(s => String(s.rollNo).toLowerCase() === String(rollNo).toLowerCase())) {
        return res.status(409).json({ error: 'Roll number already exists' });
    }

    const student = {
        id: nextId(data.students),
        name, rollNo, department, year, email,
        phone: phone || '',
        attendance: Number(attendance || 0),
        marks: Number(marks || 0),
        createdAt: new Date().toISOString()
    };

    data.students.push(student);
    writeData(data);
    res.status(201).json(student);
});

app.put('/api/students/:id', (req, res) => {
    const data = readData();
    const index = data.students.findIndex(s => Number(s.id) === Number(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Student not found' });

    const old = data.students[index];
    data.students[index] = {
        ...old,
        ...req.body,
        id: old.id,
        attendance: Number(req.body.attendance ?? old.attendance),
        marks: Number(req.body.marks ?? old.marks),
        updatedAt: new Date().toISOString()
    };

    writeData(data);
    res.json(data.students[index]);
});

app.delete('/api/students/:id', (req, res) => {
    const data = readData();
    const before = data.students.length;
    data.students = data.students.filter(s => Number(s.id) !== Number(req.params.id));

    if (data.students.length === before) {
        return res.status(404).json({ error: 'Student not found' });
    }

    writeData(data);
    res.json({ message: 'Student deleted successfully' });
});

app.get('/api/departments', (req, res) => {
    const { students } = readData();
    res.json([...new Set(students.map(s => s.department).filter(Boolean))].sort());
});

app.get('/api/students/export', (req, res) => {
    const { students } = readData();
    const header = 'ID,Name,Roll No,Department,Year,Email,Phone,Attendance,Marks\n';
    const csv = students.map(s =>
        [s.id,s.name,s.rollNo,s.department,s.year,s.email,s.phone,s.attendance,s.marks]
        .map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(header + csv);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Student Management System running on port ${PORT}`);
    });
}

module.exports = app;
