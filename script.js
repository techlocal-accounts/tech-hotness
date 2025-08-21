// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Gallery Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const galleryItems = document.querySelectorAll('.gallery-item');
const closeBtn = document.querySelector('.close');

galleryItems.forEach(item => {
    item.addEventListener('click', function() {
        const img = this.querySelector('img');
        lightbox.classList.add('active');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
    });
});

closeBtn.addEventListener('click', function() {
    lightbox.classList.remove('active');
});

lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
    }
});

// Escape key to close lightbox
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
    }
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };
    
    // Here you would typically send the form data to a server
    // For demonstration, we'll just log it and show a success message
    console.log('Form submitted:', formData);
    
    // Show success message
    const button = this.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Message Sent!';
    button.style.background = '#25d366';
    
    // Reset form
    this.reset();
    
    // Reset button after 3 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 3000);
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Observe gallery items with stagger effect
document.querySelectorAll('.gallery-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(item);
});

// Parallax effect for hero section
let ticking = false;
function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroBg = document.querySelector('.hero-bg');
    
    if (heroContent && heroBg) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroBg.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
    
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Add hover effect to CTA buttons
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Mobile menu functionality (if needed in future)
function isMobile() {
    return window.innerWidth <= 768;
}

// Adjust animations for mobile
if (isMobile()) {
    document.querySelectorAll('.feature-card, .gallery-item').forEach(item => {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
}

// Analytics tracking (placeholder)
function trackEvent(category, action, label) {
    // Implement analytics tracking here
    console.log('Event tracked:', { category, action, label });
}

// Track CTA clicks
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', function() {
        const label = this.textContent.trim();
        trackEvent('CTA', 'click', label);
    });
});

// Arrow Vector Field Animation
class VectorField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.arrows = [];
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.gridSize = 30;
        this.arrowSize = 8;
        
        this.init();
        this.animate();
        
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('resize', this.handleResize);
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.arrows = [];
        const cols = Math.ceil(this.canvas.width / this.gridSize);
        const rows = Math.ceil(this.canvas.height / this.gridSize);
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.arrows.push({
                    x: i * this.gridSize + this.gridSize / 2,
                    y: j * this.gridSize + this.gridSize / 2,
                    angle: 0,
                    targetAngle: 0,
                    opacity: 0.15
                });
            }
        }
    }
    
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }
    
    handleResize() {
        this.init();
    }
    
    update() {
        this.arrows.forEach(arrow => {
            const dx = this.mouse.x - arrow.x;
            const dy = this.mouse.y - arrow.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                arrow.targetAngle = Math.atan2(dy, dx);
                arrow.opacity = Math.min(0.6, 0.15 + (200 - distance) / 400);
            } else {
                arrow.targetAngle = Math.random() * Math.PI * 2;
                arrow.opacity = 0.15;
            }
            
            const angleDiff = arrow.targetAngle - arrow.angle;
            arrow.angle += angleDiff * 0.1;
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.arrows.forEach(arrow => {
            this.ctx.save();
            this.ctx.translate(arrow.x, arrow.y);
            this.ctx.rotate(arrow.angle);
            
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${arrow.opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(-this.arrowSize / 2, 0);
            this.ctx.lineTo(this.arrowSize / 2, 0);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.arrowSize / 2, 0);
            this.ctx.lineTo(this.arrowSize / 2 - 3, -2);
            this.ctx.moveTo(this.arrowSize / 2, 0);
            this.ctx.lineTo(this.arrowSize / 2 - 3, 2);
            this.ctx.stroke();
            
            this.ctx.restore();
        });
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize vector field when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('vector-field');
    if (canvas) {
        new VectorField(canvas);
    }
});

// Page load animation
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
});

// Set initial body opacity for fade-in
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

// Dynamic year for copyright
const year = new Date().getFullYear();
const copyright = document.querySelector('.copyright');
if (copyright) {
    copyright.textContent = `© ${year} Tech Hotness. All rights reserved.`;
}