import { useEffect, useState } from 'react';
import { supabase, getSeries, getSeasonsBySeries, getEpisodesBySeason } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageSeries = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [seriesForm, setSeriesForm] = useState({
    tmdb_rating: '',
    imdb_rating: '',
    watch_links: '{}',
    title_logo_url: '',
    use_text_title: true
  });
  const [saveState, setSaveState] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    const { data } = await getSeries(200, 0);
    setSeriesList(data || []);
  };

  const handleSelectSeries = async (item) => {
    setSelectedSeries(item);
    setSeriesForm({
      tmdb_rating: item.tmdb_rating ?? '',
      imdb_rating: item.imdb_rating ?? '',
      watch_links: JSON.stringify(item.watch_links || {}, null, 2),
      title_logo_url: item.title_logo_url || '',
      use_text_title: item.use_text_title ?? true
    });
    const { data: seasonsData } = await getSeasonsBySeries(item.id);
    setSeasons(seasonsData || []);
    if (seasonsData?.length) {
      const { data: episodesData } = await getEpisodesBySeason(seasonsData[0].id);
      setEpisodes(episodesData || []);
    } else {
      setEpisodes([]);
    }
  };

  const handleSeasonSelect = async (seasonId) => {
    const { data } = await getEpisodesBySeason(seasonId);
    setEpisodes(data || []);
  };

  const handleSeriesSave = async (e) => {
    e.preventDefault();
    if (!selectedSeries) return;
    setSaveState({ loading: true, error: '', success: '' });
    let watchLinks = {};
    try {
      watchLinks = JSON.parse(seriesForm.watch_links || '{}');
    } catch {
      setSaveState({ loading: false, error: 'Invalid JSON in watch links.', success: '' });
      watchLinks = {};
      return;
    }
    const { error } = await supabase
      .from('series')
      .update({
        tmdb_rating: seriesForm.tmdb_rating ? Number(seriesForm.tmdb_rating) : null,
        imdb_rating: seriesForm.imdb_rating ? Number(seriesForm.imdb_rating) : null,
        watch_links: watchLinks,
        title_logo_url: seriesForm.title_logo_url || null,
        use_text_title: !!seriesForm.use_text_title
      })
      .eq('id', selectedSeries.id);
    if (error) {
      setSaveState({ loading: false, error: error.message || 'Failed to save.', success: '' });
      return;
    }
    await loadSeries();
    setSaveState({ loading: false, error: '', success: 'Series saved.' });
  };

  const handleEpisodeFieldChange = async (episodeId, field, value) => {
    const updates =
      field === 'watch_link'
        ? { [field]: value === '' ? null : value }
        : { [field]: value === '' ? null : Number(value) };
    await supabase.from('episodes').update(updates).eq('id', episodeId);
  };

  return (
    <AdminLayout title="Manage Series" subtitle="Edit series ratings and watch links, and episode ratings.">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-3">Series</h2>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {seriesList.map((item) => (
              <button
                key={item.id}
                className={`w-full text-left p-3 rounded-md border ${
                  selectedSeries?.id === item.id ? 'border-[#F5C518] bg-[#111]' : 'border-gray-800 bg-[#1a1a1a]'
                }`}
                onClick={() => handleSelectSeries(item)}
              >
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-gray-400">TMDB: {item.tmdb_id}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {selectedSeries ? (
            <>
              <form onSubmit={handleSeriesSave} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 space-y-3">
                <h2 className="text-lg font-semibold">Series Ratings & Watch Links</h2>
                {saveState.error && (
                  <div className="text-xs text-red-400">{saveState.error}</div>
                )}
                {saveState.success && (
                  <div className="text-xs text-green-400">{saveState.success}</div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={seriesForm.tmdb_rating}
                    onChange={(e) => setSeriesForm((prev) => ({ ...prev, tmdb_rating: e.target.value }))}
                    placeholder="TMDB rating"
                    className="bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    value={seriesForm.imdb_rating}
                    onChange={(e) => setSeriesForm((prev) => ({ ...prev, imdb_rating: e.target.value }))}
                    placeholder="IMDb rating"
                    className="bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <input
                  value={seriesForm.title_logo_url}
                  onChange={(e) => setSeriesForm((prev) => ({ ...prev, title_logo_url: e.target.value }))}
                  placeholder="Title logo URL"
                  className="bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
                />
                <label className="text-xs text-gray-400 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={seriesForm.use_text_title}
                    onChange={(e) => setSeriesForm((prev) => ({ ...prev, use_text_title: e.target.checked }))}
                  />
                  Use text title (disable to show logo)
                </label>
                <textarea
                  value={seriesForm.watch_links}
                  onChange={(e) => setSeriesForm((prev) => ({ ...prev, watch_links: e.target.value }))}
                  rows={4}
                  placeholder='{"netflix":"url","prime":"url"}'
                  className="bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
                />
                <button type="submit" className="btn-primary h-10 px-4">Save Series</button>
              </form>

              <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
                <h2 className="text-lg font-semibold mb-3">Episode Ratings</h2>
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {seasons.map((season) => (
                    <button
                      key={season.id}
                      className="text-xs px-3 py-1 rounded bg-[#111] border border-gray-800"
                      onClick={() => handleSeasonSelect(season.id)}
                    >
                      S{season.season_number}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {episodes.map((ep) => (
                    <div key={ep.id} className="flex items-center gap-2 bg-[#111] border border-gray-800 rounded-md p-2">
                      <div className="text-xs text-gray-300 w-10">E{ep.episode_number}</div>
                      <div className="flex-1 text-xs text-gray-300">{ep.name}</div>
                      <input
                        defaultValue={ep.tmdb_rating || ''}
                        onBlur={(e) => handleEpisodeFieldChange(ep.id, 'tmdb_rating', e.target.value)}
                        placeholder="TMDB"
                        className="w-16 bg-[#1a1a1a] border border-gray-800 rounded px-2 py-1 text-xs"
                      />
                      <input
                        defaultValue={ep.imdb_rating || ''}
                        onBlur={(e) => handleEpisodeFieldChange(ep.id, 'imdb_rating', e.target.value)}
                        placeholder="IMDb"
                        className="w-16 bg-[#1a1a1a] border border-gray-800 rounded px-2 py-1 text-xs"
                      />
                      <input
                        defaultValue={ep.watch_link || ''}
                        onBlur={(e) => handleEpisodeFieldChange(ep.id, 'watch_link', e.target.value)}
                        placeholder="Watch URL"
                        className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  ))}
                  {episodes.length === 0 && <div className="text-sm text-gray-400">No episodes found.</div>}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 text-sm text-gray-400">
              Select a series to edit.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageSeries;
