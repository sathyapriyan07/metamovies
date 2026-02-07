import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonById } from '../services/supabase';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

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
    ...(person.cast_roles?.map(c => ({ ...c.movie || c.series, type: c.movie ? 'movie' : 'series', role: c.character })) || []),
    ...(person.crew_roles?.map(c => ({ ...c.movie || c.series, type: c.movie ? 'movie' : 'series', role: c.job })) || [])
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="md:w-1/3">
            <img
              src={person.profile_url || 'https://via.placeholder.com/400x600'}
              alt={person.name}
              className="w-full rounded-xl shadow-2xl"
            />
            
            {/* Social Icons */}
            {person.social_links && (
              <div className="flex gap-4 mt-6 justify-center">
                {person.social_links.instagram && (
                  <a href={person.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-red-500">
                    📷
                  </a>
                )}
                {person.social_links.twitter && (
                  <a href={person.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-red-500">
                    🐦
                  </a>
                )}
                {person.social_links.facebook && (
                  <a href={person.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-red-500">
                    📘
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{person.name}</h1>

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-2 ${activeTab === 'about' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400'}`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('filmography')}
                  className={`pb-2 ${activeTab === 'filmography' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400'}`}
                >
                  Filmography
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                {person.birthday && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-400">Birthday</h3>
                    <p>{person.birthday}</p>
                  </div>
                )}
                {person.place_of_birth && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-400">Place of Birth</h3>
                    <p>{person.place_of_birth}</p>
                  </div>
                )}
                {person.biography && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-400">Biography</h3>
                    <p className="text-gray-300 whitespace-pre-line">{person.biography}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'filmography' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allWorks.map((work, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/${work.type}/${work.id}`)}
                    className="cursor-pointer hover:scale-105 transition"
                  >
                    <img
                      src={work.poster_url || 'https://via.placeholder.com/300x450'}
                      alt={work.title}
                      className="w-full h-64 object-cover rounded-lg mb-2"
                    />
                    <p className="font-semibold text-sm">{work.title}</p>
                    <p className="text-xs text-gray-400">{work.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
