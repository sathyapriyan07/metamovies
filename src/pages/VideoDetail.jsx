import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import FrostedPlayButton from '../components/FrostedPlayButton';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setVideo(data);
      
      const { data: personsData } = await supabase
        .from('featured_video_persons')
        .select(`
          role,
          persons (
            id,
            name,
            profile_path,
            profile_url
          )
        `)
        .eq('featured_video_id', id)
        .order('created_at', { ascending: true });
      
      setPersons(personsData || []);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const openVideo = () => {
    if (video?.youtube_url) {
      window.open(video.youtube_url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderDescriptionWithLinks = (text) => {
    if (!text) return null;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 md:pt-28 pb-24 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen pt-24 md:pt-28 pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Video not found</p>
          <button onClick={() => navigate('/videos')} className="btn-primary">
            Back to Videos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate('/videos')}
          className="text-sky-300 hover:text-white mb-6 flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Videos
        </button>

        <div 
          onClick={openVideo}
          className="relative aspect-video rounded-2xl overflow-hidden mb-6 cursor-pointer group"
        >
          <img
            src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FrostedPlayButton size="lg" />
        </div>
      </div>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{video.title}</h1>
          {video.description && (
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {renderDescriptionWithLinks(video.description)}
              </p>
            </div>
          )}
          <button
            onClick={openVideo}
            className="btn-primary mt-6"
          >
            Watch on YouTube
          </button>
        </div>

        {persons.length > 0 && (
          <div className="glass-card rounded-2xl p-6 md:p-8 mt-6">
            <h2 className="text-xl font-bold mb-4">Persons Involved</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
              {persons.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/person/${item.persons.id}`)}
                  className="flex-shrink-0 snap-start cursor-pointer group"
                >
                  <div className="glass-card rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,167,255,0.3)]">
                    <img
                      src={item.persons.profile_url || (item.persons.profile_path ? `https://image.tmdb.org/t/p/w185${item.persons.profile_path}` : '/placeholder-person.png')}
                      alt={item.persons.name}
                      loading="lazy"
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover mb-3 mx-auto"
                    />
                    <p className="text-sm font-medium text-center line-clamp-1 mb-1">{item.persons.name}</p>
                    {item.role && <p className="text-xs text-gray-400 text-center line-clamp-1">{item.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetail;
