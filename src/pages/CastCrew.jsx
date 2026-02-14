import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById } from '../services/supabase';

const CastCrew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    setLoading(true);
    const { data } = await getMovieById(id);
    setMovie(data);
    setLoading(false);
  };

  const groupCrewByJob = (crew) => {
    const groups = {};
    crew?.forEach(member => {
      const job = member.job || 'Other';
      if (!groups[job]) groups[job] = [];
      groups[job].push(member);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#04060b] to-[#0a0f1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#3ba7ff]"></div>
      </div>
    );
  }

  if (!movie) return <div className="min-h-screen flex items-center justify-center">Movie not found</div>;

  const crewGroups = groupCrewByJob(movie.crew);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#04060b] to-[#0a0f1a] pb-24 md:pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/[0.12] backdrop-blur-[28px] border-b border-white/20">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/[0.18] backdrop-blur-[18px] border border-white/35 flex items-center justify-center transition-all duration-250 hover:bg-white/[0.28] hover:border-white/50"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {movie.title} - Cast & Crew
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-6 space-y-8">
        {/* Cast Section */}
        {movie.cast?.length > 0 && (
          <section className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Cast</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.cast.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/person/${c.person.id}`)}
                  className="cursor-pointer group text-center"
                >
                  <div className="w-full aspect-square rounded-full overflow-hidden bg-white/10 mb-3 transition-all duration-200 group-hover:scale-105">
                    {c.person.profile_url ? (
                      <img
                        src={c.person.profile_url}
                        alt={c.person.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white line-clamp-2">{c.person.name}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-1">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Crew Section */}
        {Object.keys(crewGroups).length > 0 && (
          <section className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Crew</h2>
            <div className="space-y-6">
              {Object.entries(crewGroups).map(([job, members]) => (
                <div key={job}>
                  <h3 className="text-lg font-medium text-white mb-4">{job}</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => navigate(`/person/${member.person.id}`)}
                        className="flex-shrink-0 cursor-pointer group text-center w-20"
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 mb-2 mx-auto transition-all duration-200 group-hover:scale-105">
                          {member.person.profile_url ? (
                            <img
                              src={member.person.profile_url}
                              alt={member.person.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-white line-clamp-2">{member.person.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CastCrew;