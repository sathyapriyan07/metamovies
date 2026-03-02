import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const WatchEpisode = () => {
  const { seriesId, seasonNumber, episodeNumber } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEpisode();
  }, [seriesId, seasonNumber, episodeNumber]);

  const loadEpisode = async () => {
    const [{ data: seriesData }, { data: seasonData }] = await Promise.all([
      supabase.from('series').select('id, name').eq('id', seriesId).single(),
      supabase
        .from('seasons')
        .select('id')
        .eq('series_id', seriesId)
        .eq('season_number', seasonNumber)
        .single()
    ]);

    if (seasonData) {
      const { data: episodeData } = await supabase
        .from('episodes')
        .select('id, name, episode_number, embed_link')
        .eq('season_id', seasonData.id)
        .eq('episode_number', episodeNumber)
        .single();
      setEpisode(episodeData);
    }

    setSeries(seriesData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!episode?.embed_link) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Streaming not available</p>
          <button
            onClick={() => navigate(`/series/${seriesId}`)}
            className="text-yellow-400 hover:underline"
          >
            ← Back to Series
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black">
        <button
          onClick={() => navigate(`/series/${seriesId}`)}
          className="text-zinc-300 hover:text-white text-sm font-medium flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-sm font-medium text-zinc-100 truncate max-w-md">
          {series?.name} - S{seasonNumber}E{episodeNumber}: {episode.name}
        </h1>
        <div className="w-16" />
      </div>

      {/* Player */}
      <div className="flex-1 bg-black">
        <iframe
          src={episode.embed_link}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
};

export default WatchEpisode;
