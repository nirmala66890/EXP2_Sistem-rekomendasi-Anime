import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ThumbsUp, ThumbsDown, Star, Play, BookmarkPlus } from 'lucide-react';
import { Anime } from '../../lib/api';

interface AnimeModalProps {
  anime: Anime | null;
  onClose: () => void;
}

export const AnimeModal: React.FC<AnimeModalProps> = ({ anime, onClose }) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (anime) {
      document.body.style.overflow = 'hidden';
      setFeedback(null); // Reset feedback when new anime opens
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [anime]);

  if (!anime) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050505]/90 backdrop-blur-xl"
        />

        {/* Modal Content */}
        <motion.div
          layoutId={`card-${anime.mal_id}`}
          className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md"
          >
            <X size={24} />
          </button>

          {/* Left Column - Poster */}
          <div className="w-full md:w-2/5 relative shrink-0">
            <div className="aspect-[3/4] md:h-full md:aspect-auto">
              <img 
                src={anime.images.jpg.large_image_url} 
                alt={anime.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent md:bg-gradient-to-r"></div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                <Star size={16} className="fill-yellow-400" />
                <span className="font-bold">{anime.score ? anime.score.toFixed(1) : 'N/A'}</span>
              </div>
              <div className="text-gray-400 text-sm font-medium">TV Series</div>
              <div className="text-gray-400 text-sm font-medium">24 Episodes</div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {anime.title}
            </h2>

            <div className="flex flex-wrap gap-2 mb-8">
              {anime.genres?.map((genre, i) => (
                <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-gray-300">
                  {genre.name}
                </span>
              ))}
              {anime.themes?.map((theme, i) => (
                <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-gray-300">
                  {theme.name}
                </span>
              ))}
            </div>

            <div className="mb-10">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                Synopsis
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                {anime.synopsis || "No synopsis available for this title."}
              </p>
            </div>

            {/* Interaction Buttons - Pushed to bottom */}
            <div className="mt-auto pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                <Play size={20} className="fill-black" />
                Watch Trailer
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors group" title="Add to List">
                <BookmarkPlus size={24} className="group-hover:text-purple-400 transition-colors" />
              </button>

              <div className="w-px h-10 bg-white/10 mx-2 hidden md:block"></div>

              {/* Feedback System */}
              <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                <p className="text-sm text-gray-500 font-medium mr-2">Rate it:</p>
                <button 
                  onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border rounded-xl transition-all group ${
                    feedback === 'like' 
                      ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                      : 'bg-white/5 hover:bg-green-500/10 border-white/10 hover:border-green-500/30 text-gray-400 hover:text-green-400'
                  }`}
                >
                  <ThumbsUp size={20} className={feedback === 'like' ? 'fill-current' : 'group-hover:-translate-y-1 transition-transform'} />
                  <span className="font-medium hidden sm:block">Like</span>
                </button>
                <button 
                  onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border rounded-xl transition-all group ${
                    feedback === 'dislike' 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                      : 'bg-white/5 hover:bg-red-500/10 border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400'
                  }`}
                >
                  <ThumbsDown size={20} className={feedback === 'dislike' ? 'fill-current' : 'group-hover:translate-y-1 transition-transform'} />
                  <span className="font-medium hidden sm:block">Dislike</span>
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
