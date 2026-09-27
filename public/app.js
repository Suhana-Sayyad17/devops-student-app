let students = [];

// ===============================
// SECTION NAVIGATION
// ===============================

function showSection(id, button) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });

    const selectedSection = document.getElementById(id);

    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }

    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active');
    });

    if (button) {
        button.classList.add('active');
    }

    if (id === 'students') {
        loadStudents();
    }

    if (id === 'dashboard') {
        loadStats();
    }
}


// ===============================
// DASHBOARD STATISTICS
// ===============================

async function loadStats() {
    try {
        const response = await fetch('/api/stats');

        if (!response.ok) {
            throw new Error('Unable to load statistics');
        }

        const data = await response.json();

        document.getElementById('total').textContent =
            data.totalStudents;

        document.getElementById('attendance').textContent =
            data.averageAttendance + '%';

        document.getElementById('marks').textContent =
            data.averageMarks + '%';

        document.getElementById('departments').textContent =
            data.departments;

    } catch (error) {
        console.error('Statistics error:', error);
        toast('Unable to load dashboard statistics');
    }
}


// ===============================
// LOAD STUDENTS
// ===============================

async function loadStudents() {

    try {

        const searchElement =
            document.getElementById('search');

        const departmentElement =
            document.getElementById('departmentFilter');

        const search =
            searchElement ? searchElement.value.trim() : '';

        const department =
            departmentElement ? departmentElement.value : '';

        const url =
            `/api/students?q=${encodeURIComponent(search)}&department=${encodeURIComponent(department)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Unable to load students');
        }

        students = await response.json();

        const table =
            document.getElementById('studentTable');

        if (!table) {
            return;
        }

        if (students.length === 0) {

            table.innerHTML =
                '<tr><td colspan="7">No students found.</td></tr>';

            return;
        }

        table.innerHTML = students.map(student => `

            <tr>

                <td>${escapeHTML(student.rollNo)}</td>

                <td>${escapeHTML(student.name)}</td>

                <td>${escapeHTML(student.department)}</td>

                <td>${escapeHTML(student.year)}</td>

                <td>${student.attendance}%</td>

                <td>${student.marks}%</td>

                <td>

                    <button
                        class="edit"
                        onclick="editStudent(${student.id})">
                        Edit
                    </button>

                    <button
                        class="danger"
                        onclick="deleteStudent(${student.id})">
                        Delete
                    </button>

                </td>

            </tr>

        `).join('');

    } catch (error) {

        console.error('Student loading error:', error);

        toast('Unable to load student records');
    }
}


// ===============================
// LOAD DEPARTMENTS
// ===============================

async function loadDepartments() {

    try {

        const response =
            await fetch('/api/departments');

        if (!response.ok) {
            throw new Error('Unable to load departments');
        }

        const departments =
            await response.json();

        const select =
            document.getElementById('departmentFilter');

        if (!select) {
            return;
        }

        // Keep the default option
        select.innerHTML =
            '<option value="">All Departments</option>';

        departments.forEach(departmentName => {

            const option =
                document.createElement('option');

            option.value = departmentName;

            option.textContent = departmentName;

            select.appendChild(option);
        });

    } catch (error) {

        console.error('Department loading error:', error);

        toast('Unable to load departments');
    }
}


// ===============================
// ADD / UPDATE STUDENT
// ===============================

async function saveStudent(event) {

    event.preventDefault();

    // Get values explicitly using getElementById
    // This fixes the previous "required fields" problem.

    const studentId =
        document.getElementById('studentId').value.trim();

    const studentName =
        document.getElementById('name').value.trim();

    const rollNumber =
        document.getElementById('rollNo').value.trim();

    const departmentName =
        document.getElementById('department').value;

    const studentYear =
        document.getElementById('year').value;

    const studentEmail =
        document.getElementById('email').value.trim();

    const studentPhone =
        document.getElementById('phone').value.trim();

    const attendance =
        document.getElementById('attendanceInput').value;

    const marks =
        document.getElementById('marksInput').value;


    // ===============================
    // FRONTEND VALIDATION
    // ===============================

    if (
        !studentName ||
        !rollNumber ||
        !departmentName ||
        !studentYear ||
        !studentEmail
    ) {

        toast(
            'Name, roll number, department, year and email are required'
        );

        return;
    }


    // ===============================
    // PREPARE DATA
    // ===============================

    const studentData = {

        name: studentName,

        rollNo: rollNumber,

        department: departmentName,

        year: studentYear,

        email: studentEmail,

        phone: studentPhone,

        attendance: Number(attendance || 0),

        marks: Number(marks || 0)

    };


    try {

        // ===============================
        // ADD OR UPDATE
        // ===============================

        const url = studentId
            ? `/api/students/${studentId}`
            : '/api/students';

        const method = studentId
            ? 'PUT'
            : 'POST';


        const response = await fetch(url, {

            method: method,

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(studentData)

        });


        const data =
            await response.json();


        // ===============================
        // ERROR HANDLING
        // ===============================

        if (!response.ok) {

            toast(
                data.error || 'Operation failed'
            );

            return;
        }


        // ===============================
        // SUCCESS MESSAGE
        // ===============================

        if (studentId) {

            toast(
                'Student updated successfully'
            );

        } else {

            toast(
                'Student added successfully'
            );

        }


        // ===============================
        // RESET FORM
        // ===============================

        resetForm();


        // Refresh dashboard
        await loadStats();


        // Open student records
        setTimeout(() => {

            showSection('students');

        }, 500);


    } catch (error) {

        console.error('Save student error:', error);

        toast(
            'Server error. Please try again.'
        );
    }
}


// ===============================
// EDIT STUDENT
// ===============================

function editStudent(id) {

    const student =
        students.find(
            item => Number(item.id) === Number(id)
        );

    if (!student) {

        toast('Student record not found');

        return;
    }


    document.getElementById('studentId').value =
        student.id;

    document.getElementById('name').value =
        student.name;

    document.getElementById('rollNo').value =
        student.rollNo;

    document.getElementById('department').value =
        student.department;

    document.getElementById('year').value =
        student.year;

    document.getElementById('email').value =
        student.email;

    document.getElementById('phone').value =
        student.phone || '';

    document.getElementById('attendanceInput').value =
        student.attendance || 0;

    document.getElementById('marksInput').value =
        student.marks || 0;


    document.getElementById('formTitle').textContent =
        'Edit Student';


    // Show Add/Edit form
    showSection('add');
}


// ===============================
// DELETE STUDENT
// ===============================

async function deleteStudent(id) {

    const confirmed =
        confirm(
            'Are you sure you want to delete this student?'
        );

    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/students/${id}`,
                {
                    method: 'DELETE'
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            toast(
                data.error || 'Unable to delete student'
            );

            return;
        }


        toast(
            data.message ||
            'Student deleted successfully'
        );


        // Refresh records
        await loadStudents();

        // Refresh dashboard
        await loadStats();


    } catch (error) {

        console.error(
            'Delete student error:',
            error
        );

        toast(
            'Server error. Unable to delete student.'
        );
    }
}


