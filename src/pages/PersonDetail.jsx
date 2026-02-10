import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonById } from '../services/supabase';
import PersonalInfoCard from '../components/PersonalInfoCard';
import KnownForCarousel from '../components/KnownForCarousel';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPerson();
  }, [id]);

  const allWorks = useMemo(() => {
    if (!person) return [];
    return [
      ...(person.cast_roles?.filter((c) => c.movie)?.map((c) => ({
        ...(c.movie || {}),
        type: 'movie',
        role: c.character,
        year: c.movie?.release_date?.split('-')[0],
        rating: c.movie?.rating || 0
      })) || []),
      ...(person.crew_roles?.filter((c) => c.movie)?.map((c) => ({
        ...(c.movie || {}),
        type: 'movie',
        role: c.job,
        year: c.movie?.release_date?.split('-')[0],
        rating: c.movie?.rating || 0
      })) || [])
    ].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [person]);

  const loadPerson = async () => {
    setLoading(true);
    const { data } = await getPersonById(id);
    setPerson(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-400"></div>
      </div>
    );
  }

  if (!person) return <div className="min-h-screen flex items-center justify-center">Person not found</div>;


  const creditsCount = (person.cast_roles?.length || 0) + (person.crew_roles?.length || 0);

  const actingCredits = (person.cast_roles || []).filter((c) => c.movie)
    .map((c) => ({
      ...(c.movie || {}),
      type: 'movie',
      role: c.character,
      year: c.movie?.release_date?.split('-')[0]
    }))
    .sort((a, b) => (b.year || '0') - (a.year || '0'));

  const soundJobs = ['Original Music Composer', 'Music Composer', 'Composer', 'Score', 'Soundtrack', 'Music'];
  const soundCredits = (person.crew_roles || []).filter((c) => c.movie)
    .filter((c) => soundJobs.some((job) => c.job?.includes(job)))
    .map((c) => ({
      ...(c.movie || {}),
      type: 'movie',
      role: c.job,
      year: c.movie?.release_date?.split('-')[0]
    }))
    .sort((a, b) => (b.year || '0') - (a.year || '0'));

  const directorCredits = (person.crew_roles || []).filter((c) => c.movie)
    .filter((c) => c.job?.includes('Director'))
    .map((c) => ({
      ...(c.movie || {}),
      type: 'movie',
      role: c.job,
      year: c.movie?.release_date?.split('-')[0]
    }))
    .sort((a, b) => (b.year || '0') - (a.year || '0'));

  const hasActing = actingCredits.length > 0;
  const hasSound = soundCredits.length > 0;
  const hasDirector = directorCredits.length > 0;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <div className="relative h-[40vh] md:h-[45vh] overflow-hidden">
        <img
          src={person.profile_url || 'https://via.placeholder.com/1200x600'}
          alt={person.name}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-[#05070c]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,167,255,0.25),transparent_45%)]" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 h-full flex items-end pb-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-sky-300/40 neon-ring">
              <img
                src={person.profile_url || 'https://via.placeholder.com/400x400'}
                alt={`${person.name} profile`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sky-300 text-xs uppercase tracking-[0.3em]">Spotlight</p>
              <h1 className="text-3xl md:text-5xl font-semibold mt-2">{person.name}</h1>
              <div className="flex gap-3 mt-4">
                {person.social_links?.instagram && (
                  <a href={person.social_links.instagram} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                      alt="Instagram"
                      className="h-5 w-auto object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                )}
                {person.social_links?.twitter && (
                  <a href={person.social_links.twitter} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center">
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/042/148/611/non_2x/new-twitter-x-logo-twitter-icon-x-social-media-icon-free-png.png"
                      alt="X"
                      className="h-5 w-auto object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                )}
                {person.social_links?.facebook && (
                  <a href={person.social_links.facebook} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/500px-Facebook_Logo_%282019%29.png"
                      alt="Facebook"
                      className="h-5 w-auto object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <div className="space-y-6">
            <PersonalInfoCard person={person} creditsCount={creditsCount} />
          </div>

          <div className="space-y-8">
            {person.biography && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-3">Biography</h2>
                <p className={`text-gray-300 leading-relaxed whitespace-pre-line ${!showFullBio && 'line-clamp-6'}`}>
                  {person.biography}
                </p>
                {person.biography.length > 500 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-sky-300 hover:text-white font-semibold mt-3"
                    aria-label={showFullBio ? 'Read Less' : 'Read More'}
                  >
                    {showFullBio ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
            )}

            {allWorks.length > 0 && <KnownForCarousel works={allWorks} />}

            {(hasActing || hasSound || hasDirector) && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex gap-6 border-b border-white/10 mb-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`tab-item ${activeTab === 'overview' ? 'tab-item-active' : ''}`}
                    aria-selected={activeTab === 'overview'}
                  >
                    Overview
                  </button>
                  {hasActing && (
                    <button
                      onClick={() => setActiveTab('acting')}
                      className={`tab-item ${activeTab === 'acting' ? 'tab-item-active' : ''}`}
                      aria-selected={activeTab === 'acting'}
                    >
                      Acting
                    </button>
                  )}
                  {hasSound && (
                    <button
                      onClick={() => setActiveTab('sound')}
                      className={`tab-item ${activeTab === 'sound' ? 'tab-item-active' : ''}`}
                      aria-selected={activeTab === 'sound'}
                    >
                      Sound
                    </button>
                  )}
                  {hasDirector && (
                    <button
                      onClick={() => setActiveTab('director')}
                      className={`tab-item ${activeTab === 'director' ? 'tab-item-active' : ''}`}
                      aria-selected={activeTab === 'director'}
                    >
                      Director
                    </button>
                  )}
                </div>

                {activeTab === 'overview' && (
                  <div className="text-center text-gray-400 py-8">
                    Select a department tab to view credits
                  </div>
                )}

                {activeTab === 'acting' && (
                  <div className="space-y-2">
                    {actingCredits.map((credit, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                        className="w-full text-left py-3 px-3 rounded-xl hover:bg-white/5 transition"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-gray-500 text-sm w-12 flex-shrink-0">{credit.year || ''}</span>
                          <div>
                            <p className="text-white font-medium">{credit.title}</p>
                            <p className="text-gray-400 text-sm">as {credit.role}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'sound' && (
                  <div className="space-y-2">
                    {soundCredits.map((credit, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                        className="w-full text-left py-3 px-3 rounded-xl hover:bg-white/5 transition"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-gray-500 text-sm w-12 flex-shrink-0">{credit.year || ''}</span>
                          <div>
                            <p className="text-white font-medium">{credit.title}</p>
                            <p className="text-gray-400 text-sm">{credit.role}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'director' && (
                  <div className="space-y-2">
                    {directorCredits.map((credit, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                        className="w-full text-left py-3 px-3 rounded-xl hover:bg-white/5 transition"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-gray-500 text-sm w-12 flex-shrink-0">{credit.year || ''}</span>
                          <div>
                            <p className="text-white font-medium">{credit.title}</p>
                            <p className="text-gray-400 text-sm">as {credit.role}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;



