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

            {/* Music Platform Links */}
            {person.music_links && (person.music_links.spotify || person.music_links.apple_music || person.music_links.youtube_music) && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Listen on Music Platforms</h3>
                <div className="flex flex-wrap gap-3">
                  {person.music_links.spotify && (
                    <a href={person.music_links.spotify} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Spotify
                    </a>
                  )}
                  {person.music_links.apple_music && (
                    <a href={person.music_links.apple_music} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.7.164c-.517-.093-1.038-.135-1.564-.15-.04-.003-.083-.01-.124-.013H5.988c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.106 1.597-.35 2.296-.81a5.28 5.28 0 0 0 1.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76 1.035-1.36 1.322-.63.302-1.29.405-1.97.332-.655-.07-1.227-.306-1.72-.706-.677-.55-1.03-1.264-1.1-2.107-.08-.98.27-1.85 1.03-2.52.48-.423 1.05-.685 1.68-.816.48-.1.97-.14 1.46-.16.48-.02.96 0 1.51 0v-4.74c0-.068-.007-.127-.048-.188-.05-.075-.11-.087-.19-.08-.48.05-.96.1-1.44.16-1.07.14-2.14.28-3.21.43-.27.04-.55.06-.82.1-.14.02-.27.06-.39.16-.07.06-.09.14-.09.22v8.1c0 .42-.06.83-.25 1.21-.29.59-.76 1.04-1.36 1.33-.63.3-1.29.4-1.97.33-.66-.07-1.23-.31-1.72-.71-.68-.55-1.03-1.27-1.1-2.11-.08-.98.27-1.85 1.03-2.52.48-.42 1.05-.68 1.68-.81.48-.1.97-.14 1.46-.16.48-.02.96 0 1.51 0V6.47c0-.21.03-.21.21-.18.48.06.95.12 1.43.18l2.39.31c.97.13 1.94.26 2.91.39.35.04.71.08 1.06.13.28.04.43.2.43.49v5.29z"/>
                      </svg>
                      Apple Music
                    </a>
                  )}
                  {person.music_links.youtube_music && (
                    <a href={person.music_links.youtube_music} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/>
                      </svg>
                      YouTube Music
                    </a>
                  )}
                </div>
              </div>
            )}

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
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
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
