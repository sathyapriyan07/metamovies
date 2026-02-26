import { useEffect, useState } from 'react';
import { adminDeleteReview, getReviewsByMovie, getMovies } from '../../services/supabase';

const ManageReviews = () => {
  const [movies, setMovies] = useState([]);
  const [movieId, setMovieId] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    if (movieId) loadReviews();
  }, [movieId]);

  const loadMovies = async () => {
    const { data } = await getMovies(200, 0);
    setMovies(data || []);
  };

  const loadReviews = async () => {
    const { data } = await getReviewsByMovie(movieId, 'latest');
    setReviews(data || []);
  };

  const handleDelete = async (id) => {
    await adminDeleteReview(id);
    await loadReviews();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
        <h1 className="text-2xl font-bold mb-6">Manage Reviews</h1>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 mb-6">
          <select
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="h-11 bg-[#111] border border-gray-800 rounded-md px-3 text-sm w-full"
          >
            <option value="">Select Movie</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>{movie.title}</option>
            ))}
          </select>
        </div>

        <section className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{review.user?.username || 'User'}</div>
                <div className="text-xs text-gray-400">{review.rating || 'NR'}</div>
              </div>
              <p className="text-sm text-gray-300 mt-2">{review.body}</p>
              <button className="mt-3 text-xs text-red-400" onClick={() => handleDelete(review.id)}>
                Delete
              </button>
            </div>
          ))}
          {movieId && reviews.length === 0 && <div className="text-sm text-gray-400">No reviews yet.</div>}
        </section>
      </div>
    </div>
  );
};

export default ManageReviews;
