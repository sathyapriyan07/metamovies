import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { useAuth } from '../context/AuthContext';
import {
  addReview,
  getMovieById,
  getMovieRatingsSummary,
  getReviewsByMovie,
  likeReview,
  unlikeReview,
  upsertRating,
  resolveSlug
} from '../services/supabase';

const MovieReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avg: null, count: 0 });
  const [sortBy, setSortBy] = useState('latest');
  const [form, setForm] = useState({ rating: 5, body: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id, sortBy]);

  const loadData = async () => {
    setLoading(true);
    let resolvedId = id;
    if (!/^\d+$/.test(id)) {
      const { data: slugData } = await resolveSlug(id, 'movie');
      resolvedId = slugData?.entity_id || id;
    }
    const [{ data: movieData }, { data: reviewData }, summaryData] = await Promise.all([
      getMovieById(resolvedId),
      getReviewsByMovie(resolvedId, sortBy),
      getMovieRatingsSummary(resolvedId)
    ]);
    setMovie(movieData);
    setReviews(reviewData || []);
    setSummary(summaryData || { avg: null, count: 0 });
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!form.body.trim()) return;
    const movieId = movie?.id || id;
    await addReview(movieId, user.id, form.body, Number(form.rating));
    await upsertRating(movieId, user.id, Number(form.rating));
    setForm({ rating: 5, body: '' });
    await loadData();
  };

  const toggleLike = async (review) => {
    if (!user) return navigate('/login');
    const liked = (review.review_likes || []).some((l) => l.user_id === user.id);
    if (liked) {
      await unlikeReview(review.id, user.id);
    } else {
      await likeReview(review.id, user.id);
    }
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SeoHead title={`${movie.title} Reviews`} description={`Reviews and ratings for ${movie.title}`} />
      <div className="max-w-2xl mx-auto px-4 pb-10 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{movie.title} Reviews</h1>
          <button className="text-sm text-[#F5C518]" onClick={() => navigate(`/movie/${movie.id}`)}>
            Back to Movie
          </button>
        </div>

        <section className="py-6">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
            <div className="text-sm text-gray-400">User Rating</div>
            <div className="text-2xl font-bold text-[#F5C518]">
              {summary.avg ? summary.avg.toFixed(1) : 'NR'}
            </div>
            <div className="text-xs text-gray-500">{summary.count} ratings</div>
          </div>
        </section>

        <section className="py-4">
          <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">Rating</label>
              <select
                value={form.rating}
                onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                className="bg-[#121212] border border-gray-800 rounded-md px-2 py-1 text-sm"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value} Stars</option>
                ))}
              </select>
            </div>
            <textarea
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              placeholder="Write your review"
              rows={4}
              className="w-full bg-[#121212] border border-gray-800 rounded-md px-3 py-2 text-sm"
            />
            <button type="submit" className="btn-primary h-10 px-4">
              Post Review
            </button>
          </form>
        </section>

        <section className="py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">All Reviews</h2>
            <div className="flex gap-2">
              <button
                className={`text-xs px-3 py-1 rounded ${sortBy === 'latest' ? 'bg-[#F5C518] text-black' : 'bg-[#1a1a1a] text-white'}`}
                onClick={() => setSortBy('latest')}
              >
                Latest
              </button>
              <button
                className={`text-xs px-3 py-1 rounded ${sortBy === 'top' ? 'bg-[#F5C518] text-black' : 'bg-[#1a1a1a] text-white'}`}
                onClick={() => setSortBy('top')}
              >
                Top Rated
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{review.user?.username || 'User'}</span>
                  <span className="text-[#F5C518]">{review.rating || 'NR'}</span>
                </div>
                <p className="text-sm text-gray-300 mt-2">{review.body}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <button onClick={() => toggleLike(review)} className="text-[#F5C518]">
                    Like ({(review.review_likes || []).length})
                  </button>
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <div className="text-sm text-gray-400">No reviews yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MovieReviews;
