document.addEventListener("DOMContentLoaded", () => {
    // Backend URL configuration
    const BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://scatprojects-io.onrender.com';

    // Loader
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            const startTime = Date.now();
            const minDisplayTime = 1000;
            const elapsed = Date.now() - startTime;
            setTimeout(() => loader.classList.add('hidden'), Math.max(0, minDisplayTime - elapsed));
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
            mobileToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });
    }

    // Header Scroll Effect
    const header = document.getElementById('header');
    if (header) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Scroll Animations
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    if (animateOnScrollElements.length > 0) {
        if ('IntersectionObserver' in window) {
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
        } else {
            animateOnScrollElements.forEach(el => el.classList.add('animated'));
        }
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
                        setTimeout(() => item.classList.add('animated'), 50);
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

    // Form Animations
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

    // Contact Form Functionality
    const contactForm = document.getElementById('contactForm');
    const progressBar = document.getElementById('formProgressBar');
    const inputs = contactForm ? contactForm.querySelectorAll('.form-input') : [];

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

    function validateField(field) {
        const fieldId = field.id;
        const value = field.value.trim();
        const errorSpan = field.parentElement.parentElement.querySelector('.form-error');
        if (!errorSpan) return true;

        let isValid = true;
        let errorMessage = '';

        switch (fieldId) {
            case 'name':
                if (!/^[a-zA-Z\s]{3,}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Name must be at least 3 alphabetic characters';
                }
                break;
            case 'phone':
                if (!/^\d{10}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Enter a valid 10-digit phone number';
                }
                break;
            case 'branch':
                if (!/^[a-zA-Z\s]{3,}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Branch must be at least 3 alphabetic characters';
                }
                break;
            case 'project':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Project description must be at least 10 characters';
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

    function validateForm() {
        let valid = true;
        const errorSpans = contactForm.querySelectorAll('.form-error');
        errorSpans.forEach(span => {
            span.textContent = '';
            span.classList.remove('show');
        });

        inputs.forEach(input => input.style.borderColor = '#e5e7eb');

        if (document.getElementById('name') && !validateField(document.getElementById('name'))) valid = false;
        if (document.getElementById('phone') && !validateField(document.getElementById('phone'))) valid = false;
        if (document.getElementById('branch') && !validateField(document.getElementById('branch'))) valid = false;
        if (document.getElementById('project') && !validateField(document.getElementById('project'))) valid = false;

        return valid;
    }

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

    if (contactForm) {
        contactForm.addEventListener('submit', async event => {
            event.preventDefault();

            if (validateForm()) {
                const submitBtn = contactForm.querySelector('.form-submit');
                if (!submitBtn) {
                    console.error('Submit button not found');
                    return;
                }
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;

                createParticleEffect(submitBtn);

                // Generate timestamp in IST with 12-hour format
                const now = new Date();
                const istOffset = 5.5 * 60 * 60 * 1000; // UTC+5:30
                const istTime = new Date(now.getTime() + istOffset);
                const year = istTime.getUTCFullYear();
                const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
                const day = String(istTime.getUTCDate()).padStart(2, '0');
                let hours = istTime.getUTCHours();
                const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                const formattedHours = String(hours).padStart(2, '0');
                const timestamp = `${year}-${month}-${day} ${formattedHours}:${minutes} ${ampm}`;

                const data = {
                    name: document.getElementById('name').value.trim(),
                    phone: document.getElementById('phone').value.trim(),
                    branch: document.getElementById('branch').value.trim(),
                    project: document.getElementById('project').value.trim(),
                    timestamp: timestamp,
                    formType: 'project'
                };

                try {
                    const response = await fetch(`${BASE_URL}/project`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        throw new Error('Server returned non-JSON response');
                    }

                    const result = await response.json();
                    if (!response.ok) {
                        throw new Error(result.message || 'Failed to submit project request');
                    }

                    contactForm.reset();
                    updateProgress();
                    showPopup();
                    document.querySelectorAll('.form-error').forEach(span => {
                        span.textContent = '';
                        span.classList.remove('show');
                    });
                    inputs.forEach(input => input.style.borderColor = '#e5e7eb');
                } catch (error) {
                    console.error('Project Form Error:', error);
                    const errorSpan = document.getElementById('name').parentElement.parentElement.querySelector('.form-error');
                    if (errorSpan) {
                        errorSpan.textContent = error.message || 'Failed to submit project request. Please try again.';
                        errorSpan.classList.add('show');
                    }
                    inputs.forEach(input => input.style.borderColor = '#ef4444');
                } finally {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            } else {
                contactForm.style.animation = 'shake 0.4s ease-in-out';
                setTimeout(() => contactForm.style.animation = '', 400);
            }
        });

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
    }

    function showPopup() {
        const popup = document.getElementById('popup');
        if (popup) {
            popup.classList.add('active');
            setTimeout(() => popup.classList.remove('active'), 4000);
        }
    }

    window.closePopup = function() {
        const popup = document.getElementById('popup');
        if (popup) popup.classList.remove('active');
    };

    // Callback Form Functionality
    const callbackForm = document.getElementById('callbackForm');
    setTimeout(() => {
        const callbackPopup = document.getElementById('callbackPopup');
        if (callbackPopup) {
            callbackPopup.classList.add('active');
        }
    }, 12000);

    if (callbackForm) {
        callbackForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const phoneInput = document.getElementById('callbackPhone');
            const errorSpan = document.getElementById('callbackError');
            const loader = document.getElementById('callbackLoader');
            const submitBtn = callbackForm.querySelector('.futuristic-form-submit');
            const phoneRegex = /^\d{10}$/;

            if (!phoneInput || !errorSpan || !submitBtn) {
                console.error('Callback form elements missing');
                return;
            }

            // Validate phone number
            if (!phoneRegex.test(phoneInput.value.trim())) {
                errorSpan.textContent = 'Enter a valid 10-digit phone number';
                errorSpan.classList.add('show');
                phoneInput.style.borderColor = '#ef4444';
                return;
            }

            // Clear error and reset styles
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
            phoneInput.style.borderColor = '#22c55e';

            // Disable submit button and show loader
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            if (loader) {
                loader.classList.add('active');
            }

            // Generate timestamp in IST with 12-hour format
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000; // UTC+5:30
            const istTime = new Date(now.getTime() + istOffset);
            const year = istTime.getUTCFullYear();
            const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
            const day = String(istTime.getUTCDate()).padStart(2, '0');
            let hours = istTime.getUTCHours();
            const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const formattedHours = String(hours).padStart(2, '0');
            const timestamp = `${year}-${month}-${day} ${formattedHours}:${minutes} ${ampm}`;

            // Prepare data for backend
            const data = {
                phone: phoneInput.value.trim(),
                timestamp: timestamp,
                formType: 'callback'
            };

            try {
                const response = await fetch(`${BASE_URL}/callback`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server returned non-JSON response');
                }

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to submit callback request');
                }

                closeCallbackPopup();
                showAckPopup();
                callbackForm.reset();
            } catch (error) {
                console.error('Callback Form Error:', error);
                if (errorSpan) {
                    errorSpan.textContent = error.message || 'Failed to submit callback request. Please try again.';
                    errorSpan.classList.add('show');
                }
                phoneInput.style.borderColor = '#ef4444';
            } finally {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                if (loader) {
                    loader.classList.remove('active');
                }
            }
        });
    }

    window.closeCallbackPopup = function() {
        const callbackPopup = document.getElementById('callbackPopup');
        if (callbackPopup) {
            callbackPopup.classList.remove('active');
        }
    };

    function showAckPopup() {
        const ackPopup = document.getElementById('ackPopup');
        if (ackPopup) {
            ackPopup.classList.add('active');
            setTimeout(() => {
                ackPopup.classList.remove('active');
            }, 4000);
        }
    }

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

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.testimonials-grid');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const cards = document.querySelectorAll('.testimonial-card');
    let currentIndex = 0;

    function updateCarousel() {
        if (window.innerWidth <= 786) {
            const cardWidth = cards[0].offsetWidth; // Card width
            const gap = 10; // CSS gap between cards
            const padding = 10; // Margin on each side of card
            const containerWidth = grid.offsetWidth; // Container width
            let scrollLeft;

            if (currentIndex === cards.length - 1) {
                // For the last card, align its right edge with the container's right edge
                scrollLeft = (cards.length - 1) * (cardWidth + gap) + padding;
            } else {
                // For other cards, center them
                const offset = (containerWidth - cardWidth - 2 * padding) / 2;
                scrollLeft = currentIndex * (cardWidth + gap) + padding - offset;
            }

            grid.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
            // Update button states with visual feedback
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === cards.length - 1;
            updateButtonStyles();
        }
    }

    function updateButtonStyles() {
        // Apply styles for active/inactive states
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
        prevBtn.style.background = prevBtn.disabled 
            ? '#cccccc' 
            : 'linear-gradient(135deg, #007bff, #005bb5)';
        
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
        nextBtn.style.background = nextBtn.disabled 
            ? '#cccccc' 
            : 'linear-gradient(135deg, #007bff, #005bb5)';
    }

    nextBtn.addEventListener('click', () => {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 786) {
            grid.style.overflowX = 'visible';
            grid.scrollTo({ left: 0, behavior: 'auto' });
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            updateButtonStyles();
        } else {
            grid.style.overflowX = 'hidden';
            updateCarousel();
        }
    });

    // Initial button state, alignment, and styles
    updateCarousel();
});

