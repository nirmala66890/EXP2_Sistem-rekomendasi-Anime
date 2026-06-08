import React from 'react';
import { Menu } from 'lucide-react';
import { motion } from 'motion/react';

// Pastikan file logo UNJANI sudah ditaruh di folder assets kamu
import logoUnjani from '../../assets/logo-unjani.png';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo Kiri: Identitas Mahasiswa */}
        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          >
            <span className="text-white font-bold text-sm">NIM</span>
          </motion.div>
          <span className="text-white font-bold text-xl tracking-wide hidden sm:block">
            <span className="text-purple-400">2250081074</span>
          </span>
        </div>

        {/* Center Nav - Desktop (Kosong sesuai kode awal) */}
        <div className="hidden md:flex items-center gap-8">
          {/* Tempat menu navigasi jika diperlukan nanti */}
        </div>

        {/* Right Actions: Logo UNJANI Instansi Kampus */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm font-medium hidden md:block">UNJANI</span>
            {/* Mengganti lingkaran kosong dengan logo instansi Universitas Jenderal Achmad Yani */}
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shadow-md">
              <img 
                src={logoUnjani} 
                alt="Logo UNJANI" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback jika path image salah, akan menampilkan inisial teks agar UI tidak pecah
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          
          <button className="md:hidden text-white hover:text-purple-400 transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};