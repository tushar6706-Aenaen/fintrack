// components/FloatingParticles.jsx

import { motion } from 'framer-motion';

const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + i * 30}%`,
            top: `${60 + i * 10}%`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;