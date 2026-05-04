// js/components.js

class AppHeader extends HTMLElement {
    connectedCallback() {
        const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
        if (!user) { this.innerHTML = ''; return; }
        
        const roleLabel = user.role.toUpperCase();
        const name = user.name;
        
        this.innerHTML = `
            <header class="flex justify-between items-center px-4 h-16 w-full bg-white border-b border-gray-200 shadow-sm fixed top-0 z-50">
                <div class="flex items-center gap-3">
                    <button id="mobile-menu-toggle" class="lg:hidden text-emerald-700 hover:text-emerald-900 transition-colors p-1 rounded-md active:bg-emerald-50">
                        <span class="material-symbols-outlined text-[28px]" data-icon="menu">menu</span>
                    </button>
                    <div class="hidden lg:flex w-8 h-8 bg-primary-container rounded flex items-center justify-center">
                        <span class="material-symbols-outlined text-on-primary-container text-lg" data-icon="table_chart">table_chart</span>
                    </div>
                    <h1 class="font-sans font-bold text-lg text-emerald-800 tracking-tight">Excel Master</h1>
                </div>
                <div class="flex items-center gap-3">
                    <div class="hidden sm:flex flex-col items-end mr-1">
                        <span class="text-sm font-bold text-emerald-900 leading-tight">${name}</span>
                        <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-widest mt-0.5 border border-emerald-200">${roleLabel}</span>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm border-2 border-emerald-100 cursor-pointer">
                        <span class="text-sm font-bold">${name.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
            </header>
        `;

        // Mobile menu toggle logic
        setTimeout(() => {
            const toggleBtn = this.querySelector('#mobile-menu-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    const sidebar = document.querySelector('app-sidebar aside');
                    if (sidebar) {
                        sidebar.classList.toggle('-translate-x-full');
                    }
                });
            }
        }, 100);
    }
}

