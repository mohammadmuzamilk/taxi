import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MapBackground = () => {
  const [cars, setCars] = useState([]);
  
  useEffect(() => {
    const initialCars = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 10 + Math.random() * 20
    }));
    setCars(initialCars);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950"></div>
      
      {/* Abstract Grid Lines */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#ffffff0a 1px, transparent 1px), linear-gradient(90deg, #ffffff0a 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Animated Dots (Moving Cars) */}
      {cars.map((car) => (
        <motion.div
          key={car.id}
          initial={{ left: `${car.x}%`, top: `${car.y}%`, opacity: 0 }}
          animate={{ 
            left: [`${car.x}%`, `${(car.x + 20) % 100}%`],
            top: [`${car.y}%`, `${(car.y + 15) % 100}%`],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: car.duration, 
            repeat: Infinity, 
            ease: "linear",
          }}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full blur-[2px] shadow-[0_0_8px_rgba(250,204,21,0.6)]"
        />
      ))}
    </div>
  );
};

export default MapBackground;
