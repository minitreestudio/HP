document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // Page is loaded immediately
    body.classList.add('loaded');
    setTimeout(checkSections, 50); // A small delay to ensure layout is stable

    // --- Interactive Constellation Background ---
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const mouse = {
        x: null,
        y: null,
        radius: 200 // Increased area of influence
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createParticles(); // Recreate particles on resize
    });

    let particles = [];
    const particleCount = 120; // Increased particle count

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseX = this.x;
            this.baseY = this.y;
            this.vx = (Math.random() - 0.5) * 0.2;
            this.vy = (Math.random() - 0.5) * 0.2;
            this.density = (Math.random() * 5) + 2; // Increased density for stronger push
            this.radius = Math.random() * 2.5 + 2; // Increased particle size
        }

        update() {
            // Repel from mouse
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= forceDirectionX * force * this.density * 0.5;
                this.y -= forceDirectionY * force * this.density * 0.5;
            } else {
                // Return to base position
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 20;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 20;
                }
            }

            // Wall collision
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            
            this.x += this.vx;
            this.y += this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#007bff';
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
                               ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

                if (distance < 25000) { // Adjusted distance threshold for connecting lines
                    opacityValue = 1 - (distance / 25000);
                    ctx.strokeStyle = `rgba(0, 123, 255, ${opacityValue})`;
                    ctx.lineWidth = 1.2; // Increased line width
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connect();
        requestAnimationFrame(animate);
    }

    createParticles();
    animate();

    // --- Scroll Reveal Animation ---
    const sections = document.querySelectorAll('.service-card, .process-step, .content-section h2, .about-text, #contact p, #contact .cta-button');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    function checkSections() {
        sections.forEach(section => {
            observer.observe(section);
        });
    }
});