import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600" style={{ textShadow: '0 2px 10px rgba(236, 72, 153, 0.3)' }}>
        AI Estetik Dönüşüm Stüdyosu
      </h1>
      <p className="mt-2 text-lg text-gray-300">
        Yapay Zeka ile Yaratıcılığınızı Serbest Bırakın
      </p>
    </header>
  );
};

export default Header;