import React, { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';

interface HeartRainProps {
  intensity?: 'gentle' | 'medium' | 'shower';
  enabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  swaySpeed: number;
  swayOffset: number;
}

export const HeartRain: React.FC<HeartRainProps> = ({
  intensity = 'gentle',
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Romantic palette for delicate translucent falling hearts
  const heartColors = [
    'rgba(226, 190, 103, 0.65)', // Champagne Gold
    'rgba(247, 231, 180, 0.75)', // Light Gold
    'rgba(244, 178, 194, 0.68)', // Soft Blush Rose
    'rgba(255, 214, 224, 0.72)', // Pale Petal Pink
    'rgba(235, 150, 165, 0.60)', // Warm Rose Quartz
  ];

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Number of falling hearts based on intensity
    const count = intensity === 'gentle' ? 28 : intensity === 'medium' ? 48 : 80;

    const createParticle = (initialY?: number): Particle => {
      const size = Math.random() * 14 + 10; // 10px to 24px
      return {
        x: Math.random() * canvas.width,
        y: initialY !== undefined ? initialY : Math.random() * canvas.height,
        size,
        speedY: Math.random() * 0.9 + 0.6, // gentle fall speed
        speedX: (Math.random() - 0.5) * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.45 + 0.35,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
      };
    };

    particlesRef.current = Array.from({ length: count }, () => createParticle());

    // Helper to draw a smooth vector heart on canvas
    const drawHeart = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      opacity: number
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rotation);
      c.scale(size / 30, size / 30);
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(-15, -15, -25, 5, 0, 22);
      c.bezierCurveTo(25, 5, 15, -15, 0, 0);
      c.closePath();
      c.fillStyle = color;
      c.shadowColor = 'rgba(212, 175, 55, 0.3)';
      c.shadowBlur = 6;
      c.globalAlpha = opacity;
      c.fill();
      c.restore();
    };

    let tick = 0;
    const animate = () => {
      tick += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        // Move downward with gentle sway
        p.y += p.speedY;
        p.x += Math.sin(tick * p.swaySpeed + p.swayOffset) * 0.7 + p.speedX;
        p.rotation += p.rotationSpeed;

        // Reset to top when out of screen
        if (p.y > canvas.height + 30) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.speedY = Math.random() * 0.9 + 0.6;
        }

        drawHeart(ctx, p.x, p.y, p.size, p.rotation, p.color, p.opacity);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [enabled, intensity]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
      aria-hidden="true"
    />
  );
};
