// ==============================================================================
// FULL CODE SINKRON: SRC/APP/HOME.TSX (MEMUTUSKAN KATALOG JIKAN & FOKUS KE MODEL)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { AnimeGrid } from './components/AnimeGrid';
import { AnimeModal } from './components/AnimeModal';

import { 
  fetchTopAnime, 
  fetchRecommendationsByTitle, 
  fetchRecommendationsByGenreTheme, 
  Anime 
} from '../lib/api';

export const Home = () => {
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [isSearchingActive, setIsSearchingActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendationTitle, setRecommendationTitle] = useState<string>("Best Anime Movies");

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const top = await fetchTopAnime();
        setTopAnime(top);
        setRecommendations(top.slice(0, 10));
      } catch (error) {
        console.error("Gagal memuat data beranda:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Skenario 1: Menangani input pencarian berdasarkan Judul
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearchingActive(false);
      setRecommendationTitle("Best Anime Movies");
      return;
    }
    
    setIsSearching(true);
    setIsSearchingActive(true);
    try {
      // Langsung mengambil data hasil pembungkusan gambar ter-update
      const modelRecommendations = await fetchRecommendationsByTitle(query);
      setRecommendations(modelRecommendations);
      setRecommendationTitle(`Recommended Based on "${query}"`);
    } catch (error) {
      console.error("Error model search:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Skenario 2: Menangani kombinasi filter Genre & Tema
  const handleGenreThemeFilter = async (genres: string[], themes: string[]) => {
    if (genres.length === 0 && themes.length === 0) {
      setIsSearchingActive(false);
      setRecommendations(topAnime.slice(0, 10));
      setRecommendationTitle("Best Anime Movies");
      return;
    }

    setIsSearching(true);
    setIsSearchingActive(true);
    try {
      const modelRecommendations = await fetchRecommendationsByGenreTheme(genres, themes);
      setRecommendations(modelRecommendations);
      setRecommendationTitle(`Top Results Matching Your Selected Filters`);
    } catch (error) {
      console.error("Error model filter:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white selection:bg-purple-500/30 font-sans">
      <Navbar />
      
      <main className="pb-24">
        <HeroSearch onSearch={handleSearch} onFilterChange={handleGenreThemeFilter} />

        {isSearching ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : isSearchingActive ? (
          /* MERENDER SATU ROW SAJA: HASIL KELUARAN DARI BACKEND FASTAPI KAMU */
          <AnimeGrid 
            title={recommendationTitle} 
            items={recommendations} 
            onItemClick={(anime) => setSelectedAnime(anime)} 
            isRecommendationSection={true}
          />
        ) : isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <AnimeGrid 
              title="Trending Now" 
              items={topAnime} 
              onItemClick={(anime) => setSelectedAnime(anime)} 
            />
            <div className="h-10"></div>
            <AnimeGrid 
              title="Best Anime Movies" 
              items={recommendations} 
              onItemClick={(anime) => setSelectedAnime(anime)} 
              isRecommendationSection={true}
            />
          </>
        )}
      </main>

      <AnimeModal anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
    </div>
  );
};