// ===============================
// RESET FORM
// ===============================

function resetForm() {

    const form =
        document.getElementById('studentForm');

    if (form) {
        form.reset();
    }


    document.getElementById('studentId').value =
        '';


    document.getElementById('formTitle').textContent =
        'Add New Student';


    document.getElementById('attendanceInput').value =
        0;


    document.getElementById('marksInput').value =
        0;
}


// ===============================
// EXPORT STUDENTS TO CSV
// ===============================

function exportCSV() {

    window.location.href =
        '/api/students/export';
}


// ===============================
// TOAST MESSAGE
// ===============================

function toast(message) {

    const toastElement =
        document.getElementById('toast');

    if (!toastElement) {
        return;
    }


    toastElement.textContent =
        message;

    toastElement.style.display =
        'block';


    setTimeout(() => {

        toastElement.style.display =
            'none';

    }, 2500);
}


// ===============================
// SYSTEM HEALTH CHECK
// ===============================

async function healthCheck() {

    const healthElement =
        document.getElementById('health');


    try {

        const response =
            await fetch('/api/health');


        if (response.ok) {

            healthElement.textContent =
                '● System UP';

        } else {

            healthElement.textContent =
                '● System DOWN';

        }

    } catch (error) {

        healthElement.textContent =
            '● System DOWN';

    }
}


// ===============================
// HTML SECURITY HELPER
// ===============================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;')

        .replace(/'/g, '&#039;');
}


// ===============================
// FORM SUBMIT EVENT
// ===============================

const studentForm =
    document.getElementById('studentForm');

if (studentForm) {

    studentForm.addEventListener(
        'submit',
        saveStudent
    );

}


// ===============================
// INITIAL APPLICATION LOAD
// ===============================

loadStats();

loadDepartments();

healthCheck();


// ===============================
// AUTOMATIC HEALTH CHECK
// Every 30 seconds
// ===============================

setInterval(
    healthCheck,
    30000
);