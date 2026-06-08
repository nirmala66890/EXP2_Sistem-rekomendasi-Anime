// ==============================================================================
// FULL CODE FINAL: SRC/LIB/API.TS - EXPERIMENT 2 PRODUCTION (HUGGING FACE LIVE)
// ==============================================================================

export const BASE_URL = 'https://api.jikan.moe/v4';

// SUDAH DIALIKAN: Menembak langsung ke server Hugging Face Space Experiment 2 kamu yang baru
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

// Helper fungsi delay untuk mencegah Jikan API Rate Limit 429 (Maksimal 3 request per detik)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * HELPER: Mengambil detail satu anime secara cerdas dari Jikan.
 * Mengutamakan mal_id jika ada, atau menggunakan query title sebagai fallback.
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
 * HELPER: Memproses pengayaan data gambar dari Jikan menggunakan sistem Batch (Paralel)
 * Jauh lebih cepat daripada loop satu per satu (sekuensial).
 */
async function enrichAnimeDataBatch(recommendations: any[]): Promise<Anime[]> {
  const finalEnrichedAnimeList: Anime[] = [];
  const BATCH_SIZE = 3; // Mengambil 3 gambar anime sekaligus per gelombang agar tidak diblokir Jikan

  for (let i = 0; i < recommendations.length; i += BATCH_SIZE) {
    const batch = recommendations.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (item) => {
      try {
        const matchedAnime = await fetchJikanDetail(item);
        
        // Memparsing struktur data genres & themes dari backend
        let parsedGenres: { name: string }[] = [];
        if (item.genres) {
          parsedGenres = Array.isArray(item.genres) 
            ? item.genres.map((g: any) => ({ name: typeof g === 'string' ? g : (g.name || '') }))
            : JSON.parse(item.genres.replace(/'/g, '"')).map((g: any) => ({ name: g }));
        } else {
          parsedGenres = matchedAnime.genres || [];
        }

        let parsedThemes: { name: string }[] = [];
        if (item.themes) {
          parsedThemes = Array.isArray(item.themes)
            ? item.themes.map((t: any) => ({ name: typeof t === 'string' ? t : (t.name || '') }))
            : JSON.parse(item.themes.replace(/'/g, '"')).map((t: any) => ({ name: t }));
        } else {
          parsedThemes = matchedAnime.themes || [];
        }

        return {
          mal_id: item.mal_id || matchedAnime.mal_id,
          title: item.title,
          score: matchedAnime.score || item.score || 0,
          synopsis: matchedAnime.synopsis || "No synopsis available.",
          images: matchedAnime.images || item.images,
          genres: parsedGenres,
          themes: parsedThemes,
          cf_norm: item.cf_norm,
          cbf_norm: item.cbf_norm,
          hybrid_score: item.hybrid_score,
          recommendation_source: "Hybrid Model (Exp 2)"
        } as Anime;
      } catch (e) {
        console.warn(`Fallback digunakan untuk anime: ${item.title}`, e);
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
          genres: [],
          themes: [],
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
      await delay(1000); // Jeda aman 1 detik antar-batch
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

/**
 * SKENARIO 1: Ambil Rekomendasi berdasarkan Judul (Menembak /recommend di HF Space)
 * Mengembalikan list rekomendasi top 20 item sesuai request kamu.
 */
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
    console.error("Error pada Skenario 1 (By Title - Exp 2 Production):", error);
    return getMockAnimeList().slice(0, 15);
  }
}

/**
 * SKENARIO 2: Ambil Rekomendasi berdasarkan Filter Katalog Multi-Tag (Menembak /catalog di HF Space)
 * Menyulap array kombinasi genre & theme pilihan user ke bentuk format query string parameter bertumpuk.
 */
export async function fetchRecommendationsByGenreTheme(genres: string[], themes: string[]): Promise<Anime[]> {
  try {
    const combinedTags = [...genres, ...themes];
    
    if (combinedTags.length === 0) {
      return [];
    }

    // Membangun format parameter array yang dikenali oleh FastAPI: ?tags=Action&tags=Shounen&top_n=20
    const queryParams = combinedTags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
    const url = `${FASTAPI_URL}/catalog?${queryParams}&top_n=20`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("Gagal mengambil data katalog biner dari cloud server BE_EXP2.");

    const resultData = await response.json();
    const recommendationsFromModel = resultData.data || [];

    return await enrichAnimeDataBatch(recommendationsFromModel);

  } catch (error) {
    console.error("Error pada Skenario 2 (Catalog Filter - Exp 2 Production):", error);
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