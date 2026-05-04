// js/data.js

const DB_KEY = 'excel_master_db';

const defaultSeedData = {
    users: {
        admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Master' },
        siswa: { username: 'siswa', password: 'siswa123', role: 'siswa', name: 'Siswa Excel', progress: { completedLessons: [], quizScores: {} } }
    },
    courses: [
        { id: 'c1', title: 'Pengenalan Excel 2021', level: 1, description: 'Materi dasar untuk pemula mutlak.', icon: 'functions' },
        { id: 'c2', title: 'Pengolahan Data Dasar', level: 2, description: 'Fungsi esensial dan manajemen tabel.', icon: 'table_chart' },
        { id: 'c3', title: 'Analisis Data Menengah', level: 3, description: 'VLOOKUP, IF, dan Validasi Data.', icon: 'search' },
        { id: 'c4', title: 'Formula Lanjutan', level: 4, description: 'INDEX MATCH dan Pivot Dasar.', icon: 'calculate' },
        { id: 'c5', title: 'Excel Mastery', level: 5, description: 'Dashboard dan Visualisasi.', icon: 'insert_chart' }
    ],
    lessons: [
        // Level 1
        { id: 'l1_1', courseId: 'c1', title: 'Mengenal Interface Excel', content: '<h3>Mengenal Ribbon dan Cell</h3><p>Excel terdiri dari kolom (A, B, C) dan baris (1, 2, 3). Pertemuan keduanya disebut Cell.</p>' },
        { id: 'l1_2', courseId: 'c1', title: 'Fungsi SUM dan AVERAGE', content: '<h3>Fungsi Dasar Matematika</h3><p>Gunakan <code>=SUM(A1:A5)</code> untuk menjumlahkan, dan <code>=AVERAGE(A1:A5)</code> untuk mencari rata-rata.</p>' },
        // Level 2
        { id: 'l2_1', courseId: 'c2', title: 'MIN, MAX, COUNT', content: '<h3>Analisa Sederhana</h3><p><code>=MIN()</code> untuk nilai terkecil, <code>=MAX()</code> untuk terbesar, <code>=COUNT()</code> untuk menghitung jumlah data angka.</p>' },
        { id: 'l2_2', courseId: 'c2', title: 'Sorting & Filtering', content: '<h3>Filter Data</h3><p>Blok tabel, ke tab Data -> klik Filter. Anda bisa mengurutkan data dari A-Z.</p>' },
        // Level 3
        { id: 'l3_1', courseId: 'c3', title: 'VLOOKUP Dasar', content: '<h3>Mencari Data Vertical</h3><p>Rumus: <code>=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])</code>.</p>' },
        { id: 'l3_2', courseId: 'c3', title: 'IF Bertingkat', content: '<h3>Logika Kondisional</h3><p><code>=IF(A1>80, "Lulus", IF(A1>60, "Remedial", "Gagal"))</code></p>' },
        // Level 4
        { id: 'l4_1', courseId: 'c4', title: 'INDEX & MATCH', content: '<h3>Alternatif VLOOKUP</h3><p>Kombinasi rumus ini bisa mencari data ke arah kiri, sesuatu yang tidak bisa dilakukan VLOOKUP.</p>' },
        { id: 'l4_2', courseId: 'c4', title: 'Pivot Table Dasar', content: '<h3>Meringkas Ribuan Baris</h3><p>Insert -> PivotTable. Drag field ke Rows dan Values untuk membuat laporan otomatis.</p>' },
        // Level 5
        { id: 'l5_1', courseId: 'c5', title: 'Dashboard Sederhana', content: '<h3>Slicer & Chart</h3><p>Gunakan Slicer untuk memfilter chart secara interaktif.</p>' }
    ],
    quizzes: [
        { 
            id: 'q1', courseId: 'c1', 
            questions: [
                { q: 'Apa rumus untuk menjumlahkan data?', options: ['=SUM()', '=ADD()', '=TOTAL()', '=COUNT()'], correct: 0 },
                { q: 'Kolom di Excel direpresentasikan dengan?', options: ['Angka', 'Huruf', 'Simbol', 'Warna'], correct: 1 }
            ] 
        },
        { 
            id: 'q3', courseId: 'c3', 
            questions: [
                { q: 'Parameter ke-3 pada VLOOKUP adalah?', options: ['lookup_value', 'table_array', 'col_index_num', 'range_lookup'], correct: 2 }
            ] 
        }
    ]
};

