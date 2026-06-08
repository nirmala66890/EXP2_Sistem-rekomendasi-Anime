
import joblib
import numpy as np

# LOAD SEMUA
model = joblib.load("model_svd.pkl")
df = joblib.load("df.pkl")
final_matrix = joblib.load("matrix.pkl")
mlb_genre = joblib.load("mlb_genre.pkl")
mlb_theme = joblib.load("mlb_theme.pkl")
indices_title = joblib.load("indices_title.pkl")

from sklearn.metrics.pairwise import cosine_similarity

def get_cbf_scores(idx):
    sim_scores = cosine_similarity(
        final_matrix[idx],
        final_matrix
    ).flatten()
    return sim_scores

    from scipy.sparse import hstack, csr_matrix

def get_cbf_scores_by_filter(genres=None, themes=None):

    if genres is None:
        genres = []
    if themes is None:
        themes = []

    genres = [g.lower() for g in genres]
    themes = [t.lower() for t in themes]

    tfidf_zero = csr_matrix((1, final_matrix.shape[1]))

    genre_vec = csr_matrix(mlb_genre.transform([genres])) * 3.0
    theme_vec = csr_matrix(mlb_theme.transform([themes])) * 2.0

    query_vector = hstack([tfidf_zero, genre_vec, theme_vec])

    sim_scores = cosine_similarity(query_vector, final_matrix).flatten()

    return sim_scores

    def get_cf_scores(model, user_id, item_ids):
    scores = []

    for item in item_ids:
        est = model.predict(user_id, item).est
        scores.append(est)

    return np.array(scores)

    def hybrid_scores(
    model,
    user_id,
    input_type="title",
    input_value=None,
    genres=None,
    themes=None,
    alpha=0.6
):

    item_ids = df['mal_id'].values

    if input_type == "title":

        key = input_value.lower().strip()

        if key not in indices_title:
            raise ValueError("Judul tidak ditemukan")

        idx = indices_title[key]
        cbf_scores = get_cbf_scores(idx)

    else:
        cbf_scores = get_cbf_scores_by_filter(genres, themes)

    cf_scores = get_cf_scores(model, user_id, item_ids)

    # NORMALISASI
    cbf_scores = (cbf_scores - cbf_scores.min()) / (cbf_scores.max() - cbf_scores.min() + 1e-9)
    cf_scores = (cf_scores - cf_scores.min()) / (cf_scores.max() - cf_scores.min() + 1e-9)

    return alpha * cbf_scores + (1 - alpha) * cf_scores

    def recommend_logic(title=None, genres=None, themes=None):

    user_id = "dummy_user"  # atau ambil dari train_df

    if title and title.strip() != "":
        scores = hybrid_scores(
            model, user_id,
            input_type="title",
            input_value=title
        )

    elif genres or themes:
        scores = hybrid_scores(
            model, user_id,
            input_type="filter",
            genres=genres,
            themes=themes
        )

    else:
        raise ValueError("Isi judul ATAU pilih genre/theme")

    top_indices = np.argsort(scores)[::-1][:10]

    result = df.iloc[top_indices][
        ['title', 'genres', 'themes']
    ].copy()

    result['score'] = [round(scores[i], 3) for i in top_indices]

    return result

