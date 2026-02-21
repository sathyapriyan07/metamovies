import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { getPersonDetails, getImageUrl } from '../../services/tmdb';
import AdminLayout from '../../components/AdminLayout';

const UpdatePersons = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [updated, setUpdated] = useState(0);

  const handleUpdateAll = async () => {
    if (!confirm('This will fetch full details for all persons from TMDB. Continue?')) return;
    
    setLoading(true);
    setProgress('Fetching persons...');
    
    // Get all persons with tmdb_id
    const { data: persons } = await supabase
      .from('persons')
      .select('id, tmdb_id, name')
      .not('tmdb_id', 'is', null);
    
    setProgress(`Found ${persons?.length || 0} persons. Updating...`);
    let count = 0;
    
    for (const person of persons || []) {
      try {
        // Fetch full details from TMDB
        const details = await getPersonDetails(person.tmdb_id);
        
        // Update person in database
        await supabase
          .from('persons')
          .update({
            biography: details.biography,
            birthday: details.birthday,
            place_of_birth: details.place_of_birth,
            profile_url: getImageUrl(details.profile_path),
            social_links: {
              instagram: details.external_ids?.instagram_id ? `https://instagram.com/${details.external_ids.instagram_id}` : null,
              twitter: details.external_ids?.twitter_id ? `https://twitter.com/${details.external_ids.twitter_id}` : null,
              facebook: details.external_ids?.facebook_id ? `https://facebook.com/${details.external_ids.facebook_id}` : null
            }
          })
          .eq('id', person.id);
        
        count++;
        setUpdated(count);
        setProgress(`Updated ${count}/${persons.length}: ${person.name}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Failed to update ${person.name}:`, error);
      }
    }
    
    setProgress(`Complete! Updated ${count} persons.`);
    setLoading(false);
  };

  return (
    <AdminLayout title="Update Persons" subtitle="Refresh cast and crew metadata from TMDB.">
      <div className="glass-card rounded-2xl p-6">

        <div className="glass-dark p-6 rounded-xl">
          <p className="mb-4">
            This will fetch complete information (biography, birthday, place of birth, social links) 
            for all persons from TMDB and update the database.
          </p>
          
          {progress && (
            <div className="bg-blue-500/20 border border-blue-500 text-blue-500 px-4 py-3 rounded-lg mb-4">
              {progress}
            </div>
          )}
          
          {updated > 0 && (
            <div className="text-green-500 mb-4">
              Updated: {updated} persons
            </div>
          )}

          <button
            onClick={handleUpdateAll}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Updating...' : 'Update All Persons'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdatePersons;