// JavaScript to duplicate cards for seamless looping
function setupInfiniteScroll() {
  const slider = document.getElementById('servicesSlider');
  if (!slider) return;

  const cards = slider.querySelectorAll('.service-card');
  if (cards.length === 0) return;

  // Duplicate all cards to create seamless loop
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    slider.appendChild(clone);
  });

  // Calculate total width of original cards
  const totalWidth = Array.from(cards).reduce((sum, card) => {
    return sum + card.offsetWidth + parseInt(getComputedStyle(slider).gap || 0);
  }, 0);

  // Update animation duration based on content width
  const duration = (totalWidth / 100) * 2; // Adjust speed: 100px per 2 seconds
  slider.style.animationDuration = `${duration}s`;
}

// Run on page load
window.addEventListener('load', setupInfiniteScroll);

// Re-run on resize to handle dynamic card sizes
window.addEventListener('resize', setupInfiniteScroll);


document.addEventListener('DOMContentLoaded', () => {
  const steps = document.querySelectorAll('.xxprocess-step');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.3 }
  );

  steps.forEach((step) => observer.observe(step));
});

document.addEventListener("DOMContentLoaded", () => {
    const techSelect = document.getElementById('tech-select');
    const generateBtn = document.getElementById('generate-btn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('ideas-results');

    // Project ideas data
    const projectIdeas = {
        'ai-ml': [
            'AI-Powered Chatbot for Customer Support in E-commerce',
            'Predictive Analytics for Stock Market Trends Using ML Models',
            'Sentiment Analysis Tool for Social Media Feedback',
            'Recommendation System for Personalized Movie Suggestions',
            'Facial Recognition Attendance System for Schools',
            'Voice Assistant for Smart Home Automation',
            'Anomaly Detection in Network Traffic for Cybersecurity',
            'Image Classification for Medical Diagnosis Assistance',
            'Natural Language Processing for Resume Screening',
            'Machine Learning-Based Fraud Detection in Banking Transactions'
        ],
        'web-dev': [
            'Responsive E-commerce Website with Payment Integration',
            'Task Management Dashboard with Real-Time Collaboration',
            'Portfolio Website for Freelance Developers with CMS',
            'Online Learning Platform with Video Streaming',
            'Social Media Analytics Dashboard',
            'Event Booking System with Calendar Integration',
            'Blogging Platform with SEO Optimization',
            'Real Estate Listing Website with Map Views',
            'Fitness Tracker Web App with Progress Charts',
            'Recipe Sharing Community with User Ratings'
        ],
        'mobile-app': [
            'Fitness Tracking App with GPS Integration',
            'Expense Manager App with Receipt Scanning',
            'Language Learning App with Gamification',
            'Local Delivery Service App with Real-Time Tracking',
            'Mental Health Journal App with Mood Analysis',
            'Recipe App with Offline Access and Shopping Lists',
            'Event Planner App with Social Sharing',
            'Book Recommendation App Using User Preferences',
            'Travel Planner App with Itinerary Builder',
            'Habit Building App with Reminders and Streaks'
        ],
        'deep-learning': [
            'Object Detection System for Autonomous Vehicles',
            'Generative Adversarial Network for Image Synthesis',
            'Deep Learning Model for Handwritten Digit Recognition',
            'Neural Network for Speech-to-Text Transcription',
            'Convolutional Neural Network for Plant Disease Detection',
            'Recurrent Neural Network for Time Series Forecasting',
            'Deep Reinforcement Learning for Game AI',
            'Autoencoder for Anomaly Detection in Data',
            'Transformer Model for Machine Translation',
            'Deep Learning-Based Style Transfer for Images'
        ],
        'blockchain': [
            'Decentralized Voting System Using Smart Contracts',
            'NFT Marketplace Platform on Ethereum',
            'Supply Chain Management with Blockchain Tracking',
            'Cryptocurrency Wallet App with Multi-Signature Support',
            'Blockchain-Based Identity Verification System',
            'Decentralized File Storage Solution',
            'Tokenized Asset Management Platform',
            'Smart Contract for Automated Insurance Claims',
            'Blockchain Voting for Corporate Governance',
            'Peer-to-Peer Lending Platform on Blockchain'
        ],
        'iot': [
            'Smart Home Automation System with Voice Control',
            'IoT-Based Environmental Monitoring Station',
            'Wearable Health Tracker with Real-Time Alerts',
            'Agriculture IoT System for Soil Moisture Monitoring',
            'Smart Parking System Using Sensor Networks',
            'Energy Management System for Smart Grids',
            'IoT Device for Elderly Care Monitoring',
            'Traffic Management System with IoT Sensors',
            'Waste Management Bin with Fill-Level Sensors',
            'Remote Patient Monitoring System for Hospitals'
        ]
    };

    generateBtn.addEventListener('click', () => {
        const selectedTech = techSelect.value;
        if (!selectedTech) {
            alert('Please select a technology first!');
            return;
        }

        // Hide results if visible
        results.classList.add('hidden');
        results.innerHTML = '';

        // Show loading
        loading.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        // Simulate loading for 3 seconds
        setTimeout(() => {
            loading.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Generate Ideas';

            // Get ideas for selected tech
            const ideas = projectIdeas[selectedTech];
            if (ideas && ideas.length > 0) {
                ideas.forEach((idea, index) => {
                    const card = document.createElement('div');
                    card.className = 'idea-card';
                    card.style.animationDelay = `${index * 0.1}s`;
                    card.innerHTML = `
                        <h4>${index + 1}. ${idea}</h4>
                        <p>Explore this project to enhance your skills in ${selectedTech.toUpperCase()} and create a standout portfolio piece.</p>
                    `;
                    results.appendChild(card);
                });
                results.classList.remove('hidden');
            } else {
                results.innerHTML = '<p>No ideas found for the selected technology. Please try another.</p>';
                results.classList.remove('hidden');
            }
        }, 3000);
    });

    // Optional: Auto-generate on selection change for enhanced UX
    techSelect.addEventListener('change', () => {
        if (techSelect.value) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
            results.classList.add('hidden');
        }
    });

    // Initial state
    generateBtn.disabled = true;
});