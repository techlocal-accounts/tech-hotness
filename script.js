// Vector Field Animation
class VectorField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.flowField = [];
        this.cols = 0;
        this.rows = 0;
        this.scale = 20;
        this.zoff = 0;
        this.animationId = null;
        
        this.init();
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.init());
    }
    
    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Calculate grid
        this.cols = Math.floor(this.canvas.width / this.scale) + 1;
        this.rows = Math.floor(this.canvas.height / this.scale) + 1;
        
        // Create particles
        this.particles = [];
        const particleCount = Math.min(800, Math.floor((this.canvas.width * this.canvas.height) / 5000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
    }
    
    updateFlowField() {
        let yoff = 0;
        this.flowField = [];
        
        for (let y = 0; y < this.rows; y++) {
            let xoff = 0;
            for (let x = 0; x < this.cols; x++) {
                const angle = noise(xoff, yoff, this.zoff) * Math.PI * 2 * 2;
                const vector = { x: Math.cos(angle), y: Math.sin(angle) };
                this.flowField.push(vector);
                xoff += 0.1;
            }
            yoff += 0.1;
        }
        
        this.zoff += 0.005;
    }
    
    animate() {
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update flow field
        this.updateFlowField();
        
        // Update and draw particles
        this.particles.forEach(particle => {
            const x = Math.floor(particle.pos.x / this.scale);
            const y = Math.floor(particle.pos.y / this.scale);
            const index = x + y * this.cols;
            
            if (this.flowField[index]) {
                particle.applyForce(this.flowField[index]);
            }
            
            particle.update();
            particle.edges(this.canvas.width, this.canvas.height);
            particle.show(this.ctx);
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

class Particle {
    constructor(width, height) {
        this.pos = {
            x: Math.random() * width,
            y: Math.random() * height
        };
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.maxSpeed = 2;
        this.prevPos = { ...this.pos };
    }
    
    applyForce(force) {
        this.acc.x += force.x * 0.5;
        this.acc.y += force.y * 0.5;
    }
    
    update() {
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        
        // Limit velocity
        const mag = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        if (mag > this.maxSpeed) {
            this.vel.x = (this.vel.x / mag) * this.maxSpeed;
            this.vel.y = (this.vel.y / mag) * this.maxSpeed;
        }
        
        this.prevPos = { ...this.pos };
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.acc = { x: 0, y: 0 };
    }
    
    edges(width, height) {
        if (this.pos.x > width) {
            this.pos.x = 0;
            this.prevPos.x = 0;
        }
        if (this.pos.x < 0) {
            this.pos.x = width;
            this.prevPos.x = width;
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
            this.prevPos.y = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
            this.prevPos.y = height;
        }
    }
    
    show(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.prevPos.x, this.prevPos.y);
        ctx.lineTo(this.pos.x, this.pos.y);
        ctx.stroke();
    }
}

// Simplified Perlin noise function
function noise(x, y, z) {
    // Simple pseudo-random noise function
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    
    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;
    
    return lerp(w, 
        lerp(v, 
            lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
            lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
        ),
        lerp(v,
            lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
            lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))
        )
    );
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t, a, b) {
    return a + t * (b - a);
}

function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// Permutation table for noise
const p = new Array(512);
const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

for (let i = 0; i < 256; i++) {
    p[256 + i] = p[i] = permutation[i];
}

// Initialize vector field when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('vector-field');
    if (canvas) {
        new VectorField(canvas);
    }
    
    // Page load animation
    document.body.style.opacity = '1';
});

// Set initial body opacity for fade-in
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

// Performance monitoring
let lastTime = performance.now();
let frames = 0;

function checkPerformance() {
    frames++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        
        // Reduce particle count if FPS is too low
        if (fps < 30 && window.vectorField) {
            console.log('Performance optimization: Reducing particle count');
            window.vectorField.particles = window.vectorField.particles.slice(0, Math.floor(window.vectorField.particles.length * 0.8));
        }
        
        frames = 0;
        lastTime = currentTime;
    }
    
    requestAnimationFrame(checkPerformance);
}

// Start performance monitoring
checkPerformance();