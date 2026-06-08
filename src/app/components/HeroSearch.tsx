// ==============================================================================
// FULL CODE REVISI: SRC/APP/COMPONENTS/HEROSEARCH.TSX (PERBAIKAN DROP-DOWN THEMES)
// ==============================================================================

import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (genres: string[], themes: string[]) => void;
}

const DATASET_GENRES = [
  "Action", "Fantasy", "Comedy", "Drama", "Adventure", 
  "Romance", "Sci-Fi", "Supernatural", "Mystery", "Slice of Life", 
  "Sports", "Suspense", "Ecchi", "Horror", "Award Winning"
];

const DATASET_THEMES = [
  "School", "Adult Cast", "Isekai", "Music", "Historical", 
  "Super Power", "Military", "Mecha", "Urban Fantasy", "Mythology", 
  "Harem", "Reincarnation", "Psychological", "Parody", "Magic", 
  "CGDCT", "Female Protagonist", "Gore", "Male Protagonist", "Anthropomorphic"
];

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, onFilterChange }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]);
  };

  const handleApply = () => {
    onFilterChange(selectedGenres, selectedThemes);
  };

  const handleReset = () => {
    setSelectedGenres([]);
    setSelectedThemes([]);
    onFilterChange([], []);
  };

  return (
    <div className="w-full py-20 px-6 relative z-50">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
           Sistem Rekomendasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Anime</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tugas Akhir Sistem Rekomendasi Anime Menggunakan Metode Hybrid Filtering.
          </p>
        </div>

        <form onSubmit={handleSearchClick} className="relative group z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
          <div className="relative flex items-center bg-[#111] border border-white/10 rounded-2xl p-2 shadow-2xl">
            <div className="pl-4 pr-2 text-gray-500"><Search size={24} /></div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime by title..."
              className="flex-1 bg-transparent border-none outline-none text-white text-lg px-2 h-14"
            />
            <button 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden sm:flex items-center gap-2 px-6 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5 mr-2"
            >
              <SlidersHorizontal size={18} /> Filters
            </button>
            <button type="submit" className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">
              Search
            </button>
          </div>
        </form>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 relative z-50"
            >
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Select Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {DATASET_GENRES.map(genre => (
                    <button 
                      key={genre} type="button" onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                        selectedGenres.includes(genre) ? 'bg-purple-600 text-white border-transparent' : 'bg-white/5 text-gray-400 border-white/5'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Select Themes</h3>
                {/* Penambahan pointer-events-auto dan relative z-50 agar baris tombol tema bisa merespons klik mouse */}
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 relative z-50 pointer-events-auto custom-scrollbar">
                  {DATASET_THEMES.map(theme => (
                    <button 
                      key={theme} type="button" onClick={() => toggleTheme(theme)}
                      className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                        selectedThemes.includes(theme) ? 'bg-indigo-600 text-white border-transparent' : 'bg-white/5 text-gray-400 border-white/5'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={handleReset} className="px-5 py-2.5 rounded-xl text-sm bg-white/5 text-gray-300">Reset</button>
                <button type="button" onClick={handleApply} className="px-5 py-2.5 rounded-xl text-sm bg-purple-600 text-white font-semibold">Apply Model Filters</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};