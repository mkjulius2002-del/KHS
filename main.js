// ========== MODERN JAVASCRIPT - Kongunga High School ==========

(function() {
    'use strict';

    // ========== UTILITIES ==========

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // ========== TOAST NOTIFICATION SYSTEM ==========

    const Toast = {
        container: null,

        init() {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        },

        show(message, type = 'info', duration = 4000) {
            this.init();
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };

            toast.innerHTML = `
                <span style="font-size: 18px; font-weight: bold;">${icons[type] || 'ℹ'}</span>
                <span>${message}</span>
            `;

            this.container.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('hiding');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },

        success(message) { this.show(message, 'success'); },
        error(message) { this.show(message, 'error'); },
        warning(message) { this.show(message, 'warning'); },
        info(message) { this.show(message, 'info'); }
    };

    window.showToast = Toast.show.bind(Toast);
    window.showSuccess = Toast.success.bind(Toast);
    window.showError = Toast.error.bind(Toast);
    window.showWarning = Toast.warning.bind(Toast);
    window.showInfo = Toast.info.bind(Toast);

    // ========== MOBILE MENU ==========

    const MobileMenu = {
        btn: null,
        menu: null,
        isOpen: false,

        init() {
            this.btn = $('#mobileMenuBtn');
            this.menu = $('#navMenu');

            if (!this.btn || !this.menu) return;

            this.btn.addEventListener('click', () => this.toggle());

            // Close on link click
            const links = this.menu.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.close();
                    }
                });
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.btn.contains(e.target) && !this.menu.contains(e.target)) {
                    this.close();
                }
            });

            // Handle dropdown toggles on mobile
            const dropdowns = this.menu.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                const link = dropdown.querySelector('a');
                if (link && window.innerWidth <= 768) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        dropdown.classList.toggle('open');
                        const submenu = dropdown.querySelector('.dropdown-menu');
                        if (submenu) {
                            submenu.classList.toggle('show');
                        }
                    });
                }
            });
        },

        toggle() {
            this.isOpen ? this.close() : this.open();
        },

        open() {
            this.menu.classList.add('show');
            this.btn.classList.add('active');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.menu.classList.remove('show');
            this.btn.classList.remove('active');
            this.isOpen = false;
            document.body.style.overflow = '';
        }
    };

    // ========== SCROLL PROGRESS INDICATOR ==========

    const ScrollProgress = {
        bar: null,

        init() {
            if ($('.scroll-progress')) return;

            this.bar = document.createElement('div');
            this.bar.className = 'scroll-progress';
            this.bar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #e67e22, #d35400);
                z-index: 9999;
                transition: width 0.1s ease;
                width: 0%;
            `;
            document.body.appendChild(this.bar);

            window.addEventListener('scroll', throttle(() => this.update(), 10));
        },

        update() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            this.bar.style.width = `${Math.min(progress, 100)}%`;
        }
    };

    // ========== BACK TO TOP BUTTON ==========

    const BackToTop = {
        btn: null,

        init() {
            if ($('.back-to-top')) return;

            this.btn = document.createElement('button');
            this.btn.className = 'back-to-top';
            this.btn.innerHTML = '↑';
            this.btn.setAttribute('aria-label', 'Back to top');
            this.btn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: #e67e22;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 24px;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 999;
                box-shadow: 0 4px 15px rgba(230, 126, 34, 0.4);
            `;

            this.btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            this.btn.addEventListener('mouseenter', () => {
                this.btn.style.transform = 'translateY(-5px)';
                this.btn.style.background = '#d35400';
            });

            this.btn.addEventListener('mouseleave', () => {
                this.btn.style.transform = 'translateY(0)';
                this.btn.style.background = '#e67e22';
            });

            document.body.appendChild(this.btn);

            window.addEventListener('scroll', throttle(() => {
                if (window.pageYOffset > 300) {
                    this.btn.style.opacity = '1';
                    this.btn.style.visibility = 'visible';
                } else {
                    this.btn.style.opacity = '0';
                    this.btn.style.visibility = 'hidden';
                }
            }, 100));
        }
    };

    // ========== ACTIVE NAVIGATION ==========

    const ActiveNav = {
        init() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = $$('nav ul li a');

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                    link.classList.add('active');
                }

                // Also highlight parent dropdown if child is active
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    const parentLink = parentDropdown.querySelector('a');
                    if (parentLink && href === currentPage) {
                        parentLink.classList.add('active');
                    }
                }
            });
        }
    };

    // ========== SCROLL ANIMATIONS ==========

    const ScrollAnimations = {
        observedElements: new Set(),

        init() {
            // Use Intersection Observer for better performance
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-in');
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });

                const elements = $$('.feature-card, .notice, .level-card, .subject-card, .highlight, .stat, .teacher-card, .member-card, .info-card, .program-card, .academic-card, .about-card, .process-card, .info-card-modern, .contact-card, .stat-about, .scholarship-card, .staff-card, .dashboard-link-card');
                elements.forEach(el => {
                    el.classList.add('animate-ready');
                    observer.observe(el);
                });
            } else {
                // Fallback for older browsers
                this.fallbackAnimation();
            }
        },

        fallbackAnimation() {
            const elements = $$('.feature-card, .notice, .level-card, .subject-card, .highlight, .stat, .teacher-card, .member-card, .info-card');
            
            elements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'all 0.6s ease-out';
            });

            window.addEventListener('scroll', throttle(() => {
                elements.forEach(element => {
                    const elementPosition = element.getBoundingClientRect().top;
                    const screenPosition = window.innerHeight;
                    
                    if (elementPosition < screenPosition - 100) {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }
                });
            }, 100));
        }
    };

    // ========== STATS COUNTER ANIMATION ==========

    const StatsCounter = {
        triggered: false,

        init() {
            window.addEventListener('scroll', throttle(() => this.check(), 100));
            this.check();
        },

        check() {
            if (this.triggered) return;

            const stats = $$('.stat h3, .stat-about h3');
            const statsSection = $('.stats-grid, .about-section .stats-grid, .stats-grid-about');

            if (statsSection) {
                const sectionPosition = statsSection.getBoundingClientRect().top;
                const screenPosition = window.innerHeight;

                if (sectionPosition < screenPosition - 100) {
                    this.animate(stats);
                    this.triggered = true;
                }
            } else {
                // If no section found, check if any stats are visible
                stats.forEach(stat => {
                    const pos = stat.getBoundingClientRect().top;
                    if (pos < window.innerHeight - 100 && !stat.hasAttribute('data-animated')) {
                        this.animateSingle(stat);
                    }
                });
            }
        },

        animate(stats) {
            stats.forEach(stat => this.animateSingle(stat));
        },

        animateSingle(stat) {
            if (stat.hasAttribute('data-animated')) return;
            
            const text = stat.innerText;
            const number = parseInt(text.replace(/[^0-9]/g, ''));
            
            if (!isNaN(number)) {
                stat.setAttribute('data-animated', 'true');
                let current = 0;
                const increment = number / 50;
                const suffix = text.replace(/[0-9]/g, '').replace('+', '');

                const updateNumber = () => {
                    if (current < number) {
                        current += increment;
                        stat.innerText = Math.ceil(current) + suffix;
                        requestAnimationFrame(updateNumber);
                    } else {
                        stat.innerText = text;
                    }
                };

                updateNumber();
            }
        }
    };

    // ========== FORM HANDLING ==========

    const FormHandler = {
        init() {
            const forms = $$('form');
            
            forms.forEach(form => {
                // Add loading state on submit
                form.addEventListener('submit', (e) => {
                    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                    if (submitBtn && !submitBtn.classList.contains('loading')) {
                        submitBtn.classList.add('loading');
                        submitBtn.disabled = true;
                        
                        // Re-enable after timeout (for demo purposes)
                        setTimeout(() => {
                            submitBtn.classList.remove('loading');
                            submitBtn.disabled = false;
                        }, 2000);
                    }
                });

                // Real-time validation
                const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', () => this.clearError(input));
                });
            });
        },

        validateField(field) {
            const value = field.value.trim();
            const formGroup = field.closest('.form-group');
            
            if (!value && field.hasAttribute('required')) {
                this.showError(field, 'This field is required');
                return false;
            }

            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.showError(field, 'Please enter a valid email address');
                    return false;
                }
            }

            this.clearError(field);
            return true;
        },

        showError(field, message) {
            const formGroup = field.closest('.form-group');
            let error = formGroup.querySelector('.field-error');
            
            if (!error) {
                error = document.createElement('span');
                error.className = 'field-error';
                error.style.cssText = 'color: #e74c3c; font-size: 13px; margin-top: 5px; display: block;';
                formGroup.appendChild(error);
            }
            
            error.textContent = message;
            field.style.borderColor = '#e74c3c';
        },

        clearError(field) {
            const formGroup = field.closest('.form-group');
            const error = formGroup.querySelector('.field-error');
            if (error) error.remove();
            field.style.borderColor = '';
        }
    };

    // ========== SMOOTH SCROLL ==========

    const SmoothScroll = {
        init() {
            $$('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href && href !== '#') {
                        const target = $(href);
                        if (target) {
                            e.preventDefault();
                            const headerOffset = 80;
                            const elementPosition = target.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }
                });
            });
        }
    };

    // ========== GALLERY LIGHTBOX ==========

    const Lightbox = {
        init() {
            const galleryItems = $$('.css-gallery-item, .gallery-item');
            
            if (galleryItems.length === 0) return;

            // Create lightbox if it doesn't exist
            let lightbox = $('#lightbox');
            if (!lightbox) {
                lightbox = document.createElement('div');
                lightbox.id = 'lightbox';
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `
                    <span class="close-lightbox" style="position: absolute; top: 20px; right: 40px; color: white; font-size: 40px; cursor: pointer; z-index: 1001;">&times;</span>
                    <div class="lightbox-content" style="position: relative; max-width: 90%; max-height: 90%; margin: 5% auto;">
                        <div class="lightbox-placeholder" style="background: linear-gradient(135deg, #1a3a4f, #2c5f8a); width: 100%; max-width: 800px; height: 500px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; text-align: center; padding: 40px;"></div>
                    </div>
                `;
                document.body.appendChild(lightbox);

                // Close handlers
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) {
                        lightbox.style.display = 'none';
                    }
                });

                lightbox.querySelector('.close-lightbox').addEventListener('click', () => {
                    lightbox.style.display = 'none';
                });

                // Keyboard close
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        lightbox.style.display = 'none';
                    }
                });
            }

            galleryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const placeholder = lightbox.querySelector('.lightbox-placeholder');
                    const title = item.querySelector('.gallery-overlay h3, .css-gallery-item')?.textContent || '';
                    
                    placeholder.innerHTML = `
                        <div>
                            <div style="font-size: 48px; margin-bottom: 20px;">🖼️</div>
                            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">${title}</div>
                            <div style="font-size: 16px; opacity: 0.8;">Gallery Image</div>
                        </div>
                    `;
                    
                    lightbox.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                });
            });

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }
    };

    // ========== TYPING ANIMATION ==========

    const TypingAnimation = {
        init() {
            const heroTitle = $('.hero-content h2');
            if (!heroTitle || window.innerWidth > 768) return;

            // Disable typing animation on mobile
            heroTitle.style.animation = 'none';
            heroTitle.style.borderRight = 'none';
            heroTitle.style.whiteSpace = 'normal';
        }
    };

    // ========== COUNTER ANIMATION ==========

    const CounterAnimation = {
        init() {
            StatsCounter.init();
        }
    };

    // ========== VIDEO SLIDESHOW ENHANCEMENT ==========

    const VideoSlideshow = {
        init() {
            const slides = $$('.slide');
            if (slides.length === 0) return;

            // Ensure videos play properly
            slides.forEach(slide => {
                const video = slide.querySelector('video');
                if (video) {
                    video.muted = true;
                    video.loop = true;
                    video.playsInline = true;
                    
                    // Try to play
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {
                            // Autoplay blocked, will play on interaction
                        });
                    }
                }
            });

            // Pause videos when not visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target.querySelector('video');
                    if (video) {
                        if (entry.isIntersecting) {
                            video.play().catch(() => {});
                        } else {
                            video.pause();
                        }
                    }
                });
            }, { threshold: 0.5 });

            slides.forEach(slide => observer.observe(slide));
        }
    };

    // ========== HEADER SCROLL EFFECT ==========

    const HeaderScroll = {
        init() {
            const header = $('header');
            if (!header) return;

            let lastScroll = 0;

            window.addEventListener('scroll', throttle(() => {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 100) {
                    header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                    header.style.background = 'rgba(255,255,255,0.98)';
                    header.style.backdropFilter = 'blur(10px)';
                } else {
                    header.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                    header.style.background = 'white';
                    header.style.backdropFilter = 'none';
                }

                lastScroll = currentScroll;
            }, 100));
        }
    };

    // ========== FORM INTERACTIONS ==========

    const FormInteractions = {
        init() {
            // Add floating label effect
            const inputs = $$('.form-group input, .form-group textarea, .form-group select');
            inputs.forEach(input => {
                if (input.value.trim() !== '') {
                    input.classList.add('has-value');
                }

                input.addEventListener('input', () => {
                    if (input.value.trim() !== '') {
                        input.classList.add('has-value');
                    } else {
                        input.classList.remove('has-value');
                    }
                });
            });

            // File upload display
            const fileInputs = $$('input[type="file"]');
            fileInputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    const fileName = e.target.files[0]?.name;
                    if (fileName) {
                        let display = input.parentElement.querySelector('.file-name-display');
                        if (!display) {
                            display = document.createElement('div');
                            display.className = 'file-name-display show';
                            input.parentElement.appendChild(display);
                        }
                        display.innerHTML = `
                            <span>📄 ${fileName}</span>
                            <span class="remove-file" onclick="this.parentElement.remove()">✕</span>
                        `;
                        display.classList.add('show');
                    }
                });
            });
        }
    };

    // ========== DROPDOWN MOBILE TOGGLE ==========

    const DropdownToggle = {
        init() {
            if (window.innerWidth > 768) return;

            const dropdowns = $$('.dropdown');
            dropdowns.forEach(dropdown => {
                const link = dropdown.querySelector('a');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                if (link && menu) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        dropdown.classList.toggle('open');
                        menu.classList.toggle('show');
                    });
                }
            });
        }
    };

    // ========== ANIMATED GALLERY ITEMS ==========

    const AnimatedGallery = {
        init() {
            const galleryItems = $$('.gallery-item');
            if (galleryItems.length === 0) return;

            galleryItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                item.style.transition = 'all 0.5s ease-out';
                item.style.transitionDelay = `${index * 0.05}s`;
            });

            // Trigger animation when visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'scale(1)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            galleryItems.forEach(item => observer.observe(item));
        }
    };

    // ========== PRELOADER ==========

    const Preloader = {
        init() {
            window.addEventListener('load', () => {
                const preloader = $('.preloader');
                if (preloader) {
                    setTimeout(() => {
                        preloader.classList.add('fade-out');
                        setTimeout(() => {
                            preloader.style.display = 'none';
                        }, 500);
                    }, 500);
                }
            });
        }
    };

    // ========== COPYRIGHT YEAR ==========

    const CopyrightYear = {
        init() {
            const yearSpan = $('.copyright p');
            if (yearSpan) {
                const currentYear = new Date().getFullYear();
                yearSpan.innerHTML = yearSpan.innerHTML.replace('2026', currentYear);
            }
        }
    };

    // ========== INITIALIZE EVERYTHING ==========

    document.addEventListener('DOMContentLoaded', () => {
        Preloader.init();
        MobileMenu.init();
        ScrollProgress.init();
        BackToTop.init();
        ActiveNav.init();
        SmoothScroll.init();
        HeaderScroll.init();
        ScrollAnimations.init();
        StatsCounter.init();
        CounterAnimation.init();
        FormHandler.init();
        FormInteractions.init();
        DropdownToggle.init();
        AnimatedGallery.init();
        VideoSlideshow.init();
        Lightbox.init();
        TypingAnimation.init();
        CopyrightYear.init();
    });

    // ========== HANDLE RESIZE ==========

    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768 && MobileMenu.isOpen) {
            MobileMenu.close();
        }
        DropdownToggle.init();
        TypingAnimation.init();
    }, 250));

    // ========== DYNAMIC CSS INJECTION ==========

    const injectDynamicStyles = () => {
        if ($('#dynamic-styles')) return;

        const style = document.createElement('style');
        style.id = 'dynamic-styles';
        style.textContent = `
            /* Scroll Progress */
            .scroll-progress {
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #e67e22, #d35400);
                z-index: 9999;
                transition: width 0.1s ease;
            }

            /* Back to Top */
            .back-to-top:hover {
                transform: translateY(-5px);
                background: #d35400;
            }

            /* Animation Ready State */
            .animate-ready {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }

            .animate-ready.animate-in {
                opacity: 1;
                transform: translateY(0);
            }

            /* Form Validation */
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                border-color: #e67e22;
                outline: none;
                box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1);
            }

            .form-group input.has-value,
            .form-group textarea.has-value,
            .form-group select.has-value {
                border-color: #27ae60;
            }

            /* File Upload */
            .file-name-display {
                display: none;
                padding: 8px 12px;
                background: #e8f5e9;
                border-radius: 5px;
                color: #2e7d32;
                font-size: 14px;
                margin-top: 8px;
                border: 1px solid #a5d6a7;
                align-items: center;
                justify-content: space-between;
            }

            .file-name-display.show {
                display: flex !important;
            }

            .file-name-display .remove-file {
                color: #c62828;
                cursor: pointer;
                font-weight: bold;
                margin-left: 10px;
                padding: 2px 8px;
                border-radius: 4px;
                transition: background 0.3s;
            }

            .file-name-display .remove-file:hover {
                background: #ffcdd2;
            }

            /* Field Error */
            .field-error {
                color: #e74c3c;
                font-size: 13px;
                margin-top: 5px;
                display: block;
            }

            /* Mobile Dropdown */
            @media (max-width: 768px) {
                .dropdown-menu {
                    position: static;
                    opacity: 1;
                    visibility: visible;
                    transform: none;
                    display: none;
                    box-shadow: none;
                    padding-left: 20px;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 0;
                    width: 100%;
                    min-width: 100%;
                    column-count: 1;
                }

                .dropdown-menu.show {
                    display: block !important;
                }

                .dropdown.open > a::after {
                    transform: rotate(180deg);
                }
            }

            /* Loading State */
            .btn-submit.loading,
            button.loading {
                position: relative;
                color: transparent !important;
                pointer-events: none;
            }

            .btn-submit.loading::before,
            button.loading::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid white;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    };

    injectDynamicStyles();

})();