class AppSidebar extends HTMLElement {
    connectedCallback() {
        const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
        if (!user) { this.innerHTML = ''; return; }

        const role = user.role;
        const name = user.name;
        const basePath = window.AuthService ? window.AuthService.getBasePath() : './';
        const currentPath = window.location.pathname;

        const isLinkActive = (path) => currentPath.includes(path) ? 'active' : '';

        let menuItems = '';

        if (role === 'admin') {
            menuItems = `
                <a class="sidebar-link flex items-center gap-3 text-gray-600 px-4 py-3 rounded-r-full transition-all duration-200 ease-in-out mr-4 ${isLinkActive('admin-dashboard')}" href="${basePath}pages/admin-dashboard.html">
                    <span class="material-symbols-outlined text-[22px]" data-icon="dashboard">dashboard</span>
                    <span class="font-sans text-sm font-medium">Dashboard Admin</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 text-gray-600 px-4 py-3 rounded-r-full transition-all duration-200 ease-in-out mr-4 ${isLinkActive('admin-materi')}" href="${basePath}pages/admin-materi.html">
                    <span class="material-symbols-outlined text-[22px]" data-icon="menu_book">menu_book</span>
                    <span class="font-sans text-sm font-medium">Kelola Materi</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 text-gray-600 px-4 py-3 rounded-r-full transition-all duration-200 ease-in-out mr-4 ${isLinkActive('admin-soal')}" href="${basePath}pages/admin-soal.html">
                    <span class="material-symbols-outlined text-[22px]" data-icon="quiz">quiz</span>
                    <span class="font-sans text-sm font-medium">Kelola Soal</span>
                </a>
            `;
        } else {
            menuItems = `
                <a class="sidebar-link flex items-center gap-3 text-gray-600 px-4 py-3 rounded-r-full transition-all duration-200 ease-in-out mr-4 ${isLinkActive('student-dashboard')}" href="${basePath}pages/student-dashboard.html">
                    <span class="material-symbols-outlined text-[22px]" data-icon="dashboard">dashboard</span>
                    <span class="font-sans text-sm font-medium">Dashboard Siswa</span>
                </a>
                <a class="sidebar-link flex items-center gap-3 text-gray-600 px-4 py-3 rounded-r-full transition-all duration-200 ease-in-out mr-4 ${isLinkActive('student-certificate')}" href="${basePath}pages/student-certificate.html">
                    <span class="material-symbols-outlined text-[22px]" data-icon="workspace_premium">workspace_premium</span>
                    <span class="font-sans text-sm font-medium">Sertifikat</span>
                </a>
            `;
        }

        this.innerHTML = `
            <div class="fixed inset-0 bg-black/50 z-30 lg:hidden hidden" id="sidebar-overlay"></div>
            <aside class="flex flex-col fixed left-0 top-0 h-full z-40 w-[280px] border-r border-gray-200 bg-slate-50 pt-20 transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0">
                <div class="px-6 mb-8 flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-lg">
                        <span class="material-symbols-outlined" data-icon="shield_person">shield_person</span>
                    </div>
                    <div>
                        <p class="font-sans text-sm font-bold text-emerald-900">${name}</p>
                        <p class="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">${role}</p>
                    </div>
                </div>
                
                <nav class="flex flex-col gap-1 pr-2 flex-grow">
                    ${menuItems}
                </nav>

                <div class="p-4 mb-4 mt-auto">
                    <button id="logout-btn-desktop" class="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-3 rounded-lg transition-colors font-medium text-sm">
                        <span class="material-symbols-outlined" data-icon="logout">logout</span>
                        Logout
                    </button>
                </div>
            </aside>
        `;

        // Overlay logic
        setTimeout(() => {
            const overlay = this.querySelector('#sidebar-overlay');
            const sidebar = this.querySelector('aside');
            const toggleBtn = document.querySelector('app-header #mobile-menu-toggle');
            
            if (toggleBtn && overlay && sidebar) {
                toggleBtn.addEventListener('click', () => {
                    overlay.classList.remove('hidden');
                });
                
                overlay.addEventListener('click', () => {
                    sidebar.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                });
            }

            const logoutBtn = this.querySelector('#logout-btn-desktop');
            if (logoutBtn && window.AuthService) {
                logoutBtn.addEventListener('click', () => {
                    window.AuthService.logout();
                });
            }
        }, 100);
    }
}

