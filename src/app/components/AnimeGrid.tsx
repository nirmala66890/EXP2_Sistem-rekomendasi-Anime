import React from 'react';
import { motion } from 'motion/react';
import { Anime } from '../../lib/api';
import { Star } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
  onClick: (anime: Anime) => void;
  isRecommendation?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick, isRecommendation }) => {
  return (
    <motion.div
      layoutId={`card-${anime.mal_id}`}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => onClick(anime)}
      className="group relative cursor-pointer flex flex-col h-full bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all duration-300"
      style={{
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Glow Effect Behind */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/0 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none"></div>

      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden z-10 bg-[#111]">
        {isRecommendation && (
          <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
            Recommended
          </div>
        )}
        <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-bold">{anime.score ? anime.score.toFixed(1) : 'N/A'}</span>
        </div>
        <img 
          src={anime.images.jpg.large_image_url} 
          alt={anime.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 p-5 flex-1 flex flex-col justify-end">
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-purple-300 transition-colors">
          {anime.title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-auto">
          {anime.genres?.slice(0, 2).map((genre, i) => (
            <span 
              key={i} 
              className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] uppercase tracking-wider text-gray-400 font-medium"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface AnimeGridProps {
  title: string;
  items: Anime[];
  onItemClick: (anime: Anime) => void;
  isRecommendationSection?: boolean;
}

export const AnimeGrid: React.FC<AnimeGridProps> = ({ title, items, onItemClick, isRecommendationSection }) => {
  if (items.length === 0) return null;

  return (
   <section className="w-full py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            {isRecommendationSection && <span className="text-purple-500">✨</span>}
            {title}
          </h2>
          {/* Tombol View All sudah dihapus dari sini agar UI bersih */}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
          {items.map((anime, idx) => (
            <motion.div
              key={anime.mal_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <AnimeCard 
                anime={anime} 
                onClick={onItemClick} 
                isRecommendation={isRecommendationSection}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