// Database Service
const DB = {
    init() {
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(defaultSeedData));
            console.log('Database seeded with default values.');
        }
    },
    
    read() {
        return JSON.parse(localStorage.getItem(DB_KEY));
    },

    write(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    },

    // --- COURSES ---
    getCourses() { return this.read().courses; },
    getCourse(id) { return this.read().courses.find(c => c.id === id); },
    addCourse(course) {
        const data = this.read();
        course.id = 'c_' + Date.now();
        data.courses.push(course);
        this.write(data);
    },
    updateCourse(id, updated) {
        const data = this.read();
        const index = data.courses.findIndex(c => c.id === id);
        if (index !== -1) {
            data.courses[index] = { ...data.courses[index], ...updated };
            this.write(data);
        }
    },
    deleteCourse(id) {
        const data = this.read();
        data.courses = data.courses.filter(c => c.id !== id);
        // Cascade delete lessons and quizzes
        data.lessons = data.lessons.filter(l => l.courseId !== id);
        data.quizzes = data.quizzes.filter(q => q.courseId !== id);
        this.write(data);
    },

    // --- LESSONS ---
    getLessonsByCourse(courseId) {
        return this.read().lessons.filter(l => l.courseId === courseId);
    },
    getLesson(id) { return this.read().lessons.find(l => l.id === id); },
    addLesson(lesson) {
        const data = this.read();
        lesson.id = 'l_' + Date.now();
        data.lessons.push(lesson);
        this.write(data);
    },
    updateLesson(id, updated) {
        const data = this.read();
        const index = data.lessons.findIndex(l => l.id === id);
        if (index !== -1) {
            data.lessons[index] = { ...data.lessons[index], ...updated };
            this.write(data);
        }
    },
    deleteLesson(id) {
        const data = this.read();
        data.lessons = data.lessons.filter(l => l.id !== id);
        this.write(data);
    },

    // --- QUIZZES ---
    getQuizByCourse(courseId) {
        return this.read().quizzes.find(q => q.courseId === courseId);
    },
    saveQuiz(courseId, questions) {
        const data = this.read();
        const existingIndex = data.quizzes.findIndex(q => q.courseId === courseId);
        if (existingIndex !== -1) {
            data.quizzes[existingIndex].questions = questions;
        } else {
            data.quizzes.push({ id: 'q_' + Date.now(), courseId, questions });
        }
        this.write(data);
    },
    deleteQuiz(courseId) {
        const data = this.read();
        data.quizzes = data.quizzes.filter(q => q.courseId !== courseId);
        this.write(data);
    },

    // --- PROGRESS ---
    getStudentProgress(username) {
        const data = this.read();
        const user = data.users[username];
        if (!user.progress) {
            user.progress = { completedLessons: [], quizScores: {}, lastActive: null, streak: 0, completedDate: null };
        }
        
        // Ensure properties exist
        if (!user.progress.completedLessons) user.progress.completedLessons = [];
        if (!user.progress.quizScores) user.progress.quizScores = {};
        if (user.progress.streak === undefined) user.progress.streak = 0;
        
        return user.progress;
    },
    recordActivity(username) {
        const data = this.read();
        const user = data.users[username];
        if (!user.progress) {
            user.progress = { completedLessons: [], quizScores: {}, lastActive: null, streak: 0, completedDate: null };
        }
        
        const today = new Date().setHours(0,0,0,0);
        if (user.progress.lastActive) {
            const lastActiveDate = new Date(user.progress.lastActive).setHours(0,0,0,0);
            const diffDays = Math.round((today - lastActiveDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                user.progress.streak = (user.progress.streak || 0) + 1;
                user.progress.lastActive = Date.now();
            } else if (diffDays > 1) {
                user.progress.streak = 1; // reset streak if missed a day
                user.progress.lastActive = Date.now();
            }
        } else {
            user.progress.streak = 1; // first time active
            user.progress.lastActive = Date.now();
        }
        
        data.users[username].progress = user.progress;
        this.write(data);
        this.syncSessionUser(data.users[username]);
    },
    markLessonComplete(username, lessonId) {
        this.recordActivity(username);
        const data = this.read();
        const progress = data.users[username].progress || { completedLessons: [], quizScores: {} };
        if (!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
            data.users[username].progress = progress;
            this.write(data);
            this.syncSessionUser(data.users[username]);
            this.checkAndRecordCompletion(username);
        }
    },
    resetStudentProgress(username) {
        const data = this.read();
        if (data.users[username]) {
            data.users[username].progress = { completedLessons: [], quizScores: {}, lastActive: null, streak: 0, completedDate: null };
            this.write(data);
            this.syncSessionUser(data.users[username]);
        }
    },
    saveQuizScore(username, courseId, score) {
        this.recordActivity(username);
        const data = this.read();
        const progress = data.users[username].progress || { completedLessons: [], quizScores: {} };
        progress.quizScores[courseId] = score;
        data.users[username].progress = progress;
        this.write(data);
        this.syncSessionUser(data.users[username]);
        this.checkAndRecordCompletion(username);
    },
    
    checkAndRecordCompletion(username) {
        const data = this.read();
        const progress = data.users[username].progress;
        if (progress && !progress.completedDate) {
            // Check if all are completed
            if (window.UI && window.UI.checkAllCompleted) {
                if (window.UI.checkAllCompleted(progress, data)) {
                    progress.completedDate = Date.now();
                    data.users[username].progress = progress;
                    this.write(data);
                    this.syncSessionUser(data.users[username]);
                }
            }
        }
    },
    
    // Auth sync helper
    syncSessionUser(dbUser) {
        const currentSessionStr = localStorage.getItem('user');
        if (currentSessionStr) {
            const currentSession = JSON.parse(currentSessionStr);
            if (currentSession.username === dbUser.username) {
                currentSession.progress = dbUser.progress;
                localStorage.setItem('user', JSON.stringify(currentSession));
            }
        }
    },
    
    getAllStudents() {
        const data = this.read();
        return Object.values(data.users).filter(u => u.role === 'siswa');
    }
};

DB.init();
window.DB = DB;
