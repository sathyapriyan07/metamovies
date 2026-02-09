import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonById } from '../services/supabase';
import PersonalInfoCard from '../components/PersonalInfoCard';
import PosterCard from '../components/PosterCard';

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

  const loadPerson = async () => {
    setLoading(true);
    const { data } = await getPersonById(id);
    setPerson(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (!person) return <div className="min-h-screen flex items-center justify-center">Person not found</div>;

  const allWorks = [
    ...(person.cast_roles?.map(c => ({ ...c.movie || c.series, type: c.movie ? 'movie' : 'series', role: c.character, year: (c.movie || c.series)?.release_date?.split('-')[0] })) || []),
    ...(person.crew_roles?.map(c => ({ ...c.movie || c.series, type: c.movie ? 'movie' : 'series', role: c.job, year: (c.movie || c.series)?.release_date?.split('-')[0] })) || [])
  ].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 15);

  const creditsCount = (person.cast_roles?.length || 0) + (person.crew_roles?.length || 0);

  // Acting credits
  const actingCredits = (person.cast_roles || []).map(c => ({
    ...c.movie || c.series,
    type: c.movie ? 'movie' : 'series',
    role: c.character,
    year: (c.movie || c.series)?.release_date?.split('-')[0]
  })).sort((a, b) => (b.year || '0') - (a.year || '0'));

  // Sound/Music credits
  const soundJobs = ['Original Music Composer', 'Music Composer', 'Composer', 'Score', 'Soundtrack', 'Music'];
  const soundCredits = (person.crew_roles || []).filter(c => 
    soundJobs.some(job => c.job?.includes(job))
  ).map(c => ({
    ...c.movie || c.series,
    type: c.movie ? 'movie' : 'series',
    role: c.job,
    year: (c.movie || c.series)?.release_date?.split('-')[0]
  })).sort((a, b) => (b.year || '0') - (a.year || '0'));

  // Determine visible tabs
  const hasActing = actingCredits.length > 0;
  const hasSound = soundCredits.length > 0;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8 bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-[250px_1fr] gap-8">
          {/* Left Column - Profile Image & Info */}
          <div className="space-y-6">
            {/* Centered Profile Image */}
            <div className="flex justify-center">
              <img
                src={person.profile_url || 'https://via.placeholder.com/400x600'}
                alt={`${person.name} profile`}
                className="w-64 h-64 object-cover rounded-3xl shadow-2xl"
              />
            </div>
            
            {/* Centered Name */}
            <h1 className="text-3xl font-bold text-center">{person.name}</h1>
            
            {/* Centered Social Icons */}
            {person.social_links && (
              <div className="flex gap-4 justify-center">
                {person.social_links.instagram && (
                  <a href={person.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-red-500 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {person.social_links.twitter && (
                  <a href={person.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-red-500 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {person.social_links.facebook && (
                  <a href={person.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-red-500 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
            
            <PersonalInfoCard person={person} creditsCount={creditsCount} />
          </div>

          {/* Right Column - Biography & Known For */}
          <div className="space-y-8">

            {/* Biography */}
            {person.biography && (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Biography</h2>
                <p className={`text-gray-300 leading-relaxed whitespace-pre-line ${!showFullBio && 'line-clamp-6'}`}>
                  {person.biography}
                </p>
                {person.biography.length > 500 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-red-500 hover:underline font-semibold"
                    aria-label={showFullBio ? 'Read Less' : 'Read More'}
                  >
                    {showFullBio ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
            )}

            {/* Known For Row */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Known For</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {allWorks.map((work, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/${work.type}/${work.id}`)}
                    className="flex-shrink-0 w-[110px] md:w-[140px] cursor-pointer hover:scale-105 transition-transform"
                  >
                    <img
                      src={work.poster_url || 'https://via.placeholder.com/140x210'}
                      alt={work.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                      loading="lazy"
                    />
                    <p className="font-semibold text-sm line-clamp-2">{work.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Tabs */}
            {(hasActing || hasSound) && (
              <div className="space-y-6">
                {/* Tab Bar */}
                <div className="glass rounded-lg p-1 flex gap-2 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                      activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    aria-selected={activeTab === 'overview'}
                  >
                    Overview
                  </button>
                  {hasActing && (
                    <button
                      onClick={() => setActiveTab('acting')}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                        activeTab === 'acting' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                      aria-selected={activeTab === 'acting'}
                    >
                      Acting
                    </button>
                  )}
                  {hasSound && (
                    <button
                      onClick={() => setActiveTab('sound')}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                        activeTab === 'sound' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                      aria-selected={activeTab === 'sound'}
                    >
                      Sound
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div className="glass rounded-xl p-4 md:p-6 max-h-[600px] overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="text-center text-gray-400 py-8">
                      Select a department tab to view credits
                    </div>
                  )}

                  {activeTab === 'acting' && (
                    <div className="space-y-1">
                      {actingCredits.map((credit, i) => (
                        <div
                          key={i}
                          onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                          className="py-3 px-2 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-gray-500 text-sm w-12 flex-shrink-0">{credit.year || '—'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium">{credit.title}</p>
                              <p className="text-gray-400 text-sm">as {credit.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'sound' && (
                    <div className="space-y-1">
                      {soundCredits.map((credit, i) => (
                        <div
                          key={i}
                          onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                          className="py-3 px-2 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-gray-500 text-sm w-12 flex-shrink-0">{credit.year || '—'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium">{credit.title}</p>
                              <p className="text-gray-400 text-sm">{credit.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