class AppBottomNav extends HTMLElement {
    connectedCallback() {
        const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
        if (!user) { this.innerHTML = ''; return; }
        
        const role = user.role;
        const basePath = window.AuthService ? window.AuthService.getBasePath() : './';
        const currentPath = window.location.pathname;

        const isLinkActive = (path) => currentPath.includes(path) ? 'active' : '';

        let menuItems = '';

        if (role === 'admin') {
            menuItems = `
                <a class="bottom-nav-link flex flex-col items-center justify-center text-gray-500 hover:text-emerald-700 w-full py-2 rounded-xl transition-colors ${isLinkActive('admin-dashboard')}" href="${basePath}pages/admin-dashboard.html">
                    <span class="material-symbols-outlined text-[24px]" data-icon="dashboard">dashboard</span>
                    <span class="text-[10px] font-medium mt-1">Dashboard</span>
                </a>
                <a class="bottom-nav-link flex flex-col items-center justify-center text-gray-500 hover:text-emerald-700 w-full py-2 rounded-xl transition-colors ${isLinkActive('admin-materi')}" href="${basePath}pages/admin-materi.html">
                    <span class="material-symbols-outlined text-[24px]" data-icon="menu_book">menu_book</span>
                    <span class="text-[10px] font-medium mt-1">Materi</span>
                </a>
                <a class="bottom-nav-link flex flex-col items-center justify-center text-gray-500 hover:text-emerald-700 w-full py-2 rounded-xl transition-colors ${isLinkActive('admin-soal')}" href="${basePath}pages/admin-soal.html">
                    <span class="material-symbols-outlined text-[24px]" data-icon="quiz">quiz</span>
                    <span class="text-[10px] font-medium mt-1">Soal</span>
                </a>
            `;
        } else {
            menuItems = `
                <a class="bottom-nav-link flex flex-col items-center justify-center text-gray-500 hover:text-emerald-700 w-full py-2 rounded-xl transition-colors ${isLinkActive('student-dashboard')}" href="${basePath}pages/student-dashboard.html">
                    <span class="material-symbols-outlined text-[24px]" data-icon="dashboard">dashboard</span>
                    <span class="text-[10px] font-medium mt-1">Dashboard</span>
                </a>
                <a class="bottom-nav-link flex flex-col items-center justify-center text-gray-500 hover:text-emerald-700 w-full py-2 rounded-xl transition-colors ${isLinkActive('student-certificate')}" href="${basePath}pages/student-certificate.html">
                    <span class="material-symbols-outlined text-[24px]" data-icon="workspace_premium">workspace_premium</span>
                    <span class="text-[10px] font-medium mt-1">Sertifikat</span>
                </a>
            `;
        }

        this.innerHTML = `
            <nav class="lg:hidden fixed bottom-0 left-0 w-full flex justify-between items-center h-[64px] bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-50 px-2 pb-safe">
                ${menuItems}
                <button id="logout-btn-mobile" class="flex flex-col items-center justify-center text-red-500 hover:text-red-700 w-full py-2 rounded-xl transition-colors">
                    <span class="material-symbols-outlined text-[24px]" data-icon="logout">logout</span>
                    <span class="text-[10px] font-medium mt-1">Logout</span>
                </button>
            </nav>
            <style>
                @supports (padding-bottom: env(safe-area-inset-bottom)) {
                    .pb-safe {
                        padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
                        height: calc(64px + env(safe-area-inset-bottom));
                    }
                }
            </style>
        `;

        setTimeout(() => {
            const logoutBtn = this.querySelector('#logout-btn-mobile');
            if (logoutBtn && window.AuthService) {
                logoutBtn.addEventListener('click', () => {
                    window.AuthService.logout();
                });
            }
        }, 100);
    }
}

// Register Web Components
customElements.define('app-header', AppHeader);
customElements.define('app-sidebar', AppSidebar);
customElements.define('app-bottom-nav', AppBottomNav);

class AppChatbot extends HTMLElement {
    connectedCallback() {
        const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
        if (!user || user.role !== 'siswa') {
            this.innerHTML = '';
            return;
        }

        this.innerHTML = `
            <div id="chatbot-container" class="fixed bottom-[80px] lg:bottom-6 right-4 lg:right-8 z-50 flex flex-col items-end">
                <!-- Chat Window (Hidden by default) -->
                <div id="chatbot-window" class="hidden w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden mb-4 transition-all duration-300 origin-bottom-right scale-95 opacity-0">
                    <!-- Header -->
                    <div class="bg-emerald-700 text-white p-4 flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center border border-emerald-500">
                                <span class="material-symbols-outlined text-[18px]" data-icon="smart_toy">smart_toy</span>
                            </div>
                            <div>
                                <h4 class="text-sm font-bold leading-tight">Asisten Excel</h4>
                                <p class="text-[10px] text-emerald-200">Online - Siap Membantu</p>
                            </div>
                        </div>
                        <button id="chatbot-close-btn" class="text-emerald-200 hover:text-white transition-colors">
                            <span class="material-symbols-outlined" data-icon="close">close</span>
                        </button>
                    </div>
                    
                    <!-- Chat Body -->
                    <div id="chatbot-body" class="p-4 h-[300px] overflow-y-auto bg-slate-50 flex flex-col gap-3 text-sm">
                        <div class="flex gap-2 w-[90%]">
                            <div class="w-6 h-6 rounded-full bg-emerald-600 shrink-0 flex items-center justify-center text-white mt-1">
                                <span class="material-symbols-outlined text-[14px]" data-icon="smart_toy">smart_toy</span>
                            </div>
                            <div class="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-gray-700">
                                Halo! Saya asisten offline Anda. Ada yang bisa saya bantu tentang materi Excel?
                            </div>
                        </div>
                    </div>
                    
                    <!-- Suggestions -->
                    <div class="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                        <button class="chatbot-suggestion px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold whitespace-nowrap hover:bg-emerald-100 border border-emerald-100 transition-colors">Apa itu VLOOKUP?</button>
                        <button class="chatbot-suggestion px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold whitespace-nowrap hover:bg-emerald-100 border border-emerald-100 transition-colors">Fungsi SUM</button>
                        <button class="chatbot-suggestion px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold whitespace-nowrap hover:bg-emerald-100 border border-emerald-100 transition-colors">Cara pakai IF</button>
                    </div>

                    <!-- Input Area -->
                    <form id="chatbot-form" class="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                        <input type="text" id="chatbot-input" placeholder="Tanya tentang Excel..." class="flex-grow bg-slate-50 border border-gray-200 text-sm rounded-full px-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <button type="submit" class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 hover:bg-emerald-700 transition-colors">
                            <span class="material-symbols-outlined text-[18px]" data-icon="send">send</span>
                        </button>
                    </form>
                </div>

                <!-- Floating Button -->
                <button id="chatbot-fab" class="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-white">
                    <span class="material-symbols-outlined text-[28px]" data-icon="chat_bubble">chat_bubble</span>
                </button>
            </div>
            <style>
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            </style>
        `;

        setTimeout(() => {
            this.initChatbotLogic();
        }, 100);
    }

