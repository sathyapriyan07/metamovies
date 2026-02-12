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
  const [activeTab, setActiveTab] = useState('acting');

  useEffect(() => {
    loadPerson();
  }, [id]);

  useEffect(() => {
    if (person) {
      if (actingCredits.length > 0) setActiveTab('acting');
      else if (soundCredits.length > 0) setActiveTab('sound');
      else if (directorCredits.length > 0) setActiveTab('director');
    }
  }, [person]);

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

  const groupedCredits = (credits) => {
    const grouped = {};
    credits.forEach((credit) => {
      const year = credit.year || 'Unknown';
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(credit);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  };

  return (
    <div className="pb-24 md:pb-12">
      {/* Banner Header */}
      <div className="relative h-[260px] md:h-[300px] overflow-hidden">
        <img
          src={person.profile_url || 'https://via.placeholder.com/1200x600'}
          alt={person.name}
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/75 to-[#05070c]" />
      </div>

      {/* Profile Section */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 -mt-20">
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10 relative z-10">
          <img
            src={person.profile_url || 'https://via.placeholder.com/400x400'}
            alt={person.name}
            className="w-36 h-36 md:w-48 md:h-48 rounded-full border-4 border-black object-cover shadow-2xl mx-auto md:mx-0"
          />
          <div className="pb-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{person.name}</h1>
            <p className="text-gray-400 mt-2">{person.known_for_department || 'Actor'}</p>
            {(person.social_links?.instagram || person.social_links?.twitter || person.social_links?.facebook) && (
              <div className="flex gap-3 mt-4 justify-center md:justify-start">
                {person.social_links?.instagram && (
                  <a href={person.social_links.instagram} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="h-5 w-auto" />
                  </a>
                )}
                {person.social_links?.twitter && (
                  <a href={person.social_links.twitter} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center">
                    <img src="https://static.vecteezy.com/system/resources/previews/042/148/611/non_2x/new-twitter-x-logo-twitter-icon-x-social-media-icon-free-png.png" alt="X" className="h-5 w-auto" />
                  </a>
                )}
                {person.social_links?.facebook && (
                  <a href={person.social_links.facebook} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs flex items-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/500px-Facebook_Logo_%282019%29.png" alt="Facebook" className="h-5 w-auto" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Biography */}
            {person.biography && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-4">Biography</h2>
                <p className={`text-gray-300 leading-relaxed whitespace-pre-line ${!showFullBio && 'line-clamp-4'}`}>
                  {person.biography}
                </p>
                {person.biography.length > 500 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-sky-300 hover:text-white font-semibold mt-3 transition"
                  >
                    {showFullBio ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
            )}

            {/* Known For Carousel */}
            {allWorks.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Known For</h2>
                <KnownForCarousel works={allWorks} />
              </div>
            )}

            {/* Filmography */}
            {(hasActing || hasSound || hasDirector) && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-6">Filmography</h2>
                <div className="flex gap-6 border-b border-white/10 mb-6">
                  {hasActing && (
                    <button
                      onClick={() => setActiveTab('acting')}
                      className={`tab-item ${activeTab === 'acting' ? 'tab-item-active' : ''}`}
                    >
                      Acting
                    </button>
                  )}
                  {hasSound && (
                    <button
                      onClick={() => setActiveTab('sound')}
                      className={`tab-item ${activeTab === 'sound' ? 'tab-item-active' : ''}`}
                    >
                      Sound
                    </button>
                  )}
                  {hasDirector && (
                    <button
                      onClick={() => setActiveTab('director')}
                      className={`tab-item ${activeTab === 'director' ? 'tab-item-active' : ''}`}
                    >
                      Director
                    </button>
                  )}
                </div>

                {activeTab === 'acting' && (
                  <div className="space-y-6">
                    {groupedCredits(actingCredits).map(([year, credits]) => (
                      <div key={year}>
                        <h3 className="text-lg font-semibold text-sky-300 mb-3">{year}</h3>
                        <div className="space-y-2">
                          {credits.map((credit, i) => (
                            <button
                              key={i}
                              onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                              className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 transition"
                            >
                              <p className="text-white font-medium">{credit.title}</p>
                              <p className="text-gray-400 text-sm">as {credit.role}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'sound' && (
                  <div className="space-y-6">
                    {groupedCredits(soundCredits).map(([year, credits]) => (
                      <div key={year}>
                        <h3 className="text-lg font-semibold text-sky-300 mb-3">{year}</h3>
                        <div className="space-y-2">
                          {credits.map((credit, i) => (
                            <button
                              key={i}
                              onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                              className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 transition"
                            >
                              <p className="text-white font-medium">{credit.title}</p>
                              <p className="text-gray-400 text-sm">{credit.role}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'director' && (
                  <div className="space-y-6">
                    {groupedCredits(directorCredits).map(([year, credits]) => (
                      <div key={year}>
                        <h3 className="text-lg font-semibold text-sky-300 mb-3">{year}</h3>
                        <div className="space-y-2">
                          {credits.map((credit, i) => (
                            <button
                              key={i}
                              onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                              className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 transition"
                            >
                              <p className="text-white font-medium">{credit.title}</p>
                              <p className="text-gray-400 text-sm">as {credit.role}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <PersonalInfoCard person={person} creditsCount={creditsCount} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;



