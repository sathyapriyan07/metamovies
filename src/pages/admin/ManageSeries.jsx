import { useEffect, useState } from 'react';
import { supabase, getSeries, getSeasonsBySeries, getEpisodesBySeason } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageSeries = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [seriesForm, setSeriesForm] = useState({
    tmdb_rating: '',
    imdb_rating: '',
    watch_links: '{}',
    title_logo_url: '',
    use_text_title: true
  });
  const [saveState, setSaveState] = useState({ loading: false, error: '', success: '' });
  const [savingEpisodes, setSavingEpisodes] = useState({});
  const [previewLink, setPreviewLink] = useState(null);
  const [bulkSaving, setBulkSaving] = useState(false);

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
    console.log('Seasons loaded:', seasonsData?.length || 0, seasonsData);
    setSeasons(seasonsData || []);
    if (seasonsData?.length) {
      const firstSeasonId = seasonsData[0].id;
      console.log('Auto-selecting first season:', firstSeasonId);
      setSelectedSeason(firstSeasonId);
      const { data: episodesData } = await getEpisodesBySeason(firstSeasonId);
      console.log('Initial episodes loaded:', episodesData?.length || 0);
      setEpisodes(episodesData || []);
    } else {
      setSelectedSeason(null);
      setEpisodes([]);
    }
  };

  const handleSeasonSelect = async (seasonId) => {
    setSelectedSeason(seasonId);
    console.log('Selected season ID:', seasonId);
    const { data, error } = await getEpisodesBySeason(seasonId);
    console.log('Episodes fetched:', data?.length || 0, 'Error:', error);
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
    setSaveState({ loading: false, error: '', success: 'Series saved successfully!' });
    setTimeout(() => setSaveState({ loading: false, error: '', success: '' }), 3000);
  };

  const updateEmbedLink = (id, value) => {
    setEpisodes(prev =>
      prev.map(ep => (ep.id === id ? { ...ep, embed_link: value } : ep))
    );
  };

  const saveEpisode = async (id) => {
    setSavingEpisodes(prev => ({ ...prev, [id]: true }));
    const episode = episodes.find(ep => ep.id === id);
    const { error } = await supabase
      .from('episodes')
      .update({ embed_link: episode.embed_link || null })
      .eq('id', id);
    
    if (error) {
      console.error('Error saving episode:', error);
    }
    setSavingEpisodes(prev => ({ ...prev, [id]: false }));
  };

  const bulkSaveEpisodes = async () => {
    setBulkSaving(true);
    for (const ep of episodes) {
      await supabase
        .from('episodes')
        .update({ embed_link: ep.embed_link || null })
        .eq('id', ep.id);
    }
    setBulkSaving(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const generateEmbedLink = (episodeId) => {
    if (!selectedSeries?.tmdb_id) return;
    const episode = episodes.find(ep => ep.id === episodeId);
    if (!episode) return;
    
    const season = seasons.find(s => s.id === selectedSeason);
    if (!season) return;
    
    const embedUrl = `https://vidsrc.to/embed/tv/${selectedSeries.tmdb_id}/${season.season_number}/${episode.episode_number}`;
    updateEmbedLink(episodeId, embedUrl);
  };

  return (
    <AdminLayout title="Manage Series" subtitle="Edit series ratings, watch links, and episode embed links.">
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left Sidebar - Series List */}
        <aside className="w-full lg:w-72 shrink-0 bg-zinc-900 rounded-xl p-4 space-y-3 border border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">Series List</h2>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {seriesList.map((item) => (
              <button
                key={item.id}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  selectedSeries?.id === item.id
                    ? 'border-yellow-500 bg-zinc-800'
                    : 'border-zinc-800 hover:border-yellow-500'
                }`}
                onClick={() => handleSelectSeries(item)}
              >
                <div className="text-sm font-medium text-zinc-100">{item.name}</div>
                <div className="text-xs text-zinc-400 mt-1">TMDB: {item.tmdb_id}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1 space-y-6">
          {selectedSeries ? (
            <>
              {/* Series Ratings & Watch Links */}
              <form onSubmit={handleSeriesSave} className="bg-zinc-900 rounded-xl p-6 space-y-5 border border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-100">Series Ratings & Watch Links</h2>
                
                {saveState.error && (
                  <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                    {saveState.error}
                  </div>
                )}
                {saveState.success && (
                  <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg p-3">
                    {saveState.success}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">TMDB Rating</label>
                    <input
                      value={seriesForm.tmdb_rating}
                      onChange={(e) => setSeriesForm((prev) => ({ ...prev, tmdb_rating: e.target.value }))}
                      placeholder="0.0 - 10.0"
                      className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">IMDb Rating</label>
                    <input
                      value={seriesForm.imdb_rating}
                      onChange={(e) => setSeriesForm((prev) => ({ ...prev, imdb_rating: e.target.value }))}
                      placeholder="0.0 - 10.0"
                      className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Title Logo URL</label>
                  <input
                    value={seriesForm.title_logo_url}
                    onChange={(e) => setSeriesForm((prev) => ({ ...prev, title_logo_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={seriesForm.use_text_title}
                    onChange={(e) => setSeriesForm((prev) => ({ ...prev, use_text_title: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Use text title (disable to show logo)
                </label>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Watch Links (JSON)</label>
                  <textarea
                    value={seriesForm.watch_links}
                    onChange={(e) => setSeriesForm((prev) => ({ ...prev, watch_links: e.target.value }))}
                    rows={4}
                    placeholder='{"netflix":"url","prime":"url"}'
                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saveState.loading}
                  className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg w-full md:w-fit hover:bg-yellow-400 transition disabled:opacity-50"
                >
                  {saveState.loading ? 'Saving...' : 'Save Series'}
                </button>
              </form>

              {/* Episode Management */}
              <div className="bg-zinc-900 rounded-xl p-6 space-y-5 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-100">Episode Embed Links</h2>
                  {episodes.length > 0 && (
                    <button
                      onClick={bulkSaveEpisodes}
                      disabled={bulkSaving}
                      className="bg-yellow-500 text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
                    >
                      {bulkSaving ? 'Saving All...' : 'Save All Episodes'}
                    </button>
                  )}
                </div>

                {/* Season Selector */}
                {seasons.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {seasons.map((season) => (
                      <button
                        key={season.id}
                        className={`px-4 py-2 rounded-lg border font-medium text-sm transition ${
                          selectedSeason === season.id
                            ? 'bg-yellow-500 text-black border-yellow-500'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                        }`}
                        onClick={() => handleSeasonSelect(season.id)}
                      >
                        S{season.season_number}
                      </button>
                    ))}
                  </div>
                )}

                {/* Episodes List */}
                <div className="space-y-4">
                  {episodes && episodes.length > 0 ? (
                    episodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="bg-zinc-800 rounded-lg p-4 space-y-3 border border-zinc-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-zinc-100">
                            E{ep.episode_number} - {ep.name}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {ep.air_date || 'No air date'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-400">Embed Link</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={ep.embed_link || ''}
                            placeholder="https://vidsrc.to/embed/tv/..."
                            className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
                            onChange={(e) => updateEmbedLink(ep.id, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => generateEmbedLink(ep.id)}
                            className="px-3 py-2 bg-zinc-700 text-zinc-300 text-xs rounded-lg hover:bg-zinc-600 transition shrink-0"
                            title="Auto-generate VidSrc embed link"
                          >
                            Generate
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => saveEpisode(ep.id)}
                          disabled={savingEpisodes[ep.id]}
                          className="bg-yellow-500 text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
                        >
                          {savingEpisodes[ep.id] ? 'Saving...' : 'Save'}
                        </button>
                        {ep.embed_link && (
                          <>
                            <button
                              onClick={() => setPreviewLink(ep.embed_link)}
                              className="bg-zinc-700 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-600 transition"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => copyToClipboard(ep.embed_link)}
                              className="bg-zinc-700 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-600 transition"
                              title="Copy embed link"
                            >
                              Copy
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                  ) : (
                    <div className="text-sm text-zinc-400 text-center py-8">
                      {selectedSeason ? 'No episodes found for this season.' : 'Select a season to view episodes.'}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-center">
              <p className="text-sm text-zinc-400">Select a series from the left to edit.</p>
            </div>
          )}
        </main>
      </div>

      {/* Preview Modal */}
      {previewLink && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100">Preview Embed</h3>
              <button
                onClick={() => setPreviewLink(null)}
                className="text-zinc-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={previewLink}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageSeries;
