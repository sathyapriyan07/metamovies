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
    return <div className="min-h-screen bg-[#0f0f0f] text-white px-4 pt-12">Loading...</div>;
  }

  if (!movie) return <div className="min-h-screen bg-[#0f0f0f] text-white px-4 pt-12">Movie not found</div>;

  const crewGroups = groupCrewByJob(movie.crew);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <button className="text-sm text-gray-400 hover:text-white" onClick={() => navigate(-1)}>Back</button>
        <h1 className="text-lg font-semibold mt-2">{movie.title} • Cast and Crew</h1>

        {movie.cast?.length > 0 && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Cast</h2>
            <div className="space-y-2">
              {movie.cast.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left bg-[#1a1a1a] border border-gray-800 rounded-md p-3"
                  onClick={() => navigate(`/person/${c.person.id}`)}
                >
                  <p className="text-sm font-medium">{c.person.name}</p>
                  {c.character && <p className="text-xs text-gray-400 mt-1">{c.character}</p>}
                </button>
              ))}
            </div>
          </section>
        )}

        {Object.keys(crewGroups).length > 0 && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Crew</h2>
            <div className="space-y-4">
              {Object.entries(crewGroups).map(([job, members]) => (
                <div key={job}>
                  <h3 className="text-sm text-gray-400 mb-2">{job}</h3>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <button
                        key={member.id}
                        className="w-full text-left bg-[#1a1a1a] border border-gray-800 rounded-md p-3"
                        onClick={() => navigate(`/person/${member.person.id}`)}
                      >
                        <p className="text-sm font-medium">{member.person.name}</p>
                        {member.job && <p className="text-xs text-gray-400 mt-1">{member.job}</p>}
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
