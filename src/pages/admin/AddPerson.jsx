import { useState } from 'react';
import { createPerson, uploadImage } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

const AddPerson = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    birthday: '',
    place_of_birth: '',
    instagram: '',
    twitter: '',
    facebook: ''
  });
  const [profileFile, setProfileFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileUrl = null;

      if (profileFile) {
        const { data } = await uploadImage(profileFile, 'profiles', `${Date.now()}_${profileFile.name}`);
        profileUrl = data;
      }

      const personData = {
        name: formData.name,
        biography: formData.biography,
        birthday: formData.birthday || null,
        place_of_birth: formData.place_of_birth || null,
        profile_url: profileUrl,
        social_links: {
          instagram: formData.instagram || null,
          twitter: formData.twitter || null,
          facebook: formData.facebook || null
        }
      };

      await createPerson(personData);
      navigate('/admin');
    } catch (error) {
      alert('Failed to create person');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Add Person</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Biography</label>
            <textarea
              value={formData.biography}
              onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Birthday</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Place of Birth</label>
              <input
                type="text"
                value={formData.place_of_birth}
                onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileFile(e.target.files[0])}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Social Links</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="https://instagram.com/username"
                  className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Twitter</label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="https://twitter.com/username"
                  className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Facebook</label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="https://facebook.com/username"
                  className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-3" disabled={loading}>
            {loading ? 'Creating...' : 'Create Person'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPerson;
