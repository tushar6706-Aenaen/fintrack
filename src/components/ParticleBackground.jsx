import React, { useEffect, useRef, useCallback } from 'react';

// This component creates an animated background of floating particles.
// It uses an HTML Canvas for rendering, ensuring a lightweight and performant animation.
const ParticleBackground = () => {
  // Ref to hold the canvas element
  const canvasRef = useRef(null);
  // Ref to hold the animation frame ID for cleanup
  const animationFrameId = useRef(null);

  // Particle properties
  const particles = useRef([]);
  const particleCount = 70; // Number of particles
  const minRadius = 0.5; // Minimum particle radius
  const maxRadius = 2.5; // Maximum particle radius
  const maxVelocity = 0.2; // Maximum particle velocity

  // Function to get a random number within a range
  const getRandom = (min, max) => Math.random() * (max - min) + min;

  // Particle class definition
  class Particle {
    constructor(x, y, radius, velocityX, velocityY, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.velocityX = velocityX;
      this.velocityY = velocityY;
      this.color = color;
    }

    // Draw the particle on the canvas
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    // Update particle position and handle boundary collisions
    update(ctx, canvas) {
      // Reverse velocity if particle hits canvas boundaries
      if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
        this.velocityX = -this.velocityX;
      }
      if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
        this.velocityY = -this.velocityY;
      }

      // Update position
      this.x += this.velocityX;
      this.y += this.velocityY;

      this.draw(ctx);
    }
  }

  // Initialize particles with random positions, sizes, and velocities
  const initParticles = useCallback((canvas) => {
    particles.current = []; // Clear existing particles
    const colors = [
      'rgba(173, 216, 230, 0.5)', // Light Blue
      'rgba(144, 238, 144, 0.5)', // Light Green
      'rgba(255, 255, 255, 0.5)', // White
      'rgba(255, 228, 196, 0.5)', // Bisque
      'rgba(221, 160, 221, 0.5)'  // Plum
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = getRandom(minRadius, maxRadius);
      // Ensure particles start within canvas bounds
      const x = getRandom(radius, canvas.width - radius);
      const y = getRandom(radius, canvas.height - radius);
      const velocityX = getRandom(-maxVelocity, maxVelocity);
      const velocityY = getRandom(-maxVelocity, maxVelocity);
      const color = colors[Math.floor(getRandom(0, colors.length))];
      particles.current.push(new Particle(x, y, radius, velocityX, velocityY, color));
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for next frame

    particles.current.forEach(particle => {
      particle.update(ctx, canvas);
    });

    animationFrameId.current = requestAnimationFrame(animate);
  }, []);

  // Effect to handle canvas initialization and animation start/stop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setCanvasDimensions = () => {
      // Set canvas dimensions to match the parent container
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas); // Re-initialize particles on resize
    };

    // Set initial dimensions and particles
    setCanvasDimensions();

    // Add resize listener
    window.addEventListener('resize', setCanvasDimensions);

    // Start animation
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrameId.current); // Stop animation loop
    };
  }, [initParticles, animate]); // Re-run effect if initParticles or animate changes

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0" // Position absolutely in the background
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none', // Allow clicks to pass through to elements beneath
      }}
    />
  );
};

export default ParticleBackground;
