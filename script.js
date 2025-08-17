// JavaScript remains mostly unchanged, but added subtle enhancements for animations if needed.
// Assuming the existing JS handles animate-on-scroll via IntersectionObserver, which is professional and efficient.
// No major overhauls needed here unless specified.
document.addEventListener("DOMContentLoaded", () => {
    // Loader (unchanged)
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 1500);
        });
    }

    // Mobile Menu (unchanged)
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

    // Header Scroll Effect (unchanged)
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

    // Scroll Animations (enhanced threshold for better mobile experience)
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    if (animateOnScrollElements.length > 0 && 'IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15  // Slightly increased for smoother trigger
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);  // Unobserve after animation to optimize performance
                }
            });
        }, observerOptions);

        animateOnScrollElements.forEach(element => observer.observe(element));
    }

    // Portfolio Filter (unchanged, assuming it's not part of about section)
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
});