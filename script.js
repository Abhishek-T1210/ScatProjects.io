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
    const sectorSelect = document.getElementById('sector-select');
    const generateBtn = document.getElementById('generate-btn');
    const aiGeneration = document.getElementById('ai-generation');
    const loading = document.getElementById('loading');
    const results = document.getElementById('ideas-results');
    const carouselTrack = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('carousel-dots');

    let currentIndex = 0;
    let totalCards = 0;

    // Project ideas data
    const projectIdeas = {
        'ai-ml': {
            'agriculture': [
                'AI-Driven Crop Disease Detection Using Image Recognition',
                'Predictive Analytics for Yield Optimization in Farming',
                'Smart Irrigation System with ML Weather Forecasting',
                'Pest Detection and Monitoring Using Computer Vision',
                'Soil Health Analysis with Machine Learning Models',
                'Automated Harvesting Robot Control System',
                'Livestock Health Monitoring with AI Sensors',
                'Precision Agriculture Drone Path Optimization',
                'Farm Supply Chain Prediction and Management',
                'AI-Based Fertilizer Recommendation System'
            ],
            'medical': [
                'AI-Powered Diagnostic Tool for Disease Identification',
                'Predictive Modeling for Patient Readmission Risks',
                'Medical Image Analysis for Tumor Detection',
                'Drug Interaction Prediction Using Machine Learning',
                'Patient Triage System with Symptom Analysis',
                'Mental Health Assessment Chatbot',
                'Wearable Data Analysis for Early Disease Detection',
                'Personalized Treatment Recommendation Engine',
                'Epidemic Outbreak Prediction Model',
                'Virtual Health Assistant for Remote Monitoring'
            ],
            'business': [
                'Customer Churn Prediction for Retail Businesses',
                'Sales Forecasting with Time Series Analysis',
                'Fraud Detection in Financial Transactions',
                'Market Trend Analysis Using Sentiment Mining',
                'Inventory Optimization with Demand Prediction',
                'Personalized Marketing Recommendation System',
                'Employee Performance Analytics Dashboard',
                'Supply Chain Risk Assessment Model',
                'Pricing Optimization Using ML Algorithms',
                'Competitor Analysis with Web Scraping and AI'
            ],
            'education': [
                'Personalized Learning Path Generator Using AI',
                'Automated Essay Grading System',
                'Student Performance Prediction Model',
                'AI-Powered Virtual Tutor for Math',
                'Language Proficiency Assessment Tool',
                'Plagiarism Detection Using ML',
                'Learning Style Identification System',
                'AI Chatbot for Student Queries',
                'Course Recommendation Engine',
                'Automated Attendance System with Facial Recognition'
            ],
            'environment': [
                'AI for Air Quality Prediction and Monitoring',
                'Wildlife Conservation Tracking Using ML',
                'Deforestation Detection with Satellite Imagery',
                'Carbon Footprint Calculator Using AI',
                'Waste Classification System with Computer Vision',
                'Renewable Energy Optimization Model',
                'Water Quality Analysis Using ML Sensors',
                'Climate Impact Prediction for Urban Areas',
                'AI-Driven Recycling Recommendation System',
                'Biodiversity Monitoring with AI Analytics'
            ],
            'transportation': [
                'Traffic Flow Prediction Using Machine Learning',
                'AI-Based Route Optimization for Delivery',
                'Accident Risk Assessment Model',
                'Public Transport Demand Forecasting',
                'Autonomous Vehicle Path Planning System',
                'Parking Space Availability Predictor',
                'Fleet Maintenance Scheduling Using AI',
                'Traffic Signal Optimization with ML',
                'Ride-Sharing Demand Prediction Model',
                'AI for Logistics Supply Chain Optimization'
            ]
        },
        'web-dev': {
            'agriculture': [
                'Farm Management Dashboard with Real-Time Monitoring',
                'Online Marketplace for Agricultural Products',
                'Crop Planning Web Application with Calendar Integration',
                'Soil Testing Results Portal for Farmers',
                'Agricultural Supply Chain Tracking System',
                'Weather-Based Farming Advisory Website',
                'Livestock Management and Health Records Portal',
                'Farm Equipment Rental Booking Platform',
                'Organic Produce Certification Verification Site',
                'Rural Market Price Comparison Tool'
            ],
            'medical': [
                'Telemedicine Platform with Video Consultation',
                'Patient Health Record Management System',
                'Appointment Scheduling and Reminder Portal',
                'Medical Inventory and Supply Chain Dashboard',
                'Symptom Checker and Triage Web App',
                'Hospital Bed Availability Tracker',
                'Prescription Management and Refill System',
                'Health Insurance Claim Processing Portal',
                'Medical Research Data Collaboration Platform',
                'Virtual Reality Therapy Session Booking Site'
            ],
            'business': [
                'E-commerce Platform with Inventory Management',
                'CRM System for Customer Relationship Management',
                'Financial Dashboard for Business Analytics',
                'Project Management Tool with Team Collaboration',
                'Invoice and Billing Automation System',
                'Employee HR Management Portal',
                'Market Research and Survey Platform',
                'Supply Chain Visibility Dashboard',
                'Business Intelligence Reporting Tool',
                'Corporate Event Management Website'
            ],
            'education': [
                'Online Learning Platform with Video Courses',
                'Student Progress Tracking Dashboard',
                'Interactive Quiz and Assessment Web App',
                'Virtual Classroom Collaboration Tool',
                'E-Library for Educational Resources',
                'Course Enrollment and Payment Portal',
                'Teacher-Student Communication Platform',
                'Learning Analytics Dashboard for Educators',
                'Gamified Learning Web Application',
                'Parent Portal for Student Performance Monitoring'
            ],
            'environment': [
                'Carbon Footprint Tracking Web App',
                'Environmental Monitoring Dashboard',
                'Recycling Resource Finder Website',
                'Sustainable Living Tips Portal',
                'Wildlife Conservation Donation Platform',
                'Air Quality Index Visualization Tool',
                'Eco-Friendly Product Marketplace',
                'Community Clean-Up Event Organizer',
                'Renewable Energy Project Tracker',
                'Water Conservation Education Website'
            ],
            'transportation': [
                'Ride-Sharing Web Platform with Real-Time Tracking',
                'Public Transport Schedule and Ticketing Site',
                'Logistics Management Dashboard',
                'Parking Finder and Reservation Web App',
                'Traffic Monitoring and Reporting Tool',
                'Fleet Management Web System',
                'Carpool Coordination Platform',
                'Route Planner for Delivery Services',
                'Transport Emissions Calculator Website',
                'Bike-Sharing Availability Tracker'
            ]
        },
        'mobile-app': {
            'agriculture': [
                'Mobile App for Farm Record Keeping and Analytics',
                'Crop Identification App Using Camera Scan',
                'Farmer Marketplace App for Direct Sales',
                'Weather and Advisory App for Rural Farmers',
                'Livestock Management Mobile Solution',
                'Soil Testing Results Mobile Viewer',
                'Pest Control Advisory App with AR',
                'Farm Labor Management Scheduling App',
                'Agricultural Loan Application Mobile Portal',
                'Harvest Tracking and Yield Calculator App'
            ],
            'medical': [
                'Mobile Health Tracker with Symptom Logging',
                'Medication Reminder and Adherence App',
                'Doctor Appointment Booking Mobile App',
                'Fitness and Wellness Coaching Application',
                'Mental Health Support Chat App',
                'Emergency Medical Response Locator',
                'Diet and Nutrition Planning Mobile Tool',
                'Blood Donation Donor Matching App',
                'Remote Patient Monitoring Dashboard',
                'Medical Records Access Mobile Portal'
            ],
            'business': [
                'Mobile CRM for On-the-Go Sales Teams',
                'Expense Tracking and Reporting App',
                'Business Networking and Lead Generation App',
                'Inventory Management Mobile Solution',
                'Project Time Tracking and Billing App',
                'Corporate Event RSVP and Management App',
                'Market Research Survey Mobile Collector',
                'Financial Calculator and Budgeting Tool',
                'Team Collaboration Chat App for Businesses',
                'Customer Feedback Collection Mobile App'
            ],
            'education': [
                'Mobile Learning App with Offline Content',
                'Flashcard Study App for Exam Prep',
                'Language Learning App with Speech Recognition',
                'Math Problem Solver with AR',
                'Virtual Study Group Collaboration App',
                'Course Progress Tracker Mobile Tool',
                'Educational Game App for Kids',
                'Parent-Teacher Communication App',
                'Scholarship Finder Mobile Portal',
                'Interactive Science Experiment Simulator'
            ],
            'environment': [
                'Mobile App for Carbon Footprint Tracking',
                'Wildlife Sighting Reporting App',
                'Recycling Guide with Barcode Scanner',
                'Eco-Challenge App for Sustainable Habits',
                'Air Quality Monitoring Mobile Tool',
                'Tree Planting Event Organizer App',
                'Water Usage Tracker for Households',
                'Environmental News and Alerts App',
                'Renewable Energy Project Finder',
                'Mobile App for Community Clean-Up Coordination'
            ],
            'transportation': [
                'Real-Time Public Transport Tracking App',
                'Ride-Sharing Mobile App with Payment Integration',
                'Parking Finder Mobile Application',
                'Traffic Alert and Navigation App',
                'Fleet Maintenance Mobile Tracker',
                'Carpool Organizer App for Commuters',
                'Bike-Sharing Mobile Booking Tool',
                'Logistics Delivery Tracking App',
                'Transport Emissions Calculator Mobile',
                'EV Charging Station Finder App'
            ]
        },
        'deep-learning': {
            'agriculture': [
                'Deep Learning Model for Crop Yield Prediction',
                'Advanced Image Segmentation for Weed Detection',
                'Neural Network for Disease Spread Modeling in Crops',
                'GAN-Based Synthetic Data Generation for Farming',
                'RNN for Time-Series Weather Impact Analysis',
                'CNN for Satellite Image Crop Health Monitoring',
                'Autoencoder for Anomaly Detection in Farm Sensors',
                'Transformer Model for Multilingual Farming Advice',
                'Deep Reinforcement Learning for Optimal Planting',
                'Style Transfer for Visualizing Farm Scenarios'
            ],
            'medical': [
                'Deep Learning for MRI Image Tumor Segmentation',
                'GAN for Synthetic Medical Image Generation',
                'RNN for ECG Signal Anomaly Detection',
                'CNN for Retinal Disease Diagnosis from Scans',
                'Transformer for Electronic Health Record Analysis',
                'Autoencoder for Fraudulent Claim Detection',
                'Deep RL for Personalized Treatment Planning',
                'Style Transfer for Medical Visualization',
                'LSTM for Patient Vital Signs Prediction',
                'Vision Transformer for X-Ray Analysis'
            ],
            'business': [
                'Deep Learning for Stock Price Forecasting',
                'GAN for Synthetic Financial Data Creation',
                'CNN for Document Classification in Business',
                'RNN for Sales Time Series Prediction',
                'Transformer for Market Sentiment Analysis',
                'Autoencoder for Credit Card Fraud Detection',
                'Deep RL for Portfolio Optimization',
                'Style Transfer for Business Report Visualization',
                'LSTM for Customer Behavior Prediction',
                'Vision Models for Receipt OCR in Accounting'
            ],
            'education': [
                'Deep Learning for Adaptive Learning Systems',
                'GAN for Generating Practice Questions',
                'RNN for Student Engagement Analysis',
                'CNN for Handwritten Answer Recognition',
                'Transformer for Automated Essay Scoring',
                'Autoencoder for Detecting Cheating Patterns',
                'Deep RL for Personalized Course Recommendations',
                'Style Transfer for Educational Content Visualization',
                'LSTM for Student Performance Prediction',
                'Vision Models for Textbook Image Analysis'
            ],
            'environment': [
                'Deep Learning for Climate Pattern Prediction',
                'GAN for Synthetic Environmental Data',
                'CNN for Deforestation Image Analysis',
                'RNN for Pollution Trend Forecasting',
                'Transformer for Wildlife Behavior Analysis',
                'Autoencoder for Environmental Anomaly Detection',
                'Deep RL for Energy Grid Optimization',
                'Style Transfer for Eco-Impact Visualization',
                'LSTM for Water Resource Prediction',
                'Vision Models for Waste Sorting Automation'
            ],
            'transportation': [
                'Deep Learning for Traffic Flow Optimization',
                'GAN for Synthetic Traffic Scenarios',
                'CNN for Vehicle Damage Assessment',
                'RNN for Transport Demand Forecasting',
                'Transformer for Route Planning Analysis',
                'Autoencoder for Traffic Anomaly Detection',
                'Deep RL for Autonomous Driving Systems',
                'Style Transfer for Traffic Visualization',
                'LSTM for Fleet Maintenance Prediction',
                'Vision Models for License Plate Recognition'
            ]
        },
        'blockchain': {
            'agriculture': [
                'Blockchain for Traceable Organic Produce Supply Chain',
                'Smart Contracts for Farm-to-Table Transactions',
                'Decentralized Land Registry for Agricultural Properties',
                'Tokenized Carbon Credits for Sustainable Farming',
                'Blockchain-Based Crop Insurance Claims',
                'Peer-to-Peer Seed and Equipment Trading Platform',
                'Immutable Records for Livestock Pedigree',
                'Decentralized Cooperative Farming Governance',
                'Supply Chain Finance Using Blockchain Tokens',
                'Transparent Subsidy Distribution System'
            ],
            'medical': [
                'Blockchain for Secure Patient Data Sharing',
                'Smart Contracts for Automated Insurance Payouts',
                'Decentralized Clinical Trial Data Management',
                'Tokenized Health Records Ownership',
                'Immutable Drug Supply Chain Tracking',
                'Blockchain for Telemedicine Payment Security',
                'Secure Credentialing for Medical Professionals',
                'Decentralized Health Research Data Marketplace',
                'Patient Consent Management on Blockchain',
                'Pharma Counterfeit Detection System'
            ],
            'business': [
                'Blockchain for Secure Supply Chain Finance',
                'Smart Contracts for Automated Vendor Payments',
                'Decentralized Corporate Voting System',
                'Tokenized Equity and Asset Management',
                'Immutable Audit Trails for Compliance',
                'Peer-to-Peer Business Lending Platform',
                'Blockchain-Based Loyalty Reward Systems',
                'Secure Cross-Border Trade Settlements',
                'Decentralized Identity for Business Verification',
                'Smart Contract Escrow for B2B Transactions'
            ],
            'education': [
                'Blockchain for Secure Credential Verification',
                'Smart Contracts for Scholarship Disbursement',
                'Decentralized Student Record Management',
                'Tokenized Course Completion Certificates',
                'Immutable Academic Research Publication',
                'Blockchain-Based Peer Review System',
                'Secure Exam Result Storage and Sharing',
                'Decentralized Learning Platform Governance',
                'Tokenized Funding for Educational Projects',
                'Blockchain for Student Loan Management'
            ],
            'environment': [
                'Blockchain for Carbon Credit Trading',
                'Smart Contracts for Renewable Energy Trading',
                'Immutable Environmental Impact Records',
                'Tokenized Waste Recycling Incentives',
                'Decentralized Conservation Funding Platform',
                'Blockchain for Transparent Green Certifications',
                'Supply Chain Tracking for Sustainable Products',
                'Peer-to-Peer Energy Sharing System',
                'Blockchain for Wildlife Protection Funding',
                'Decentralized Eco-Project Crowdfunding'
            ],
            'transportation': [
                'Blockchain for Secure Logistics Tracking',
                'Smart Contracts for Freight Payment Automation',
                'Decentralized Vehicle Ownership Records',
                'Tokenized Ride-Sharing Reward System',
                'Immutable Fleet Maintenance Logs',
                'Blockchain for Transparent Toll Collection',
                'Supply Chain Logistics on Blockchain',
                'Decentralized Car Rental Platform',
                'Blockchain for Public Transport Ticketing',
                'Secure Cargo Tracking System'
            ]
        },
        'iot': {
            'agriculture': [
                'IoT Sensor Network for Precision Irrigation',
                'Smart Greenhouse Monitoring and Control System',
                'Drone-Based IoT for Crop Health Surveillance',
                'Livestock Tracking with IoT Wearables',
                'Soil Moisture and Nutrient IoT Monitoring',
                'Automated Farm Gate Access Control',
                'Weather Station IoT for Local Forecasting',
                'IoT-Enabled Harvest Yield Prediction',
                'Remote Barn Climate Control System',
                'Pest Trap IoT Alert System'
            ],
            'medical': [
                'IoT Wearables for Continuous Patient Monitoring',
                'Smart Pill Dispenser with Adherence Tracking',
                'Hospital Room IoT for Environmental Control',
                'Remote Vital Signs Monitoring Device',
                'IoT-Enabled Infusion Pump Management',
                'Asset Tracking for Medical Equipment',
                'Fall Detection IoT for Elderly Care',
                'Temperature-Controlled Drug Storage IoT',
                'Bedside Patient Call System with IoT',
                'IoT for Hospital Hygiene Monitoring'
            ],
            'business': [
                'IoT for Inventory and Stock Level Monitoring',
                'Smart Office Lighting and Energy Management',
                'Asset Tracking IoT for Fleet Vehicles',
                'Employee Attendance IoT System',
                'Conference Room Booking with IoT Sensors',
                'Retail Shelf Stock Monitoring IoT',
                'IoT-Enabled Smart Vending Machines',
                'Building Security Access Control IoT',
                'Energy Consumption Analytics for Offices',
                'Customer Footfall Tracking IoT System'
            ],
            'education': [
                'IoT for Smart Classroom Attendance Tracking',
                'Environmental Monitoring for School Facilities',
                'IoT-Enabled Interactive Learning Boards',
                'Asset Tracking for Educational Equipment',
                'Smart Lighting for Study Rooms',
                'IoT for Campus Security Monitoring',
                'Temperature Control for School Labs',
                'IoT-Based Library Book Tracking',
                'Smart Lockers for Student Storage',
                'IoT for School Bus Tracking'
            ],
            'environment': [
                'IoT for Air Quality Monitoring Networks',
                'Smart Waste Bins with Fill-Level Sensors',
                'Water Quality Monitoring IoT System',
                'Wildlife Tracking with IoT Devices',
                'IoT for Renewable Energy Grid Monitoring',
                'Environmental Sensor Network for Forests',
                'Smart Irrigation for Urban Green Spaces',
                'IoT for Noise Pollution Monitoring',
                'Flood Detection and Alert IoT System',
                'IoT for Sustainable Energy Consumption'
            ],
            'transportation': [
                'IoT for Real-Time Traffic Monitoring',
                'Smart Parking IoT System with Sensors',
                'Fleet Vehicle Maintenance IoT Tracker',
                'IoT for Public Transport Passenger Counting',
                'Smart Traffic Lights with IoT Control',
                'EV Charging Station Monitoring IoT',
                'IoT for Logistics Temperature Control',
                'Bicycle Sharing IoT Tracking System',
                'IoT for Road Condition Monitoring',
                'Smart Toll Collection IoT System'
            ]
        }
    };

    generateBtn.addEventListener('click', () => {
        const selectedTech = techSelect.value;
        const selectedSector = sectorSelect.value;
        
        if (!selectedTech || !selectedSector) {
            alert('Please select both technology and sector!');
            return;
        }

        // Hide previous results
        results.classList.add('hidden');
        carouselTrack.innerHTML = '';
        dotsContainer.innerHTML = '';
        currentIndex = 0;

        // Show AI generation mock
        aiGeneration.classList.remove('hidden');
        document.getElementById('ai-tech').textContent = selectedTech.replace('-', ' ').toUpperCase();
        document.getElementById('ai-sector').textContent = selectedSector.charAt(0).toUpperCase() + selectedSector.slice(1);
        
        // Simulate AI thinking for 2 seconds
        setTimeout(() => {
            aiGeneration.classList.add('hidden');
            loading.classList.remove('hidden');
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI Generating...';

            // Simulate loading for 3 seconds
            setTimeout(() => {
                loading.classList.add('hidden');
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-brain"></i> Generate AI Ideas';

                // Get filtered ideas
                const ideas = projectIdeas[selectedTech]?.[selectedSector] || [];
                if (ideas.length > 0) {
                    totalCards = ideas.length;
                    ideas.forEach((idea, index) => {
                        const card = document.createElement('div');
                        card.className = `idea-card ${selectedTech}`;
                        const whatsappMessage = encodeURIComponent(`I want to order a project: ${idea} (${selectedTech.toUpperCase()}, ${selectedSector.charAt(0).toUpperCase() + selectedSector.slice(1)})`);
                        card.innerHTML = `
                            <h4>${index + 1}. ${idea}</h4>
                            <p>AI Suggestion: This project leverages ${selectedTech.toUpperCase()} to address challenges in the ${selectedSector} sector.</p>
                            <a href="https://wa.me/919819833605?text=${whatsappMessage}" class="book-now-btn" target="_blank">
                                <i class="fab fa-whatsapp"></i> Book Now
                            </a>
                        `;
                        carouselTrack.appendChild(card);
                    });

                    // Create dots
                    const slidesCount = Math.ceil(totalCards / 3);
                    for (let i = 0; i < slidesCount; i++) {
                        const dot = document.createElement('span');
                        dot.className = 'dot-indicator';
                        dot.addEventListener('click', () => goToSlide(i));
                        dotsContainer.appendChild(dot);
                    }
                    updateCarousel();
                    results.classList.remove('hidden');
                } else {
                    carouselTrack.innerHTML = '<p class="no-ideas">AI could not generate ideas for this combination. Try different selections!</p>';
                    results.classList.remove('hidden');
                }
            }, 3000);
        }, 2000);
    });

    // Carousel functionality
    function updateCarousel() {
        const cardWidth = carouselTrack.children[0]?.offsetWidth || 0;
        const gap = 16; // 1rem gap
        const visibleCards = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
        const slideWidth = (cardWidth + gap) * visibleCards - gap;
        carouselTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        // Update dots
        document.querySelectorAll('.dot-indicator').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });

        // Update buttons
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === Math.ceil(totalCards / (window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1)) - 1;
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        const visibleCards = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
        if (currentIndex < Math.ceil(totalCards / visibleCards) - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Update carousel on window resize
    window.addEventListener('resize', updateCarousel);

    // Enable button only when both selections are made
    function checkSelections() {
        generateBtn.disabled = !techSelect.value || !sectorSelect.value;
    }

    techSelect.addEventListener('change', checkSelections);
    sectorSelect.addEventListener('change', checkSelections);

    // Initial state
    checkSelections();
});