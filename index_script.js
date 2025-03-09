document.addEventListener('DOMContentLoaded', function() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    
    // Toggle dark mode
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Menú responsivo
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
            // Cambiar icono basado en el estado del menú
            const icon = this.querySelector('i');
            if (navLinks.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Cerrar el menú móvil al hacer clic en un enlace
    const navLinkElements = document.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', function() {
            navLinkElements.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Cerrar el menú móvil si está abierto
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('show');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
    
    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navLinks.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for navbar height
                    behavior: 'smooth'
                });
                
                // Update active link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
        
        // Update active nav link based on scroll position
        updateActiveNavOnScroll();
        
        // Reveal animations on scroll
        revealElementsOnScroll();
    });
    
    // Scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Update active nav link based on scroll position
    function updateActiveNavOnScroll() {
        const scrollPosition = window.scrollY + 200; // Adjust offset
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Reveal animations on scroll
    function revealElementsOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
        
        // Staggered animations for lists
        const staggerContainers = document.querySelectorAll('.features-grid, .benefits-container');
        
        staggerContainers.forEach(container => {
            const items = container.querySelectorAll('.feature-card, .benefit-item');
            const containerTop = container.getBoundingClientRect().top;
            
            if (containerTop < window.innerHeight - 100) {
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('active');
                    }, 100 * index);
                });
            }
        });
    }
    
    // Add reveal class to elements
    document.querySelectorAll('.section-header, .what-is-content, .cta-content').forEach(element => {
        element.classList.add('reveal');
    });
    
    // Add stagger-item class to cards
    document.querySelectorAll('.feature-card, .benefit-item').forEach(element => {
        element.classList.add('stagger-item');
    });
    
    // Initialize reveal on page load
    setTimeout(() => {
        revealElementsOnScroll();
    }, 300);
    
    // Add floating animation to hero image
    const heroImage = document.querySelector('.hero-image img');
    if (heroImage) {
        heroImage.classList.add('float');
    }
    
    // Add pulse animation to CTA buttons
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.classList.add('pulse');
    });
    
    // Handle form submissions (if any)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Show success message or handle form submission
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.';
            form.appendChild(successMessage);
            
            // Reset form
            form.reset();
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        });
    });
    
    // Responsive image loading
    function loadResponsiveImages() {
        const windowWidth = window.innerWidth;
        const images = document.querySelectorAll('[data-src]');
        
        images.forEach(img => {
            if (windowWidth <= 768 && img.hasAttribute('data-src-mobile')) {
                img.src = img.getAttribute('data-src-mobile');
            } else {
                img.src = img.getAttribute('data-src');
            }
            
            // Remove data attributes after setting src
            img.removeAttribute('data-src');
            img.removeAttribute('data-src-mobile');
        });
    }
    
    // Load responsive images on page load and resize
    loadResponsiveImages();
    window.addEventListener('resize', loadResponsiveImages);
    
    // Initialize any tooltips
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => {
        const tooltipText = document.createElement('span');
        tooltipText.className = 'tooltip-text';
        tooltipText.textContent = tooltip.getAttribute('data-tooltip');
        tooltip.appendChild(tooltipText);
    });
});
