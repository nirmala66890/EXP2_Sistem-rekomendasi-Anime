// ==============================================================================
// KODE PARSING SINKRON TOTAL DENGAN MAIN.PY: SRC/LIB/API.TS 
// ==============================================================================

export const BASE_URL = 'https://api.jikan.moe/v4';

// Endpoint Hugging Face Space Experiment 2 milikmu
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
  
  cf_norm?: number;
  cbf_norm?: number;
  hybrid_score?: number;
  recommendation_source?: string;
}

/**
 * HELPER SANITASI: Mengubah string literal seperti "['Action', 'Supernatural']" 
 * menjadi array objek standar [{ name: 'Action' }] secara aman.
 */
function safeParseTags(tagRaw: any): { name: string }[] {
  if (!tagRaw) return [];
  if (Array.isArray(tagRaw)) {
    return tagRaw.map((t: any) => ({ name: typeof t === 'string' ? t : (t.name || '') }));
  }
  
  try {
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
 * HELPER UTAMA: Mengonversi format data keluaran BE Eksperimen 2 langsung ke UI React.
 */
function mapBackendToFrontendModel(recommendations: any[]): Anime[] {
  if (!Array.isArray(recommendations)) return [];
  
  return recommendations.map((item) => {
    const parsedGenres = safeParseTags(item.genres);
    const parsedThemes = safeParseTags(item.themes);
    
    // Membaca kolom 'image_url' yang disisipkan langsung oleh main.py kamu
    const directImageUrl = item.image_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400";

    return {
      mal_id: item.mal_id || Math.floor(Math.random() * 100000),
      title: item.title,
      score: item.score || 0,
      synopsis: item.synopsis || `Recommended via Hybrid Model Experiment 2.`,
      images: {
        jpg: {
          image_url: directImageUrl,
          large_image_url: directImageUrl
        }
      },
      genres: parsedGenres,
      themes: parsedThemes,
      cf_norm: item.cf_norm,
      cbf_norm: item.cbf_norm,
      hybrid_score: item.hybrid_score,
      recommendation_source: "Hybrid Model (Exp 2)"
    } as Anime;
  });
}

export async function enrichAnimeDataBatch(recommendations: any[]): Promise<Anime[]> {
  return mapBackendToFrontendModel(recommendations);
}

export async function fetchJikanDetail(item: any): Promise<any> {
  return item;
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
    const timestamp = new Date().getTime();
    
    // DISESUAIKAN: Menggunakan jalur murni '/recommend' sesuai dengan isi file main.py milikmu
    const url = `${FASTAPI_URL}/recommend?title=${encodeURIComponent(title)}&alpha=0.7&top_n=20&_cb=${timestamp}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("Gagal mengambil data dari cloud server BE_EXP2.");

    const resultData = await response.json();
    
    // DISESUAIKAN: Membaca properti .data karena di main.py kamu mengembalikan {"data": output_records}
    const recommendationsFromModel = resultData && resultData.data ? resultData.data : [];

    return mapBackendToFrontendModel(recommendationsFromModel);

  } catch (error) {
    console.error("Error pada Skenario 1 (By Title):", error);
    return getMockAnimeList().slice(0, 15);
  }
}

export async function fetchRecommendationsByGenreTheme(genres: string[], themes: string[]): Promise<Anime[]> {
  try {
    const combinedTags = [...genres, ...themes];
    if (combinedTags.length === 0) return [];

    const timestamp = new Date().getTime();
    const queryParams = combinedTags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
    const url = `${FASTAPI_URL}/catalog?${queryParams}&top_n=20&_cb=${timestamp}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("Gagal mengambil data katalog dari cloud server BE_EXP2.");

    const resultData = await response.json();
    
    // DISESUAIKAN: Membaca properti .data untuk endpoint katalog juga
    const recommendationsFromModel = resultData && resultData.data ? resultData.data : [];

    return mapBackendToFrontendModel(recommendationsFromModel);

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

