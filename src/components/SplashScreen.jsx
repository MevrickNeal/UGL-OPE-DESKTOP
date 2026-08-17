import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white overflow-hidden">
      {/* Animated subtle background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-200/30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-100/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="z-10 flex flex-col items-center animate-fade-in-up">
        {/* Logo */}
        <div className="w-32 h-32 mb-8 bg-white rounded-2xl shadow-xl p-2 flex items-center justify-center animate-scale-in">
          <img src="/logo-square.png" alt="Urban Gaz Logo" className="w-full h-full object-contain" />
        </div>

        {/* Text */}
        <h1 className="text-3xl md:text-4xl font-outfit font-bold text-gray-800 tracking-wider mb-2">
          URBAN GAZ LIMITED
        </h1>
        <h2 className="text-sm md:text-base font-outfit font-semibold text-orange-500 tracking-[0.3em] uppercase">
          Commissioning & Testing Platform
        </h2>

        {/* Loading Bar */}
        <div className="mt-16 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-75 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-4 text-xs text-gray-400 font-medium tracking-widest uppercase">
          Initializing System {progress}%
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
