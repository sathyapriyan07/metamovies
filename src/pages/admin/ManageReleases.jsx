import { useEffect, useState } from 'react';
import { getMovies, getPlatforms, getReleasesByRange, supabase } from '../../services/supabase';

const ManageReleases = () => {
  const [movies, setMovies] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [releases, setReleases] = useState([]);
  const [form, setForm] = useState({
    movie_id: '',
    release_type: 'theatre',
    platform_id: '',
    language: '',
    release_date: '',
    region: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [movieResp, platformResp, releasesResp] = await Promise.all([
      getMovies(100, 0),
      getPlatforms({ activeOnly: false }),
      getReleasesByRange('2000-01-01', '2100-01-01')
    ]);
    setMovies(movieResp.data || []);
    setPlatforms(platformResp.data || []);
    setReleases(releasesResp.data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await supabase.from('releases').insert({
      movie_id: form.movie_id,
      release_type: form.release_type,
      platform_id: form.release_type === 'ott' ? form.platform_id || null : null,
      language: form.language || null,
      release_date: form.release_date,
      region: form.region || null
    });
    setForm({ movie_id: '', release_type: 'theatre', platform_id: '', language: '', release_date: '', region: '' });
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
        <h1 className="text-2xl font-bold mb-6">Manage Releases</h1>

        <section className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Add Release</h2>
          <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
            <select
              value={form.movie_id}
              onChange={(e) => setForm((prev) => ({ ...prev, movie_id: e.target.value }))}
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm col-span-2"
              required
            >
              <option value="">Select Movie</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>{movie.title}</option>
              ))}
            </select>
            <select
              value={form.release_type}
              onChange={(e) => setForm((prev) => ({ ...prev, release_type: e.target.value }))}
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            >
              <option value="theatre">Theatre</option>
              <option value="ott">OTT</option>
            </select>
            <select
              value={form.platform_id}
              onChange={(e) => setForm((prev) => ({ ...prev, platform_id: e.target.value }))}
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
              disabled={form.release_type !== 'ott'}
            >
              <option value="">Platform</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>{platform.name}</option>
              ))}
            </select>
            <input
              value={form.language}
              onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
              placeholder="Language"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={form.region}
              onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
              placeholder="Region"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={form.release_date}
              onChange={(e) => setForm((prev) => ({ ...prev, release_date: e.target.value }))}
              type="date"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm col-span-2"
              required
            />
            <button className="btn-primary h-10 col-span-2">Save Release</button>
          </form>
        </section>

        <section className="py-4">
          <h2 className="text-lg font-semibold mb-3">All Releases</h2>
          <div className="space-y-2">
            {releases.map((release) => (
              <div key={release.id} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3">
                <div className="text-sm font-medium">{release.movie?.title}</div>
                <div className="text-xs text-gray-400">
                  {release.release_date} • {release.release_type === 'ott' ? release.platform?.name || 'OTT' : 'Theatre'}
                </div>
              </div>
            ))}
            {releases.length === 0 && <div className="text-sm text-gray-400">No releases yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManageReleases;