    initChatbotLogic() {
        const fab = this.querySelector('#chatbot-fab');
        const windowEl = this.querySelector('#chatbot-window');
        const closeBtn = this.querySelector('#chatbot-close-btn');
        const form = this.querySelector('#chatbot-form');
        const input = this.querySelector('#chatbot-input');
        const body = this.querySelector('#chatbot-body');
        const suggestions = this.querySelectorAll('.chatbot-suggestion');

        const toggleChat = () => {
            const isHidden = windowEl.classList.contains('hidden');
            if (isHidden) {
                windowEl.classList.remove('hidden');
                // trigger reflow
                void windowEl.offsetWidth;
                windowEl.classList.remove('scale-95', 'opacity-0');
                windowEl.classList.add('scale-100', 'opacity-100');
                input.focus();
            } else {
                windowEl.classList.remove('scale-100', 'opacity-100');
                windowEl.classList.add('scale-95', 'opacity-0');
                setTimeout(() => windowEl.classList.add('hidden'), 300);
            }
        };

        fab.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);

        // Expose open method globally so other buttons can trigger it
        window.openChatbot = () => {
            if (windowEl.classList.contains('hidden')) {
                toggleChat();
            }
        };

        const addMessage = (text, isUser) => {
            const div = document.createElement('div');
            div.className = `flex gap-2 w-[90%] ${isUser ? 'self-end flex-row-reverse' : ''}`;
            
            const iconHtml = isUser ? '' : `
                <div class="w-6 h-6 rounded-full bg-emerald-600 shrink-0 flex items-center justify-center text-white mt-1">
                    <span class="material-symbols-outlined text-[14px]" data-icon="smart_toy">smart_toy</span>
                </div>
            `;

            const bubbleClass = isUser 
                ? 'bg-emerald-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm'
                : 'bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-gray-700';

            div.innerHTML = `
                ${iconHtml}
                <div class="${bubbleClass}">${text}</div>
            `;
            
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        };

        const handleQuery = (query) => {
            if (!query.trim()) return;
            addMessage(query, true);
            input.value = '';

            // Simulate typing delay for natural feel
            setTimeout(() => {
                const response = window.getChatbotResponse ? window.getChatbotResponse(query) : 'Maaf, sistem chatbot belum dimuat dengan benar.';
                addMessage(response, false);
            }, 600);
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleQuery(input.value);
        });

        suggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                handleQuery(btn.innerText);
            });
        });
    }
}

customElements.define('app-chatbot', AppChatbot);
