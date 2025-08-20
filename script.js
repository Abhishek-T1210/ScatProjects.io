document.addEventListener("DOMContentLoaded", () => {
    // Loader
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 1000);
        });
    }

    // Mobile Menu
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.innerHTML = navMenu.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Header Scroll Effect
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Scroll Animations
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    if (animateOnScrollElements.length > 0 && 'IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animateOnScrollElements.forEach(element => observer.observe(element));
    }

    // Portfolio Filter
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.getAttribute('data-filter');
                portfolioItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || filter === category) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.classList.add('animated');
                        }, 50);
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('animated');
                    }
                });
            });
        });
    }

    // Modal Functionality
    const modal = document.getElementById('portfolio-modal');
    if (modal) {
        const modalBody = document.getElementById('modal-body');
        const closeBtn = document.querySelector('.modal-close');
        const detailBtns = document.querySelectorAll('.portfolio-overlay-btn');

        if (detailBtns.length > 0 && modalBody && closeBtn) {
            detailBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const item = btn.closest('.portfolio-item').cloneNode(true);
                    modalBody.innerHTML = '';
                    modalBody.appendChild(item);
                    modal.style.display = 'flex';
                    setTimeout(() => {
                        modal.querySelector('.modal-content').classList.add('animated');
                    }, 100);
                });
            });

            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                modal.querySelector('.modal-content').classList.remove('animated');
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    modal.querySelector('.modal-content').classList.remove('animated');
                }
            });
        }
    }

    // Contact Form Functionality
    const contactForm = document.getElementById('contactForm');
    const progressBar = document.getElementById('formProgressBar');
    const inputs = contactForm ? contactForm.querySelectorAll('.form-input') : [];

    // Progress Bar Update Function
    function updateProgress() {
        if (!progressBar || inputs.length === 0) return;
        
        const filled = Array.from(inputs).filter(input => input.value.trim() !== '').length;
        const percent = (filled / inputs.length) * 100;
        progressBar.style.width = `${percent}%`;
        
        if (percent === 100) {
            progressBar.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
            setTimeout(() => {
                progressBar.style.background = 'linear-gradient(90deg, #4f46e5, #7c3aed)';
            }, 800);
        }
    }

    // Input focus and blur handlers
    function handleInputFocus(event) {
        const formGroup = event.target.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('focused');
            const label = formGroup.querySelector('.form-label');
            if (label) {
                label.style.color = '#4f46e5';
                label.style.transform = 'scale(1.02)';
            }
        }
    }

    function handleInputBlur(event) {
        const formGroup = event.target.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('focused');
            const label = formGroup.querySelector('.form-label');
            if (label) {
                label.style.color = '#475569';
                label.style.transform = 'scale(1)';
            }
        }
        validateField(event.target);
    }

    // Individual field validation
    function validateField(field) {
        const fieldId = field.id;
        const value = field.value.trim();
        const errorSpan = field.parentElement.querySelector('.form-error');
        
        if (!errorSpan) return true;
        
        let isValid = true;
        let errorMessage = '';

        switch(fieldId) {
            case 'name':
                const nameRegex = /^[a-zA-Z\s]{3,}$/;
                if (!nameRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Name must be at least 3 characters';
                }
                break;
            
            case 'phone':
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Enter a valid 10-digit phone number';
                }
                break;
            
            case 'branch':
                const branchRegex = /^[a-zA-Z\s]{3,}$/;
                if (!branchRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Branch name must be at least 3 characters';
                }
                break;
            
            case 'project':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Description must be at least 10 characters';
                }
                break;
        }

        if (isValid) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
            field.style.borderColor = '#22c55e';
        } else {
            errorSpan.textContent = errorMessage;
            errorSpan.classList.add('show');
            field.style.borderColor = '#ef4444';
        }

        return isValid;
    }

    // Add event listeners
    inputs.forEach(input => {
        input.addEventListener('input', updateProgress);
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
    });

    // Animation delays
    const contactDetails = document.querySelectorAll('.contact-detail');
    contactDetails.forEach((detail, index) => {
        detail.style.animationDelay = `${index * 0.15 + 0.4}s`;
    });

    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1 + 0.2}s`;
    });

    // Particle effect
    function createParticleEffect(button) {
        const rect = button.getBoundingClientRect();
        const particles = 10;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = `${rect.left + rect.width / 2}px`;
            particle.style.top = `${rect.top + rect.height / 2}px`;
            particle.style.width = '3px';
            particle.style.height = '3px';
            particle.style.background = '#ffffff';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / particles;
            const velocity = 1.5;
            const distance = 80;
            
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${targetX}px, ${targetY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).addEventListener('finish', () => particle.remove());
        }
    }

    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', event => {
            event.preventDefault();
            
            if (validateForm()) {
                handleFormSubmission();
            } else {
                contactForm.style.animation = 'shake 0.4s ease-in-out';
                setTimeout(() => contactForm.style.animation = '', 400);
            }
        });
    }

    function handleFormSubmission() {
        const submitBtn = contactForm.querySelector('.form-submit');
        if (!submitBtn) return;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        createParticleEffect(submitBtn);

        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            showPopup('Your request has been submitted successfully. Our team will contact you shortly.');
            
            contactForm.reset();
            updateProgress();
            
            const errorSpans = document.querySelectorAll('.form-error');
            errorSpans.forEach(span => {
                span.textContent = '';
                span.classList.remove('show');
            });

            inputs.forEach(input => input.style.borderColor = '#e5e7eb');

            submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            setTimeout(() => {
                submitBtn.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
            }, 1500);
            
        }, 1200);
    }

    function validateForm() {
        let valid = true;
        const errorSpans = document.querySelectorAll('.form-error');
        errorSpans.forEach(span => {
            span.textContent = '';
            span.classList.remove('show');
        });

        inputs.forEach(input => input.style.borderColor = '#e5e7eb');

        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const branchInput = document.getElementById('branch');
        const projectInput = document.getElementById('project');

        if (nameInput && !validateField(nameInput)) valid = false;
        if (phoneInput && !validateField(phoneInput)) valid = false;
        if (branchInput && !validateField(branchInput)) valid = false;
        if (projectInput && !validateField(projectInput)) valid = false;

        return valid;
    }

    function showPopup(message) {
        const popup = document.getElementById('popup');
        if (popup) {
            const popupMessage = popup.querySelector('p');
            if (popupMessage) popupMessage.textContent = message;
            popup.classList.add('active');
        }
    }

    window.closePopup = function() {
        const popup = document.getElementById('popup');
        if (popup) popup.classList.remove('active');
    };

    // Typing effect for placeholders
    function addTypingEffect() {
        const typingInputs = document.querySelectorAll('.form-input[placeholder]');
        
        typingInputs.forEach(input => {
            const originalPlaceholder = input.getAttribute('placeholder');
            let currentPlaceholder = '';
            let index = 0;
            
            function typePlaceholder() {
                if (index < originalPlaceholder.length) {
                    currentPlaceholder += originalPlaceholder[index];
                    input.setAttribute('placeholder', currentPlaceholder);
                    index++;
                    setTimeout(typePlaceholder, 120);
                }
            }
            
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            input.setAttribute('placeholder', '');
                            currentPlaceholder = '';
                            index = 0;
                            typePlaceholder();
                        }, 400);
                        observer.unobserve(input);
                    }
                });
            });
            
            observer.observe(input);
        });
    }

    addTypingEffect();
});

document.addEventListener("DOMContentLoaded", () => {
    const animatedElements = document.querySelectorAll('[data-animate]');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.dataset.animate;
                    const delay = element.dataset.delay || '0s';
                    element.style.animation = `${animation} 0.6s ease ${delay} forwards`;
                    observer.unobserve(element);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.2 });

        animatedElements.forEach(element => observer.observe(element));
    }

    const contactForm = document.getElementById('contactForm');
    const progressBar = document.getElementById('formProgressBar');
    const inputs = contactForm ? contactForm.querySelectorAll('.form-input') : [];

    function updateProgress() {
        if (!progressBar || inputs.length === 0) return;
        
        const filled = Array.from(inputs).filter(input => input.value.trim() !== '').length;
        const percent = (filled / inputs.length) * 100;
        progressBar.style.width = `${percent}%`;
    }

    function validateField(field) {
        const fieldId = field.id;
        const value = field.value.trim();
        const errorSpan = field.parentElement.querySelector('.form-error');
        
        if (!errorSpan) return true;
        
        let isValid = true;
        let errorMessage = '';

        switch(fieldId) {
            case 'name':
                const nameRegex = /^[a-zA-Z\s]{3,}$/;
                if (!nameRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Name must be at least 3 characters';
                }
                break;
            
            case 'phone':
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Enter a valid 10-digit phone number';
                }
                break;
            
            case 'branch':
                const branchRegex = /^[a-zA-Z\s]{3,}$/;
                if (!branchRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Branch name must be at least 3 characters';
                }
                break;
            
            case 'project':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Description must be at least 10 characters';
                }
                break;
        }

        if (isValid) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
            field.style.borderColor = 'var(--gray-300)';
        } else {
            errorSpan.textContent = errorMessage;
            errorSpan.classList.add('show');
            field.style.borderColor = 'var(--error)';
        }

        return isValid;
    }

    function validateForm() {
        let valid = true;
        const errorSpans = document.querySelectorAll('.form-error');
        errorSpans.forEach(span => {
            span.textContent = '';
            span.classList.remove('show');
        });

        inputs.forEach(input => input.style.borderColor = 'var(--gray-300)');

        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const branchInput = document.getElementById('branch');
        const projectInput = document.getElementById('project');

        if (nameInput && !validateField(nameInput)) valid = false;
        if (phoneInput && !validateField(phoneInput)) valid = false;
        if (branchInput && !validateField(branchInput)) valid = false;
        if (projectInput && !validateField(projectInput)) valid = false;

        return valid;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', event => {
            event.preventDefault();
            
            if (validateForm()) {
                const submitBtn = contactForm.querySelector('.form-submit');
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;

                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    contactForm.reset();
                    updateProgress();
                    showPopup();
                }, 1200);
            }
        });
    }

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            updateProgress();
            validateField(input);
        });
        input.addEventListener('focus', () => {
            input.parentElement.querySelector('.input-icon').style.color = 'var(--primary)';
        });
        input.addEventListener('blur', () => {
            input.parentElement.querySelector('.input-icon').style.color = 'var(--gray-500)';
            validateField(input);
        });
    });

    function showPopup() {
        const popup = document.getElementById('popup');
        if (popup) {
            popup.classList.add('active');
            setTimeout(() => {
                popup.classList.remove('active');
            }, 4000);
        }
    }

    window.closePopup = function() {
        const popup = document.getElementById('popup');
        if (popup) popup.classList.remove('active');
    };
});
// Callback Popup JS - Add this to your script.js file

document.addEventListener('DOMContentLoaded', () => {
    // Show callback popup after 10 seconds
    setTimeout(() => {
        const popup = document.getElementById('callbackPopup');
        if (popup) {
            popup.classList.add('active');
        }
    }, 10000);

    // Form validation and submission
    const callbackForm = document.getElementById('callbackForm');
    if (callbackForm) {
        callbackForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const phoneInput = document.getElementById('callbackPhone');
            const errorSpan = document.getElementById('callbackError');
            const phoneRegex = /^\d{10}$/;

            if (!phoneRegex.test(phoneInput.value.trim())) {
                errorSpan.textContent = 'Enter a valid 10-digit phone number';
                errorSpan.classList.add('show');
                phoneInput.style.borderColor = '#ef4444';
            } else {
                errorSpan.textContent = '';
                errorSpan.classList.remove('show');
                phoneInput.style.borderColor = 'transparent';
                // Close callback popup and show acknowledgment popup
                closeCallbackPopup();
                showAckPopup();
                callbackForm.reset();
            }
        });
    }
});

// Close callback popup function
function closeCallbackPopup() {
    const popup = document.getElementById('callbackPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

// Show acknowledgment popup function
function showAckPopup() {
    const ackPopup = document.getElementById('ackPopup');
    if (ackPopup) {
        ackPopup.classList.add('active');
        setTimeout(() => {
            ackPopup.classList.remove('active');
        }, 3000); // Auto-close after 3 seconds
    }
}