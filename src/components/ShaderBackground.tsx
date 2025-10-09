import { useEffect, useRef } from 'react';

export const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      time += 0.004;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(0.5, '#0a0000');
      gradient.addColorStop(1, '#000000');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated waves
      const waveCount = 3;
      const colors = ['rgba(165, 0, 0, 0.15)', 'rgba(255, 255, 255, 0.08)', 'rgba(165, 0, 0, 0.12)'];

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const offset = (w * Math.PI * 2) / waveCount;
        
        for (let x = 0; x < canvas.width; x += 2) {
          const normalizedX = x / canvas.width;
          
          // Create multiple wave frequencies
          const wave1 = Math.sin(normalizedX * 5.5 + time * 0.4 + offset) * 100;
          const wave2 = Math.sin(normalizedX * 3 + time * 0.3 + offset) * 50;
          const wave3 = Math.sin(normalizedX * 7 + time * 0.5 + offset) * 30;
          
          const y = canvas.height / 2 + wave1 + wave2 + wave3 + (w * 80);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        const waveGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        waveGradient.addColorStop(0, colors[w]);
        waveGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = waveGradient;
        ctx.fill();
      }

      // Add grain effect
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() > 0.97) {
          const grain = Math.random() * 20;
          data[i] += grain;
          data[i + 1] += grain;
          data[i + 2] += grain;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ 
        width: '100vw', 
        height: '100vh',
        background: '#000000'
      }}
    />
  );
};
