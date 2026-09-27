# DevOps Student Management System

## Application Features
- Student registration
- Update and delete student records
- Search by name, roll number and email
- Department filtering
- Attendance and marks management
- Academic dashboard
- CSV export
- REST APIs
- Health-check API
- Responsive web interface

## DevOps Features
Developer -> GitHub -> Jenkins -> npm test -> Docker Build -> Docker Hub -> Ansible -> Deployment -> Health Check

## Local Run
```bash
npm install
npm test
npm start
```
Open http://localhost:3000

## Docker
```bash
docker build -t suhanasayyad17/devops-student-management:latest .
docker run -d --name student-app -p 3000:3000 suhanasayyad17/devops-student-management:latest
```

## API Endpoints
GET    /api/health
GET    /api/stats
GET    /api/students
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
GET    /api/departments
GET    /api/students/export
