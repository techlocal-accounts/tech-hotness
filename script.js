class ParticleField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.trailParticles = [];
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.lastMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.gridSize = 12;
        this.particleSize = 1.5;
        this.isMobile = window.innerWidth <= 768;
        this.maxTrailParticles = this.isMobile ? 30 : 60;
        this.trailSpawnRate = this.isMobile ? 3 : 5;
        this.frameCount = 0;
        
        this.init();
        this.animate();
        
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        
        window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
        window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
        window.addEventListener('resize', this.handleResize);
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.isMobile = window.innerWidth <= 768;
        this.maxTrailParticles = this.isMobile ? 30 : 60;
        this.trailSpawnRate = this.isMobile ? 3 : 5;
        
        this.particles = [];
        this.trailParticles = [];
        const cols = Math.ceil(this.canvas.width / this.gridSize) + 2;
        const rows = Math.ceil(this.canvas.height / this.gridSize) + 2;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const offsetX = (Math.random() - 0.5) * this.gridSize * 0.3;
                const offsetY = (Math.random() - 0.5) * this.gridSize * 0.3;
                
                this.particles.push({
                    baseX: i * this.gridSize + offsetX,
                    baseY: j * this.gridSize + offsetY,
                    x: i * this.gridSize + offsetX,
                    y: j * this.gridSize + offsetY,
                    vx: 0,
                    vy: 0,
                    opacity: 0.3 + Math.random() * 0.2
                });
            }
        }
    }
    
    handleMouseMove(e) {
        this.lastMouse.x = this.mouse.x;
        this.lastMouse.y = this.mouse.y;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.spawnTrailParticles();
    }
    
    handleTouchMove(e) {
        if (e.touches.length > 0) {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y;
            this.mouse.x = e.touches[0].clientX;
            this.mouse.y = e.touches[0].clientY;
            if (!this.isMobile || this.frameCount % 2 === 0) {
                this.spawnTrailParticles();
            }
        }
    }
    
    spawnTrailParticles() {
        const dx = this.mouse.x - this.lastMouse.x;
        const dy = this.mouse.y - this.lastMouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) return;
        
        const particlesToSpawn = Math.min(this.trailSpawnRate, Math.floor(distance / 5));
        
        for (let i = 0; i < particlesToSpawn; i++) {
            if (this.trailParticles.length >= this.maxTrailParticles) {
                this.trailParticles.shift();
            }
            
            const progress = i / particlesToSpawn;
            const x = this.lastMouse.x + dx * progress;
            const y = this.lastMouse.y + dy * progress;
            
            this.trailParticles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 0.5 + Math.random() * 1.5,
                opacity: 0.6 + Math.random() * 0.4,
                life: 1.0,
                decay: this.isMobile ? 0.015 : 0.008
            });
        }
    }
    
    handleResize() {
        this.init();
    }
    
    update() {
        this.frameCount++;
        
        this.particles.forEach(particle => {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const maxDistance = 150;
            const force = Math.max(0, (maxDistance - distance) / maxDistance);
            
            if (distance < maxDistance && distance > 0) {
                const angle = Math.atan2(dy, dx);
                const pushForce = force * 8;
                
                particle.vx += Math.cos(angle) * pushForce * 0.02;
                particle.vy += Math.sin(angle) * pushForce * 0.02;
            }
            
            particle.vx += (particle.baseX - particle.x) * 0.02;
            particle.vy += (particle.baseY - particle.y) * 0.02;
            
            particle.vx *= 0.92;
            particle.vy *= 0.92;
            
            particle.x += particle.vx;
            particle.y += particle.vy;
        });
        
        this.trailParticles = this.trailParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life -= particle.decay;
            particle.opacity = particle.life * (0.6 + Math.random() * 0.1);
            
            return particle.life > 0;
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        
        this.particles.forEach(particle => {
            const dx = particle.x - particle.baseX;
            const dy = particle.y - particle.baseY;
            const displacement = Math.sqrt(dx * dx + dy * dy);
            const maxDisplacement = 30;
            const normalizedDisplacement = Math.min(displacement / maxDisplacement, 1);
            
            const opacity = particle.opacity * (1 - normalizedDisplacement * 0.5);
            
            this.ctx.globalAlpha = opacity;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, this.particleSize, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.trailParticles.forEach(particle => {
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('particles');
    if (canvas) {
        new ParticleField(canvas);
    }
    
    document.body.style.opacity = '1';
});

document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';