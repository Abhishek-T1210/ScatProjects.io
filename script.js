// Full Contact Form JavaScript with all functionality
document.addEventListener("DOMContentLoaded", () => {
    // Loader
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 1500);
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
            threshold: 0.15
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

    // ================ CONTACT FORM FUNCTIONALITY ================
    const contactForm = document.getElementById('contactFormyy');
    const progressBar = document.getElementById('formProgressBaryy');
    const inputs = contactForm ? contactForm.querySelectorAll('.xxform-inputyy') : [];

    // Progress Bar Update Function
    function updateProgress() {
        if (!progressBar || inputs.length === 0) return;
        
        const filled = Array.from(inputs).filter(input => {
            const value = input.value.trim();
            return value !== '' && value.length > 0;
        }).length;
        
        const percent = (filled / inputs.length) * 100;
        progressBar.style.width = `${percent}%`;
        
        // Add completion celebration effect
        if (percent === 100) {
            progressBar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
            setTimeout(() => {
                progressBar.style.background = 'linear-gradient(90deg, #667eea, #764ba2)';
            }, 1000);
        }
    }

    // Input focus and blur handlers for enhanced UX
    function handleInputFocus(event) {
        const formGroup = event.target.closest('.xxform-groupyy');
        if (formGroup) {
            formGroup.classList.add('focused');
            const label = formGroup.querySelector('.form-label');
            if (label) {
                label.style.color = '#667eea';
                label.style.transform = 'scale(1.05)';
            }
        }
    }

    function handleInputBlur(event) {
        const formGroup = event.target.closest('.xxform-groupyy');
        if (formGroup) {
            formGroup.classList.remove('focused');
            const label = formGroup.querySelector('.form-label');
            if (label) {
                label.style.color = '#4a5568';
                label.style.transform = 'scale(1)';
            }
        }
        
        // Validate field on blur
        validateField(event.target);
    }

    // Individual field validation
    function validateField(field) {
        const fieldId = field.id;
        const value = field.value.trim();
        const errorSpan = field.parentElement.querySelector('.xxform-erroryy');
        
        if (!errorSpan) return true;
        
        let isValid = true;
        let errorMessage = '';

        switch(fieldId) {
            case 'name':
                const nameRegex = /^[a-zA-Z\s]{2,}$/;
                if (!nameRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Invalid name: Use letters and spaces only, minimum 2 characters';
                }
                break;
            
            case 'phone':
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Invalid phone number: Must be 10 digits';
                }
                break;
            
            case 'branch':
                const branchRegex = /^[a-zA-Z\s]{2,}$/;
                if (!branchRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Invalid branch: Use letters and spaces only, minimum 2 characters';
                }
                break;
            
            case 'project':
                if (value === '' || value.length < 10) {
                    isValid = false;
                    errorMessage = 'Project description must be at least 10 characters';
                }
                break;
        }

        if (isValid) {
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
            errorSpan.classList.remove('show');
            field.style.borderColor = '#10b981';
        } else {
            errorSpan.textContent = errorMessage;
            errorSpan.style.display = 'block';
            errorSpan.classList.add('show');
            field.style.borderColor = '#e53e3e';
        }

        return isValid;
    }

    // Add input event listeners for all form enhancements
    inputs.forEach(input => {
        input.addEventListener('input', updateProgress);
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
    });

    // Stagger animations
    const contactDetails = document.querySelectorAll('.xxcontact-detailyy');
    contactDetails.forEach((detail, index) => {
        detail.style.animationDelay = `${index * 0.2 + 0.5}s`;
    });

    const formGroups = document.querySelectorAll('.xxform-groupyy');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1 + 0.3}s`;
    });

    // Particle effect creation
    function createParticleEffect(button) {
        const rect = button.getBoundingClientRect();
        const particles = 15;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = rect.left + rect.width / 2 + 'px';
            particle.style.top = rect.top + rect.height / 2 + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#ffffff';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / particles;
            const velocity = 2;
            const distance = 100;
            
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${targetX}px, ${targetY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).addEventListener('finish', () => {
                document.body.removeChild(particle);
            });
        }
    }

    // Form submission handler
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (validateFormyy()) {
                handleFormSubmission();
            } else {
                // Shake form on validation error
                contactForm.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    contactForm.style.animation = '';
                }, 500);
            }
        });
    }

    // Handle form submission with enhanced effects
    function handleFormSubmission() {
        const submitBtn = contactForm.querySelector('.xxform-submityy');
        if (!submitBtn) return;

        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Create particle effect
        createParticleEffect(submitBtn);

        // Simulate form submission
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Show success popup
            showPopupyy('Thank you for your interest! We\'ll contact you within 24 hours to discuss your project.');
            
            // Reset form
            contactForm.reset();
            updateProgress();
            
            // Clear all error messages and reset field styles
            const errorSpans = document.querySelectorAll('.xxform-erroryy');
            errorSpans.forEach(span => {
                span.textContent = '';
                span.style.display = 'none';
                span.classList.remove('show');
            });

            inputs.forEach(input => {
                input.style.borderColor = '#e2e8f0';
            });

            // Success animation for submit button
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            setTimeout(() => {
                submitBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            }, 2000);
            
        }, 1500);
    }

    // Form validation function
    function validateFormyy() {
        let valid = true;
        const errorSpans = document.querySelectorAll('.xxform-erroryy');
        
        // Clear all previous errors
        errorSpans.forEach(span => {
            span.textContent = '';
            span.style.display = 'none';
            span.classList.remove('show');
        });

        // Reset all field border colors
        inputs.forEach(input => {
            input.style.borderColor = '#e2e8f0';
        });

        // Validate each field
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

    // Show popup function
    function showPopupyy(message) {
        const popup = document.getElementById('popupyy');
        if (popup) {
            const popupMessage = popup.querySelector('p');
            if (popupMessage) {
                popupMessage.textContent = message;
            }
            popup.classList.add('active');
        }
    }

    // Close popup function (global function)
    window.closePopupyy = function() {
        const popup = document.getElementById('popupyy');
        if (popup) {
            popup.classList.remove('active');
        }
    };

    // Add typing effect for placeholders (optional enhancement)
    function addTypingEffect() {
        const typingInputs = document.querySelectorAll('.xxform-inputyy[placeholder]');
        
        typingInputs.forEach(input => {
            const originalPlaceholder = input.getAttribute('placeholder');
            let currentPlaceholder = '';
            let index = 0;
            
            function typePlaceholder() {
                if (index < originalPlaceholder.length) {
                    currentPlaceholder += originalPlaceholder[index];
                    input.setAttribute('placeholder', currentPlaceholder);
                    index++;
                    setTimeout(typePlaceholder, 100);
                }
            }
            
            // Start typing effect when input comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            input.setAttribute('placeholder', '');
                            currentPlaceholder = '';
                            index = 0;
                            typePlaceholder();
                        }, 500);
                        observer.unobserve(input);
                    }
                });
            });
            
            observer.observe(input);
        });
    }

    // Initialize typing effect
    addTypingEffect();
});