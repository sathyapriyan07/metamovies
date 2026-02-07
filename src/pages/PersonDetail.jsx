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
