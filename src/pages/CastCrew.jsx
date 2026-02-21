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
    crew?.forEach((member) => {
      const job = member.job || 'Other';
      if (!groups[job]) groups[job] = [];
      groups[job].push(member);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#04060b] to-[#0a0f1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/40"></div>
      </div>
    );
  }

  if (!movie) return <div className="min-h-screen flex items-center justify-center">Movie not found</div>;

  const crewGroups = groupCrewByJob(movie.crew);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#04060b] to-[#0a0f1a] pb-24 md:pb-12">
      <div className="desktop-container">
        <div className="flex items-center gap-4 mb-6 lg:mb-10">
          <button
            onClick={() => navigate(-1)}
            className="btn-icon"
            aria-label="Go back"
          >
            <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
            {movie.title} | Cast and Crew
          </h1>
        </div>

        {movie.cast?.length > 0 && (
          <section className="section-wide">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">Cast</h2>
            <div className="cast-grid">
              {movie.cast.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`/person/${c.person.id}`)}
                  className="cast-card"
                >
                  <div className="cast-avatar">
                    {c.person.profile_url ? (
                      <img
                        src={c.person.profile_url}
                        alt={c.person.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/10">
                        <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-white line-clamp-1">{c.person.name}</p>
                  <p className="text-sm text-white/70 line-clamp-2 mt-1">{c.character}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {Object.keys(crewGroups).length > 0 && (
          <section className="section-wide">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">Crew</h2>
            <div className="space-y-6">
              {Object.entries(crewGroups).map(([job, members]) => (
                <div key={job} className="role-group">
                  <h3 className="text-xl font-semibold mb-6">{job}</h3>
                  <div className="cast-grid">
                    {members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => navigate(`/person/${member.person.id}`)}
                        className="cast-card"
                      >
                        <div className="cast-avatar">
                          {member.person.profile_url ? (
                            <img
                              src={member.person.profile_url}
                              alt={member.person.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/10">
                              <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-white line-clamp-1">{member.person.name}</p>
                        <p className="text-sm text-white/70 line-clamp-2 mt-1">{member.job}</p>
                      </button>
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
