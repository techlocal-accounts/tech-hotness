// Vector Field Animation
class VectorField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.arrows = [];
        this.gridSize = 20; // Distance between arrows (more dense)
        this.arrowSize = 6; // Size of each arrow (smaller for density)
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseInfluence = 250; // Radius of mouse influence
        this.animationId = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    init() {
        // Check for reduced motion preference
        if (this.isReducedMotion) {
            this.canvas.style.display = 'none';
            return;
        }
        
        this.resize();
        this.createArrows();
        this.bindEvents();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createArrows() {
        this.arrows = [];
        const cols = Math.ceil(this.canvas.width / this.gridSize) + 2;
        const rows = Math.ceil(this.canvas.height / this.gridSize) + 2;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.arrows.push({
                    x: i * this.gridSize - this.gridSize,
                    y: j * this.gridSize - this.gridSize,
                    angle: Math.PI / 4, // Default angle (45 degrees)
                    targetAngle: Math.PI / 4,
                    baseAngle: Math.PI / 4
                });
            }
        }
    }
    
    bindEvents() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Touch movement for mobile
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        });
        
        // Resize handler
        window.addEventListener('resize', () => {
            this.resize();
            this.createArrows();
        });
        
        // Initialize mouse position to center
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
    }
    
    updateArrows() {
        this.arrows.forEach(arrow => {
            const dx = this.mouseX - arrow.x;
            const dy = this.mouseY - arrow.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.mouseInfluence) {
                // Calculate angle to mouse
                const angleToMouse = Math.atan2(dy, dx);
                const influence = 1 - (distance / this.mouseInfluence);
                
                // Blend between base angle and angle to mouse
                arrow.targetAngle = arrow.baseAngle + (angleToMouse - arrow.baseAngle) * influence * 0.7;
            } else {
                // Return to base angle with slight wave motion
                const time = Date.now() * 0.0005;
                const waveX = Math.sin(time + arrow.x * 0.003) * 0.1;
                const waveY = Math.cos(time + arrow.y * 0.003) * 0.1;
                arrow.targetAngle = arrow.baseAngle + waveX + waveY;
            }
            
            // Smooth angle transition
            const angleDiff = arrow.targetAngle - arrow.angle;
            arrow.angle += angleDiff * 0.1;
        });
    }
    
    drawArrow(x, y, angle) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        // Arrow shaft
        this.ctx.beginPath();
        this.ctx.moveTo(-this.arrowSize / 2, 0);
        this.ctx.lineTo(this.arrowSize / 2, 0);
        this.ctx.strokeStyle = 'rgba(136, 136, 136, 0.5)'; // Grayscale accent color
        this.ctx.lineWidth = 0.8;
        this.ctx.stroke();
        
        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(this.arrowSize / 2, 0);
        this.ctx.lineTo(this.arrowSize / 2 - 2, -1.5);
        this.ctx.moveTo(this.arrowSize / 2, 0);
        this.ctx.lineTo(this.arrowSize / 2 - 2, 1.5);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    animate() {
        if (this.isReducedMotion) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateArrows();
        
        this.arrows.forEach(arrow => {
            this.drawArrow(arrow.x, arrow.y, arrow.angle);
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize vector field when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('vector-field');
    if (canvas) {
        const vectorField = new VectorField(canvas);
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            vectorField.destroy();
        });
    }
    
    // Smooth entrance animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Focus management for accessibility
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    
    if (skipLink && mainContent) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Press 'w' to trigger WhatsApp CTA
        if (e.key === 'w' || e.key === 'W') {
            const whatsappLink = document.querySelector('.cta-button');
            if (whatsappLink) {
                whatsappLink.click();
            }
        }
    });
    
    // Performance monitoring for mobile
    if ('performance' in window && 'memory' in performance) {
        setInterval(() => {
            const memoryUsage = performance.memory.usedJSHeapSize / 1048576;
            if (memoryUsage > 50) { // If memory usage exceeds 50MB
                console.log('High memory usage detected, consider reducing animation complexity');
            }
        }, 5000);
    }
    
    // Visibility change handler for performance
    document.addEventListener('visibilitychange', () => {
        const canvas = document.getElementById('vector-field');
        if (document.hidden && canvas) {
            canvas.style.display = 'none';
        } else if (!document.hidden && canvas) {
            const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!isReducedMotion) {
                canvas.style.display = 'block';
            }
        }
    });
});