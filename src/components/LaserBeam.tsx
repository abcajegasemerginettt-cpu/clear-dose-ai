import { useEffect, useRef } from 'react';
import './LaserBeam.css';

export const LaserBeam = () => {
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const beam = beamRef.current;
    if (!beam) return;

    let animationFrame: number;
    let offset = 0;

    const animate = () => {
      offset += 0.5;
      beam.style.setProperty('--beam-offset', `${offset}px`);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="laser-beam-container">
      {/* Main vertical beam */}
      <div 
        ref={beamRef}
        className="laser-beam-vertical"
      />
      
      {/* Glow effects */}
      <div className="laser-glow laser-glow-1" />
      <div className="laser-glow laser-glow-2" />
      <div className="laser-glow laser-glow-3" />
      
      {/* Particles */}
      <div className="laser-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="laser-particle"
            style={{
              left: `${70 + Math.random() * 20}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Fog overlay */}
      <div className="laser-fog" />
    </div>
  );
};

export default LaserBeam;
