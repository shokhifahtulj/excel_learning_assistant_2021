// js/student.js

document.addEventListener('DOMContentLoaded', () => {
    if (window.AuthService && window.AuthService.getRole() !== 'siswa') return;

    const path = window.location.pathname;

    if (path.includes('student-dashboard.html')) {
        initStudentDashboard();
    } else if (path.includes('student-courses.html')) {
        initStudentCourses();
    } else if (path.includes('student-lesson.html')) {
        initStudentLesson();
    } else if (path.includes('student-quiz.html')) {
        initStudentQuiz();
    } else if (path.includes('student-certificate.html')) {
        initStudentCertificate();
    }
});

function initStudentDashboard() {
    const user = window.AuthService.getCurrentUser();
    const progress = window.DB.getStudentProgress(user.username);
    const data = window.DB.read();
    
    // Calculate total progress
    const totalLessons = data.lessons.length;
    const completedLessons = progress.completedLessons.length;
    const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

    // Update DOM
    document.getElementById('student-name').innerText = user.name;
    document.getElementById('progress-text').innerText = `${percent}%`;
    const dasharray = `${percent}, 100`;
    document.getElementById('progress-circle').setAttribute('stroke-dasharray', dasharray);

    document.getElementById('stat-badges').innerText = Object.keys(progress.quizScores).length + ' Kuis Selesai';

    // Render Recent/Available Courses
    const container = document.getElementById('recent-courses-container');
    if (!container) return;
    container.innerHTML = '';

    const courses = data.courses.sort((a, b) => a.level - b.level).slice(0, 3); // show first 3
    
    if (courses.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-500">Belum ada materi tersedia.</p>`;
        return;
    }

    courses.forEach(course => {
        const courseLessons = window.DB.getLessonsByCourse(course.id);
        const completedInCourse = courseLessons.filter(l => progress.completedLessons.includes(l.id)).length;
        const cPercent = courseLessons.length === 0 ? 0 : Math.round((completedInCourse / courseLessons.length) * 100);
        
        let statusHtml = '';
        if (cPercent === 100) {
            statusHtml = `<span class="text-xs font-bold text-emerald-600 shrink-0">Selesai</span>`;
        } else {
            statusHtml = `<span class="text-xs font-bold text-amber-600 shrink-0">${cPercent}%</span>`;
        }

        const colors = ['gray', 'emerald', 'blue', 'indigo', 'orange', 'red'];
        const color = colors[course.level] || 'emerald';

        const card = document.createElement('a');
        card.href = `./student-courses.html#course-${course.id}`;
        card.className = `bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:shadow-lg transition-all-custom cursor-pointer group`;
        card.innerHTML = `
            <div class="w-16 h-16 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-3xl" data-icon="${course.icon}">${course.icon}</span>
            </div>
            <div class="flex-grow w-full">
                <div class="flex items-center gap-2 mb-1">
                    <span class="bg-${color}-100 text-${color}-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">LEVEL ${course.level}</span>
                    <h4 class="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">${course.title}</h4>
                </div>
                <p class="text-sm text-gray-500 line-clamp-1 mb-3">${course.description}</p>
                
                <div class="flex items-center gap-3">
                    <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-${cPercent === 100 ? 'emerald' : 'amber'}-500 h-full rounded-full" style="width: ${cPercent}%"></div>
                    </div>
                    ${statusHtml}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Render Achievements
    let badgeCount = 0;
    const completedCount = progress.completedLessons.length;
    if (completedCount >= 1 && completedCount <= 2) badgeCount = 1;
    else if (completedCount >= 3 && completedCount <= 5) badgeCount = 2;
    else if (completedCount > 5) badgeCount = 3;

    document.getElementById('stat-badge-text').innerText = `${badgeCount} Lencana`;
    document.getElementById('stat-streak-text').innerText = `${progress.streak || 0} Hari Runtun`;

    // Render Pending Task & Status
    const pendingContainer = document.getElementById('pending-task-container');
    let pendingQuizCourse = null;
    let totalQuizzes = 0;
    let completedQuizzes = 0;
    
    // Check total quizzes available and find pending ones
    for (const course of data.courses) {
        const quiz = window.DB.getQuizByCourse(course.id);
        if (quiz && quiz.questions.length > 0) {
            totalQuizzes++;
            const hasTakenQuiz = progress.quizScores[course.id] !== undefined;
            if (hasTakenQuiz) {
                completedQuizzes++;
            } else {
                // Not taken yet. Let's see if they should take it.
                // Should they? Yes, if they completed at least 1 lesson in this course, or if it's the very first course.
                // We'll just suggest the first untaken quiz of a started course.
                const courseLessons = window.DB.getLessonsByCourse(course.id);
                const hasCompletedLesson = courseLessons.some(l => progress.completedLessons.includes(l.id));
                if (hasCompletedLesson && !pendingQuizCourse) {
                    pendingQuizCourse = course;
                }
            }
        }
    }

    const isAllLessonsCompleted = (totalLessons > 0 && completedCount === totalLessons);
    const isAllQuizzesCompleted = (totalQuizzes === 0 || completedQuizzes === totalQuizzes);

    if (completedCount === 0 && completedQuizzes === 0) {
        // Belum Memulai
        pendingContainer.innerHTML = `
            <div class="bg-slate-50 rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
                <span class="material-symbols-outlined text-gray-400 text-3xl mb-2" data-icon="school">school</span>
                <h4 class="text-sm font-bold text-gray-700">Belum Memulai Pembelajaran</h4>
                <p class="text-xs text-gray-500 mt-1">Ayo mulai pelajari materi pertamamu!</p>
            </div>
        `;
    } else if (isAllLessonsCompleted && isAllQuizzesCompleted) {
        // Semua Tuntas
        pendingContainer.innerHTML = `
            <div class="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-5 text-center">
                <span class="material-symbols-outlined text-emerald-500 text-3xl mb-2" data-icon="workspace_premium">workspace_premium</span>
                <h4 class="text-sm font-bold text-emerald-800">Semua Tuntas!</h4>
                <p class="text-xs text-emerald-600 mt-1 mb-3">Luar biasa! Anda sudah menyelesaikan seluruh kurikulum Excel 2021.</p>
                <a href="student-certificate.html" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm block text-center">
                    Lihat Sertifikat
                </a>
            </div>
        `;
    } else if (pendingQuizCourse) {
        // Sedang Berjalan & Ada Quiz Tertunda
        pendingContainer.innerHTML = `
            <div class="bg-orange-50 rounded-2xl shadow-sm border border-orange-100 p-5">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                        <span class="material-symbols-outlined" data-icon="assignment">assignment</span>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-orange-900">Quiz Tertunda</h4>
                        <p class="text-xs text-orange-700">${pendingQuizCourse.title}</p>
                    </div>
                </div>
                <a href="student-quiz.html?courseId=${pendingQuizCourse.id}" class="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm block text-center">
                    Kerjakan Sekarang
                </a>
            </div>
        `;
    } else {
        // Sedang Berjalan tapi tidak ada Quiz pending (hanya perlu lanjut baca materi)
        pendingContainer.innerHTML = `
            <div class="bg-blue-50 rounded-2xl shadow-sm border border-blue-100 p-5 text-center">
                <span class="material-symbols-outlined text-blue-400 text-3xl mb-2" data-icon="menu_book">menu_book</span>
                <h4 class="text-sm font-bold text-blue-800">Sedang Belajar</h4>
                <p class="text-xs text-blue-600 mt-1">Terus lanjutkan membaca materi untuk membuka kuis berikutnya.</p>
                <a href="student-courses.html" class="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm block text-center">
                    Lanjut Belajar
                </a>
            </div>
        `;
    }
}

function initStudentCourses() {
    const user = window.AuthService.getCurrentUser();
    const progress = window.DB.getStudentProgress(user.username);
    const courses = window.DB.getCourses();
    const container = document.getElementById('courses-list-container');
    if (!container) return;

    container.innerHTML = '';
    
    if (courses.length === 0) {
        container.innerHTML = `<div class="p-8 text-center bg-white rounded-2xl border border-gray-100"><p class="text-gray-500">Belum ada materi/course.</p></div>`;
        return;
    }

    courses.sort((a, b) => a.level - b.level).forEach(course => {
        const lessons = window.DB.getLessonsByCourse(course.id);
        const quiz = window.DB.getQuizByCourse(course.id);
        const completedInCourse = lessons.filter(l => progress.completedLessons.includes(l.id)).length;
        const cPercent = lessons.length === 0 ? 0 : Math.round((completedInCourse / lessons.length) * 100);
        
        const isUnlocked = window.UI.isCourseUnlocked(course, progress, window.DB.read());

        const colors = ['gray', 'emerald', 'blue', 'indigo', 'orange', 'red'];
        // If locked, override color to gray
        const color = isUnlocked ? (colors[course.level] || 'emerald') : 'gray';

        const card = document.createElement('div');
        card.id = `course-${course.id}`;
        card.className = `bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mb-6 transition-all-custom ${!isUnlocked ? 'opacity-75 grayscale-[0.5]' : ''}`;
        
        // Lessons List HTML
        let lessonsHtml = '';
        if (!isUnlocked) {
            lessonsHtml = `
                <div class="p-6 bg-gray-50 flex flex-col items-center justify-center text-center">
                    <span class="material-symbols-outlined text-4xl text-gray-300 mb-2" data-icon="lock">lock</span>
                    <p class="text-sm font-bold text-gray-500">Terkunci</p>
                    <p class="text-xs text-gray-400 mt-1">Selesaikan level sebelumnya untuk membuka materi ini.</p>
                </div>
            `;
        } else if (lessons.length === 0) {
            lessonsHtml = `<p class="text-sm text-gray-400 p-4">Belum ada modul.</p>`;
        } else {
            lessonsHtml = `<div class="divide-y divide-gray-50">` + lessons.map((l, index) => {
                const isCompleted = progress.completedLessons.includes(l.id);
                return `
                    <a href="student-lesson.html?id=${l.id}" class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer">
                        <div class="flex items-center gap-4">
                            <div class="w-8 h-8 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center font-bold text-xs shrink-0">
                                ${index + 1}
                            </div>
                            <span class="text-sm font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">${l.title}</span>
                        </div>
                        ${isCompleted ? `<span class="material-symbols-outlined text-emerald-500 text-[20px]" data-icon="check_circle">check_circle</span>` : `<span class="material-symbols-outlined text-gray-300 text-[20px]" data-icon="play_circle">play_circle</span>`}
                    </a>
                `;
            }).join('') + `</div>`;
        }

        // Quiz HTML
        let quizHtml = '';
        if (isUnlocked && quiz && quiz.questions.length > 0) {
            const score = progress.quizScores[course.id];
            quizHtml = `
                <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-blue-500" data-icon="quiz">quiz</span>
                        <div>
                            <p class="text-sm font-bold text-gray-800">Quiz: ${course.title}</p>
                            ${score !== undefined ? `<p class="text-xs text-emerald-600 font-semibold">Skor: ${score}/100</p>` : `<p class="text-xs text-gray-500">Belum dikerjakan</p>`}
                        </div>
                    </div>
                    <a href="student-quiz.html?courseId=${course.id}" class="px-4 py-2 bg-white border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-gray-700 text-xs font-bold rounded-lg transition-colors">
                        ${score !== undefined ? 'Ulangi Quiz' : 'Mulai Quiz'}
                    </a>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4 justify-between bg-${color}-50/30">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-${color}-100 text-${color}-700 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-3xl" data-icon="${isUnlocked ? course.icon : 'lock'}">${isUnlocked ? course.icon : 'lock'}</span>
                    </div>
                    <div>
                        <span class="bg-${color}-100 text-${color}-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">LEVEL ${course.level}</span>
                        <h3 class="text-xl font-bold text-gray-900 mt-1">${course.title}</h3>
                        <p class="text-sm text-gray-600 mt-1">${course.description}</p>
                    </div>
                </div>
                <div class="flex flex-col items-end shrink-0">
                    <span class="text-xs font-bold text-gray-500 mb-1">${isUnlocked ? cPercent : 0}% Selesai</span>
                    <div class="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div class="bg-${cPercent === 100 && isUnlocked ? 'emerald' : 'amber'}-500 h-full rounded-full" style="width: ${isUnlocked ? cPercent : 0}%"></div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col">
                ${lessonsHtml}
                ${quizHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

function initStudentLesson() {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('id');
    
    if (!lessonId) {
        window.location.href = 'student-courses.html';
        return;
    }

    const lesson = window.DB.getLesson(lessonId);
    if (!lesson) {
        window.location.href = 'student-courses.html';
        return;
    }

    const course = window.DB.getCourse(lesson.courseId);
    
    // Route Guard: Is Course Unlocked?
    const user = window.AuthService.getCurrentUser();
    const progress = window.DB.getStudentProgress(user.username);
    if (!window.UI.isCourseUnlocked(course, progress, window.DB.read())) {
        window.location.href = 'student-courses.html';
        return;
    }
    
    document.getElementById('lesson-course-title').innerText = course.title;
    document.getElementById('lesson-title').innerText = lesson.title;
    document.getElementById('lesson-content-body').innerHTML = lesson.content;

    // Build navigation
    const allLessons = window.DB.getLessonsByCourse(lesson.courseId);
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const completeBtn = document.getElementById('btn-complete');

    if (currentIndex > 0) {
        prevBtn.href = `student-lesson.html?id=${allLessons[currentIndex - 1].id}`;
        prevBtn.classList.remove('hidden');
    }

    // Complete button logic
    const isCompleted = progress.completedLessons.includes(lessonId);

    if (isCompleted) {
        completeBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]" data-icon="check_circle">check_circle</span> Sudah Selesai`;
        completeBtn.className = "px-6 py-3 bg-gray-100 text-emerald-700 font-bold text-sm rounded-xl flex items-center gap-2 cursor-default";
    }

    completeBtn.addEventListener('click', (e) => {
        if (!isCompleted) {
            e.preventDefault();
            window.UI.setLoading(completeBtn, true);
            setTimeout(() => {
                window.DB.markLessonComplete(user.username, lessonId);
                window.UI.showToast('Lesson diselesaikan!');
                window.UI.setLoading(completeBtn, false);
                // Change UI
                completeBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]" data-icon="check_circle">check_circle</span> Sudah Selesai`;
                completeBtn.className = "px-6 py-3 bg-gray-100 text-emerald-700 font-bold text-sm rounded-xl flex items-center gap-2 cursor-default";
            }, 500);
        }
    });

    if (currentIndex < allLessons.length - 1) {
        nextBtn.href = `student-lesson.html?id=${allLessons[currentIndex + 1].id}`;
        nextBtn.innerHTML = `Lanjut <span class="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>`;
        nextBtn.classList.remove('hidden');
    } else {
        // Last lesson, point to Quiz if exists
        const quiz = window.DB.getQuizByCourse(lesson.courseId);
        if (quiz && quiz.questions.length > 0) {
            nextBtn.href = `student-quiz.html?courseId=${lesson.courseId}`;
            nextBtn.innerHTML = `Lanjut Quiz <span class="material-symbols-outlined text-[18px]" data-icon="quiz">quiz</span>`;
            nextBtn.classList.remove('hidden');
            nextBtn.classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white');
            nextBtn.classList.remove('bg-emerald-50', 'text-emerald-700');
        } else {
            nextBtn.href = `student-courses.html#course-${lesson.courseId}`;
            nextBtn.innerHTML = `Selesai <span class="material-symbols-outlined text-[18px]" data-icon="done_all">done_all</span>`;
            nextBtn.classList.remove('hidden');
        }
    }
}

function initStudentQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    
    if (!courseId) {
        window.location.href = 'student-courses.html';
        return;
    }

    const course = window.DB.getCourse(courseId);
    const quiz = window.DB.getQuizByCourse(courseId);

    if (!course || !quiz || quiz.questions.length === 0) {
        window.location.href = 'student-courses.html';
        return;
    }

    // Route Guard: Is Course Unlocked?
    const user = window.AuthService.getCurrentUser();
    const progress = window.DB.getStudentProgress(user.username);
    if (!window.UI.isCourseUnlocked(course, progress, window.DB.read())) {
        window.location.href = 'student-courses.html';
        return;
    }

    document.getElementById('quiz-course-title').innerText = `Quiz: ${course.title}`;
    
    const container = document.getElementById('quiz-questions-container');
    container.innerHTML = '';

    quiz.questions.forEach((q, index) => {
        const block = document.createElement('div');
        block.className = 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4';
        
        let optionsHtml = '';
        q.options.forEach((opt, optIndex) => {
            optionsHtml += `
                <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-emerald-50 cursor-pointer transition-colors has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-500">
                    <input type="radio" name="q_${index}" value="${optIndex}" class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300">
                    <span class="text-sm text-gray-700">${opt}</span>
                </label>
            `;
        });

        block.innerHTML = `
            <h4 class="text-sm font-bold text-gray-900">${index + 1}. ${q.q}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${optionsHtml}
            </div>
        `;
        container.appendChild(block);
    });

    document.getElementById('quiz-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-submit-quiz');
        window.UI.setLoading(btn, true);

        setTimeout(() => {
            let correctCount = 0;
            quiz.questions.forEach((q, index) => {
                const selected = document.querySelector(`input[name="q_${index}"]:checked`);
                if (selected && parseInt(selected.value) === q.correct) {
                    correctCount++;
                }
            });

            const score = Math.round((correctCount / quiz.questions.length) * 100);
            
            const user = window.AuthService.getCurrentUser();
            window.DB.saveQuizScore(user.username, courseId, score);

            document.getElementById('quiz-form').classList.add('hidden');
            const resultDiv = document.getElementById('quiz-result');
            resultDiv.classList.remove('hidden');
            resultDiv.classList.add('animate-fade-in');

            document.getElementById('result-score').innerText = score;
            
            const msg = document.getElementById('result-message');
            if (score >= 80) {
                msg.innerText = "Luar biasa! Anda menguasai materi ini.";
                msg.className = "text-emerald-600 font-bold mt-2";
            } else {
                msg.innerText = "Terus berlatih untuk hasil yang lebih baik.";
                msg.className = "text-amber-600 font-bold mt-2";
            }

            document.getElementById('btn-back-course').href = `student-courses.html#course-${courseId}`;
            
            window.UI.setLoading(btn, false);
            window.scrollTo(0, 0);
        }, 800);
    });
}

function initStudentCertificate() {
    const user = window.AuthService.getCurrentUser();
    const progress = window.DB.getStudentProgress(user.username);
    const data = window.DB.read();

    const isAllCompleted = window.UI.checkAllCompleted(progress, data);

    const lockedView = document.getElementById('cert-locked');
    const unlockedView = document.getElementById('cert-unlocked');

    if (!isAllCompleted) {
        lockedView.classList.remove('hidden');
        unlockedView.classList.add('hidden');
        return;
    }

    // Unlocked!
    lockedView.classList.add('hidden');
    unlockedView.classList.remove('hidden');
    unlockedView.classList.add('flex');

    document.getElementById('cert-student-name').innerText = user.name;
    
    // Format Date
    let compDate = progress.completedDate ? new Date(progress.completedDate) : new Date();
    const dateStr = compDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('cert-date').innerText = dateStr;

    // Download Button Logic
    document.getElementById('btn-download-cert').addEventListener('click', () => {
        window.print();
    });
}
