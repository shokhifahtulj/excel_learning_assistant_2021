// js/utils.js

const UI = {
    toastTimeout: null,

    showToast(message, type = 'success') {
        let toast = document.getElementById('app-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'app-toast';
            toast.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 opacity-0 translate-y-[-20px] flex items-center gap-3 text-sm font-semibold text-white';
            document.body.appendChild(toast);
        }

        // Configure colors
        if (type === 'success') {
            toast.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 opacity-0 translate-y-[-20px] flex items-center gap-3 text-sm font-semibold bg-emerald-600 text-white';
            toast.innerHTML = `<span class="material-symbols-outlined" data-icon="check_circle">check_circle</span> ${message}`;
        } else if (type === 'error') {
            toast.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 opacity-0 translate-y-[-20px] flex items-center gap-3 text-sm font-semibold bg-red-600 text-white';
            toast.innerHTML = `<span class="material-symbols-outlined" data-icon="error">error</span> ${message}`;
        } else {
            toast.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 opacity-0 translate-y-[-20px] flex items-center gap-3 text-sm font-semibold bg-blue-600 text-white';
            toast.innerHTML = `<span class="material-symbols-outlined" data-icon="info">info</span> ${message}`;
        }

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-y-[-20px]');
        });

        // Clear existing timeout
        if (this.toastTimeout) clearTimeout(this.toastTimeout);

        // Hide after 3s
        this.toastTimeout = setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-[-20px]');
        }, 3000);
    },

    setLoading(buttonElement, isLoading, originalText = '') {
        if (isLoading) {
            buttonElement.dataset.originalText = buttonElement.innerHTML;
            buttonElement.innerHTML = `<span class="material-symbols-outlined animate-spin" data-icon="refresh">refresh</span> Menyimpan...`;
            buttonElement.disabled = true;
            buttonElement.classList.add('opacity-80', 'cursor-not-allowed');
        } else {
            buttonElement.innerHTML = originalText || buttonElement.dataset.originalText;
            buttonElement.disabled = false;
            buttonElement.classList.remove('opacity-80', 'cursor-not-allowed');
        }
    },
    
    // Modal Helpers
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            // small delay to allow display:block to apply before animating opacity
            setTimeout(() => {
                modal.firstElementChild.classList.remove('opacity-0', 'scale-95');
                modal.firstElementChild.classList.add('opacity-100', 'scale-100');
            }, 10);
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.firstElementChild.classList.remove('opacity-100', 'scale-100');
            modal.firstElementChild.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 200);
        }
    },
    
    confirmDialog(message, onConfirm) {
        if (window.confirm(message)) {
            onConfirm();
        }
    },

    // --- Progression Helpers ---
    checkCourseCompleted(courseId, progress, data) {
        const courseLessons = data.lessons.filter(l => l.courseId === courseId);
        const quiz = data.quizzes.find(q => q.courseId === courseId);
        
        // Cek materi
        const allLessonsDone = courseLessons.every(l => progress.completedLessons.includes(l.id));
        if (!allLessonsDone) return false;

        // Cek quiz jika ada
        if (quiz && quiz.questions.length > 0) {
            if (progress.quizScores[courseId] === undefined) return false;
        }

        return true;
    },

    isCourseUnlocked(course, progress, data) {
        if (course.level === 1) return true; // Level 1 selalu terbuka

        // Dapatkan semua course di level sebelumnya
        const prevLevelCourses = data.courses.filter(c => c.level === course.level - 1);
        if (prevLevelCourses.length === 0) return true; // Failsafe jika level sebelumnya kosong

        // Harus menyelesaikan SEMUA course di level sebelumnya
        return prevLevelCourses.every(c => this.checkCourseCompleted(c.id, progress, data));
    },

    checkAllCompleted(progress, data) {
        // Harus menyelesaikan SEMUA course
        return data.courses.every(c => this.checkCourseCompleted(c.id, progress, data));
    }
};

window.UI = UI;
