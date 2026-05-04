// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Only run if admin
    if (window.AuthService && window.AuthService.getRole() !== 'admin') return;

    const path = window.location.pathname;

    if (path.includes('admin-dashboard.html')) {
        initAdminDashboard();
    } else if (path.includes('admin-materi.html')) {
        initAdminMateri();
    } else if (path.includes('admin-soal.html')) {
        initAdminSoal();
    }
});

function initAdminDashboard() {
    const data = window.DB.read();
    
    // Update Stats
    document.getElementById('stat-materi').innerText = data.lessons.length;
    document.getElementById('stat-soal').innerText = data.quizzes.reduce((acc, q) => acc + q.questions.length, 0);
    document.getElementById('stat-siswa').innerText = window.DB.getAllStudents().length;

    // Render Recent Students
    const students = window.DB.getAllStudents();
    const tbody = document.getElementById('table-siswa-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="px-6 py-8 text-center text-gray-500 text-sm">Belum ada siswa terdaftar</td></tr>`;
        return;
    }

    students.forEach(student => {
        const progress = student.progress || { completedLessons: [], quizScores: {} };
        const totalLessons = data.lessons.length;
        const percent = totalLessons === 0 ? 0 : Math.round((progress.completedLessons.length / totalLessons) * 100);
        
        let latestScore = '-';
        const badgeCount = progress.completedLessons.length >= 5 ? 2 : (progress.completedLessons.length >= 1 ? 1 : 0);
        const username = student.username;

        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-50 hover:bg-emerald-50/30 transition-colors group';
        tr.innerHTML = `
            <td class="py-4 px-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        ${student.name.charAt(0).toUpperCase()}
                    </div>
                    <span class="text-sm font-semibold text-gray-900">${student.name}</span>
                </div>
            </td>
            <td class="py-4 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                    <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden w-24">
                        <div class="bg-emerald-500 h-full rounded-full" style="width: ${percent}%"></div>
                    </div>
                    <span class="text-xs font-bold text-gray-600">${percent}%</span>
                </div>
            </td>
            <td class="py-4 px-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span class="material-symbols-outlined text-[12px]" data-icon="workspace_premium">workspace_premium</span>
                    ${badgeCount}
                </span>
            </td>
            <td class="py-4 px-4 whitespace-nowrap text-right">
                <button onclick="window.resetProgress('${username}')" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group-hover:opacity-100 opacity-50" title="Reset Progress">
                    <span class="material-symbols-outlined text-[18px]" data-icon="restart_alt">restart_alt</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    window.resetProgress = function(username) {
        if (confirm(`Apakah Anda yakin ingin mereset progress siswa ini (${username})? Semua riwayat belajar akan terhapus.`)) {
            window.DB.resetStudentProgress(username);
            window.UI.showToast('Progress siswa berhasil direset');
            initAdminDashboard();
        }
    };
}

function initAdminMateri() {
    renderCourseList();

    // Event Listeners for Modals
    document.getElementById('btn-add-course').addEventListener('click', () => {
        document.getElementById('course-form').reset();
        document.getElementById('course-id').value = '';
        document.getElementById('modal-title').innerText = 'Tambah Course Baru';
        window.UI.openModal('modal-course');
    });

    document.getElementById('course-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-course');
        window.UI.setLoading(btn, true);

        setTimeout(() => {
            const id = document.getElementById('course-id').value;
            const course = {
                title: document.getElementById('course-title').value,
                level: parseInt(document.getElementById('course-level').value),
                description: document.getElementById('course-desc').value,
                icon: document.getElementById('course-icon').value
            };

            if (id) {
                window.DB.updateCourse(id, course);
                window.UI.showToast('Course berhasil diperbarui');
            } else {
                window.DB.addCourse(course);
                window.UI.showToast('Course berhasil ditambahkan');
            }

            window.UI.closeModal('modal-course');
            window.UI.setLoading(btn, false);
            renderCourseList();
        }, 500);
    });

    document.getElementById('lesson-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-lesson');
        window.UI.setLoading(btn, true);

        setTimeout(() => {
            const id = document.getElementById('lesson-id').value;
            const lesson = {
                courseId: document.getElementById('lesson-courseId').value,
                title: document.getElementById('lesson-title').value,
                content: document.getElementById('lesson-content').value
            };

            if (id) {
                window.DB.updateLesson(id, lesson);
                window.UI.showToast('Lesson berhasil diperbarui');
            } else {
                window.DB.addLesson(lesson);
                window.UI.showToast('Lesson berhasil ditambahkan');
            }

            window.UI.closeModal('modal-lesson');
            window.UI.setLoading(btn, false);
            renderCourseList();
        }, 500);
    });
}

function renderCourseList() {
    const container = document.getElementById('course-list-container');
    const courses = window.DB.getCourses();
    container.innerHTML = '';

    if (courses.length === 0) {
        container.innerHTML = `<div class="col-span-full p-8 text-center bg-white rounded-2xl border border-gray-100"><p class="text-gray-500">Belum ada materi/course.</p></div>`;
        return;
    }

    courses.sort((a, b) => a.level - b.level).forEach(course => {
        const lessons = window.DB.getLessonsByCourse(course.id);
        
        // Define color based on level
        const colors = ['gray', 'emerald', 'blue', 'indigo', 'orange', 'red'];
        const color = colors[course.level] || 'gray';

        const card = document.createElement('div');
        card.className = `bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden group hover:shadow-lg transition-all-custom flex flex-col`;
        
        card.innerHTML = `
            <div class="h-32 bg-${color}-50 flex items-center justify-center border-b border-${color}-100 relative">
                <span class="material-symbols-outlined text-[64px] text-${color}-200" data-icon="${course.icon}">${course.icon}</span>
                <div class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-${color}-700 tracking-wider">LEVEL ${course.level}</div>
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-bold text-gray-900 group-hover:text-${color}-700 transition-colors">${course.title}</h3>
                    <div class="flex gap-1">
                        <button onclick="editCourse('${course.id}')" class="text-gray-400 hover:text-emerald-600 transition-colors"><span class="material-symbols-outlined text-[18px]" data-icon="edit">edit</span></button>
                        <button onclick="deleteCourse('${course.id}')" class="text-gray-400 hover:text-red-600 transition-colors"><span class="material-symbols-outlined text-[18px]" data-icon="delete">delete</span></button>
                    </div>
                </div>
                <p class="text-sm text-gray-500 mb-4 line-clamp-2">${course.description}</p>
                
                <!-- Lesson List inside Course -->
                <div class="mt-2 mb-4 flex-grow flex flex-col gap-2">
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Lessons (${lessons.length})</h4>
                    <div class="flex flex-col gap-1 max-h-[150px] overflow-y-auto pr-2">
                        ${lessons.length === 0 ? '<p class="text-xs text-gray-400 italic">Belum ada lesson.</p>' : ''}
                        ${lessons.map(l => `
                            <div class="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                <span class="text-xs font-semibold text-gray-700 truncate mr-2">${l.title}</span>
                                <div class="flex gap-1 shrink-0">
                                    <button onclick="editLesson('${l.id}')" class="text-emerald-600 hover:bg-emerald-100 p-1 rounded transition-colors"><span class="material-symbols-outlined text-[14px]" data-icon="edit">edit</span></button>
                                    <button onclick="deleteLesson('${l.id}')" class="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"><span class="material-symbols-outlined text-[14px]" data-icon="delete">delete</span></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mt-auto pt-4 border-t border-gray-100">
                    <button onclick="addLesson('${course.id}')" class="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-colors border border-gray-200 flex justify-center items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]" data-icon="add">add</span> Tambah Lesson
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Global functions for inline onclick handlers
window.editCourse = (id) => {
    const course = window.DB.getCourse(id);
    if (!course) return;
    document.getElementById('course-id').value = course.id;
    document.getElementById('course-title').value = course.title;
    document.getElementById('course-level').value = course.level;
    document.getElementById('course-desc').value = course.description;
    document.getElementById('course-icon').value = course.icon;
    document.getElementById('modal-title').innerText = 'Edit Course';
    window.UI.openModal('modal-course');
};

window.deleteCourse = (id) => {
    window.UI.confirmDialog('Apakah Anda yakin ingin menghapus Course ini? Semua Lesson dan Quiz di dalamnya akan ikut terhapus.', () => {
        window.DB.deleteCourse(id);
        window.UI.showToast('Course berhasil dihapus');
        renderCourseList();
    });
};

window.addLesson = (courseId) => {
    document.getElementById('lesson-form').reset();
    document.getElementById('lesson-id').value = '';
    document.getElementById('lesson-courseId').value = courseId;
    document.getElementById('modal-lesson-title').innerText = 'Tambah Lesson Baru';
    window.UI.openModal('modal-lesson');
};

window.editLesson = (id) => {
    const lesson = window.DB.getLesson(id);
    if (!lesson) return;
    document.getElementById('lesson-id').value = lesson.id;
    document.getElementById('lesson-courseId').value = lesson.courseId;
    document.getElementById('lesson-title').value = lesson.title;
    document.getElementById('lesson-content').value = lesson.content;
    document.getElementById('modal-lesson-title').innerText = 'Edit Lesson';
    window.UI.openModal('modal-lesson');
};

window.deleteLesson = (id) => {
    window.UI.confirmDialog('Hapus Lesson ini?', () => {
        window.DB.deleteLesson(id);
        window.UI.showToast('Lesson dihapus');
        renderCourseList();
    });
};

// --- QUIZ LOGIC ---

function initAdminSoal() {
    renderQuizList();

    document.getElementById('quiz-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-quiz');
        window.UI.setLoading(btn, true);

        setTimeout(() => {
            const courseId = document.getElementById('quiz-courseId').value;
            
            // Gather questions from dynamic form
            const questions = [];
            const qBlocks = document.querySelectorAll('.question-block');
            qBlocks.forEach(block => {
                const qText = block.querySelector('.q-text').value;
                if (!qText) return;
                const opts = [];
                for (let i = 0; i < 4; i++) {
                    opts.push(block.querySelector(`.opt-${i}`).value);
                }
                const correctStr = block.querySelector('.q-correct').value;
                questions.push({
                    q: qText,
                    options: opts,
                    correct: parseInt(correctStr)
                });
            });

            if (questions.length > 0) {
                window.DB.saveQuiz(courseId, questions);
                window.UI.showToast('Quiz berhasil disimpan');
            } else {
                window.UI.showToast('Minimal harus ada 1 pertanyaan', 'error');
            }

            window.UI.closeModal('modal-quiz');
            window.UI.setLoading(btn, false);
            renderQuizList();
        }, 500);
    });
}

function renderQuizList() {
    const container = document.getElementById('quiz-list-container');
    const courses = window.DB.getCourses();
    container.innerHTML = '';

    if (courses.length === 0) {
        container.innerHTML = `<div class="p-8 text-center bg-white rounded-2xl border border-gray-100"><p class="text-gray-500">Belum ada course terdaftar.</p></div>`;
        return;
    }

    courses.sort((a, b) => a.level - b.level).forEach(course => {
        const quiz = window.DB.getQuizByCourse(course.id);
        const qCount = quiz ? quiz.questions.length : 0;
        
        const card = document.createElement('div');
        card.className = 'p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors group border-b border-gray-50';
        
        card.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl ${qCount > 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'} flex items-center justify-center shadow-sm border">
                    <span class="material-symbols-outlined" data-icon="${qCount > 0 ? 'quiz' : 'assignment_late'}">${qCount > 0 ? 'quiz' : 'assignment_late'}</span>
                </div>
                <div>
                    <h4 class="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Quiz: ${course.title}</h4>
                    <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]" data-icon="format_list_numbered">format_list_numbered</span> ${qCount} Pertanyaan</span>
                        <span>•</span>
                        ${qCount > 0 
                            ? `<span class="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">Aktif</span>`
                            : `<span class="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">Belum Dibuat</span>`
                        }
                    </div>
                </div>
            </div>
            <div class="flex gap-2 w-full sm:w-auto justify-end">
                <button onclick="editQuiz('${course.id}')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl ${qCount > 0 ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-primary text-white hover:bg-emerald-800'} font-bold text-xs transition-colors shadow-sm">
                    ${qCount > 0 ? 'Edit Quiz' : 'Buat Quiz'}
                </button>
                ${qCount > 0 ? `<button onclick="deleteQuiz('${course.id}')" class="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors">Hapus</button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

window.editQuiz = (courseId) => {
    const course = window.DB.getCourse(courseId);
    document.getElementById('quiz-courseId').value = courseId;
    document.getElementById('modal-quiz-title').innerText = `Kelola Quiz: ${course.title}`;
    
    const quiz = window.DB.getQuizByCourse(courseId);
    const qContainer = document.getElementById('questions-container');
    qContainer.innerHTML = '';
    
    if (quiz && quiz.questions.length > 0) {
        quiz.questions.forEach((q, idx) => addQuestionBlock(qContainer, q, idx));
    } else {
        addQuestionBlock(qContainer, null, 0); // start with one empty
    }
    
    window.UI.openModal('modal-quiz');
};

window.deleteQuiz = (courseId) => {
    window.UI.confirmDialog('Hapus Quiz ini beserta seluruh pertanyaannya?', () => {
        window.DB.deleteQuiz(courseId);
        window.UI.showToast('Quiz berhasil dihapus');
        renderQuizList();
    });
};

window.addEmptyQuestion = () => {
    const qContainer = document.getElementById('questions-container');
    const idx = qContainer.children.length;
    addQuestionBlock(qContainer, null, idx);
};

function addQuestionBlock(container, data, index) {
    const block = document.createElement('div');
    block.className = 'question-block bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 flex flex-col gap-3 relative';
    
    const qValue = data ? data.q.replace(/"/g, '&quot;') : '';
    const opt0 = data ? data.options[0].replace(/"/g, '&quot;') : '';
    const opt1 = data ? data.options[1].replace(/"/g, '&quot;') : '';
    const opt2 = data ? data.options[2].replace(/"/g, '&quot;') : '';
    const opt3 = data ? data.options[3].replace(/"/g, '&quot;') : '';
    const correct = data ? data.correct : 0;

    block.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"><span class="material-symbols-outlined text-[16px]" data-icon="close">close</span></button>
        <h5 class="text-xs font-bold text-gray-500 uppercase tracking-widest">Pertanyaan ${index + 1}</h5>
        <input class="q-text w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Masukkan pertanyaan..." type="text" value="${qValue}" required>
        
        <div class="grid grid-cols-2 gap-2 mt-1">
            <input class="opt-0 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Opsi A" type="text" value="${opt0}" required>
            <input class="opt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Opsi B" type="text" value="${opt1}" required>
            <input class="opt-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Opsi C" type="text" value="${opt2}" required>
            <input class="opt-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Opsi D" type="text" value="${opt3}" required>
        </div>
        
        <div class="flex items-center gap-2 mt-1">
            <label class="text-xs font-bold text-gray-700">Jawaban Benar:</label>
            <select class="q-correct px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">
                <option value="0" ${correct === 0 ? 'selected' : ''}>Opsi A</option>
                <option value="1" ${correct === 1 ? 'selected' : ''}>Opsi B</option>
                <option value="2" ${correct === 2 ? 'selected' : ''}>Opsi C</option>
                <option value="3" ${correct === 3 ? 'selected' : ''}>Opsi D</option>
            </select>
        </div>
    `;
    container.appendChild(block);
}
