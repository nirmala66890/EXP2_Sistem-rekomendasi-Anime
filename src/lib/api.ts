// ==============================================================================
// FULL CODE FINAL FIX PARSING: SRC/LIB/API.TS - EXPERIMENT 2 PRODUCTION
// ==============================================================================

export const BASE_URL = 'https://api.jikan.moe/v4';

// Endpoint murni Hugging Face Space Experiment 2 milikmu
const FASTAPI_URL = "https://jikojeromi77-be-exp2.hf.space";

export interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  synopsis: string;
  score: number;
  genres: { name: string }[];
  themes: { name: string }[];
  
  // Properti metrik kalkulasi model biner Experiment 2
  cf_norm?: number;
  cbf_norm?: number;
  hybrid_score?: number;
  recommendation_source?: string;
}

// Helper fungsi delay untuk mencegah Jikan API Rate Limit 429
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * HELPER SANITASI: Mengubah string literal seperti "['Action', 'Supernatural']" 
 * menjadi array objek standar [{ name: 'Action' }, { name: 'Supernatural' }] secara aman.
 */
function safeParseTags(tagRaw: any): { name: string }[] {
  if (!tagRaw) return [];
  if (Array.isArray(tagRaw)) {
    return tagRaw.map((t: any) => ({ name: typeof t === 'string' ? t : (t.name || '') }));
  }
  
  try {
    // Jika bentuknya string "['Tag1', 'Tag2']", bersihkan tanda kurung siku dan kutipnya
    if (typeof tagRaw === 'string') {
      const cleaned = tagRaw.replace(/[\[\]']/g, '').split(',');
      return cleaned
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => ({ name: t }));
    }
  } catch (e) {
    console.error("Gagal melakukan sanitasi tag string:", e);
  }
  return [];
}

/**
 * HELPER: Mengambil detail satu anime secara cerdas dari Jikan.
 */
async function fetchJikanDetail(item: any): Promise<any> {
  if (item.mal_id) {
    const res = await fetch(`${BASE_URL}/anime/${item.mal_id}`);
    if (!res.ok) throw new Error(`Failed fetch Jikan ID ${item.mal_id}`);
    const json = await res.json();
    return json.data;
  } 
  
  const res = await fetch(`${BASE_URL}/anime?q=${encodeURIComponent(item.title)}&limit=1`);
  if (!res.ok) throw new Error(`Failed fetch Jikan Title ${item.title}`);
  const json = await res.json();
  if (json.data && json.data.length > 0) return json.data[0];
  
  throw new Error("Anime tidak ditemukan di Jikan");
}

/**
 * HELPER: Memproses pengayaan data gambar menggunakan sistem Batch paralel yang kebal crash parsing.
 */
async function enrichAnimeDataBatch(recommendations: any[]): Promise<Anime[]> {
  const finalEnrichedAnimeList: Anime[] = [];
  const BATCH_SIZE = 3; 

  for (let i = 0; i < recommendations.length; i += BATCH_SIZE) {
    const batch = recommendations.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (item) => {
      // Olah genre dan theme menggunakan fungsi pembersih yang aman
      const parsedGenres = safeParseTags(item.genres);
      const parsedThemes = safeParseTags(item.themes);

      try {
        const matchedAnime = await fetchJikanDetail(item);
        
        return {
          mal_id: item.mal_id || matchedAnime.mal_id,
          title: item.title,
          score: matchedAnime.score || item.score || 0,
          synopsis: matchedAnime.synopsis || "No synopsis available.",
          images: matchedAnime.images || item.images,
          genres: parsedGenres.length > 0 ? parsedGenres : (matchedAnime.genres || []),
          themes: parsedThemes.length > 0 ? parsedThemes : (matchedAnime.themes || []),
          cf_norm: item.cf_norm,
          cbf_norm: item.cbf_norm,
          hybrid_score: item.hybrid_score,
          recommendation_source: "Hybrid Model (Exp 2)"
        } as Anime;
      } catch (e) {
        console.warn(`Fallback gambar Unsplash diaktifkan untuk anime: ${item.title}`);
        return {
          mal_id: item.mal_id || Math.floor(Math.random() * 100000),
          title: item.title,
          score: item.score || 0,
          synopsis: `Recommended via Hybrid Model Experiment 2. (Skor Relevansi: ${((item.hybrid_score || 0) * 100).toFixed(1)}%)`,
          images: item.images || {
            jpg: {
              image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400",
              large_image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600"
            }
          },
          genres: parsedGenres,
          themes: parsedThemes,
          cf_norm: item.cf_norm,
          cbf_norm: item.cbf_norm,
          hybrid_score: item.hybrid_score,
          recommendation_source: "Hybrid Model (Exp 2)"
        } as Anime;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    finalEnrichedAnimeList.push(...batchResults);

    if (i + BATCH_SIZE < recommendations.length) {
      await delay(1000); // Jeda aman 1 detik dari limit 429 Jikan
    }
  }

  return finalEnrichedAnimeList;
}

export async function fetchTopAnime(): Promise<Anime[]> {
  try {
    const res = await fetch(`${BASE_URL}/top/anime?limit=15`);
    if (!res.ok) throw new Error('Failed to fetch top anime');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('API Error:', error);
    return getMockAnimeList();
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  try {
    const res = await fetch(`${BASE_URL}/anime?q=${query}&limit=12`);
    if (!res.ok) throw new Error('Failed to fetch search result');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function fetchRecommendationsByTitle(title: string): Promise<Anime[]> {
  try {
    const response = await fetch(`${FASTAPI_URL}/recommend?title=${encodeURIComponent(title)}&alpha=0.7&top_n=20`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("Gagal mengambil data dari cloud server BE_EXP2.");

    const resultData = await response.json();
    const recommendationsFromModel = resultData.data || [];

    return await enrichAnimeDataBatch(recommendationsFromModel);

  } catch (error) {
    console.error("Error pada Skenario 1 (By Title):", error);
    return getMockAnimeList().slice(0, 15);
  }
}

export async function fetchRecommendationsByGenreTheme(genres: string[], themes: string[]): Promise<Anime[]> {
  try {
    const combinedTags = [...genres, ...themes];
    if (combinedTags.length === 0) return [];

    const queryParams = combinedTags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
    const url = `${FASTAPI_URL}/catalog?${queryParams}&top_n=20`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("Gagal mengambil data katalog dari cloud server BE_EXP2.");

    const resultData = await response.json();
    const recommendationsFromModel = resultData.data || [];

    return await enrichAnimeDataBatch(recommendationsFromModel);

  } catch (error) {
    console.error("Error pada Skenario 2 (Catalog Filter):", error);
    return getMockAnimeList().slice(0, 15);
  }
}

function getMockAnimeList(): Anime[] {
  return [
    {
      mal_id: 1,
      title: "Cyberpunk: Edgerunners",
      images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/1818/126132l.jpg", large_image_url: "https://cdn.myanimelist.net/images/anime/1818/126132l.jpg" } },
      synopsis: "In a dystopia riddled with corruption, a street kid strives to become an edgerunner.",
      score: 8.6,
      genres: [{ name: "Action" }, { name: "Sci-Fi" }],
      themes: [{ name: "Cyberpunk" }]
    }
  ];
}