import { useState } from 'react';
import { createPerson, uploadImage } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

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
        birthday: formData.birthday,
        place_of_birth: formData.place_of_birth,
        profile_url: profileUrl,
        social_links: {
          instagram: formData.instagram,
          twitter: formData.twitter,
          facebook: formData.facebook
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
    <AdminLayout title="Add Person" subtitle="Create a new cast or crew profile.">
      <form onSubmit={handleSubmit} className="space-y-6 glass-card rounded-2xl p-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 glass-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Biography</label>
          <textarea
            value={formData.biography}
            onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 glass-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Birthday</label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Place of Birth</label>
            <input
              type="text"
              value={formData.place_of_birth}
              onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileFile(e.target.files[0])}
            className="w-full px-4 py-3 glass-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Instagram</label>
            <input
              type="url"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Twitter</label>
            <input
              type="url"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Facebook</label>
            <input
              type="url"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
        </div>

        <button type="submit" className="w-full btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Person'}
        </button>
      </form>
    </AdminLayout>
  );
};

export default AddPerson;
