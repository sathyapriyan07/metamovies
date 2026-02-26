import { useState } from 'react';
import { upsertPageMeta, upsertSlug } from '../../services/supabase';

const ManageSEO = () => {
  const [slugForm, setSlugForm] = useState({
    entity_type: 'movie',
    entity_id: '',
    slug: ''
  });
  const [metaForm, setMetaForm] = useState({
    entity_type: 'movie',
    entity_id: '',
    title: '',
    description: '',
    jsonld: '{}'
  });

  const handleSlugSubmit = async (e) => {
    e.preventDefault();
    await upsertSlug({
      entity_type: slugForm.entity_type,
      entity_id: String(slugForm.entity_id),
      slug: slugForm.slug
    });
    setSlugForm({ entity_type: 'movie', entity_id: '', slug: '' });
  };

  const handleMetaSubmit = async (e) => {
    e.preventDefault();
    let jsonld = null;
    try {
      jsonld = JSON.parse(metaForm.jsonld || '{}');
    } catch {
      jsonld = {};
    }
    await upsertPageMeta({
      entity_type: metaForm.entity_type,
      entity_id: String(metaForm.entity_id),
      title: metaForm.title || null,
      description: metaForm.description || null,
      jsonld
    });
    setMetaForm({ entity_type: 'movie', entity_id: '', title: '', description: '', jsonld: '{}' });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
        <h1 className="text-2xl font-bold mb-6">Manage SEO</h1>

        <section className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Slugs</h2>
          <form className="grid grid-cols-2 gap-3" onSubmit={handleSlugSubmit}>
            <select
              value={slugForm.entity_type}
              onChange={(e) => setSlugForm((prev) => ({ ...prev, entity_type: e.target.value }))}
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            >
              <option value="movie">Movie</option>
              <option value="person">Person</option>
              <option value="song">Song</option>
              <option value="album">Album</option>
              <option value="platform">Platform</option>
              <option value="news">News</option>
            </select>
            <input
              value={slugForm.entity_id}
              onChange={(e) => setSlugForm((prev) => ({ ...prev, entity_id: e.target.value }))}
              placeholder="Entity ID"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
              required
            />
            <input
              value={slugForm.slug}
              onChange={(e) => setSlugForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="Slug"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm col-span-2"
              required
            />
            <button className="btn-primary h-10 col-span-2">Save Slug</button>
          </form>
        </section>

        <section className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-3">Page Meta</h2>
          <form className="grid grid-cols-2 gap-3" onSubmit={handleMetaSubmit}>
            <select
              value={metaForm.entity_type}
              onChange={(e) => setMetaForm((prev) => ({ ...prev, entity_type: e.target.value }))}
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            >
              <option value="movie">Movie</option>
              <option value="person">Person</option>
              <option value="song">Song</option>
              <option value="album">Album</option>
              <option value="platform">Platform</option>
              <option value="news">News</option>
            </select>
            <input
              value={metaForm.entity_id}
              onChange={(e) => setMetaForm((prev) => ({ ...prev, entity_id: e.target.value }))}
              placeholder="Entity ID"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
              required
            />
            <input
              value={metaForm.title}
              onChange={(e) => setMetaForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Meta title"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm col-span-2"
            />
            <input
              value={metaForm.description}
              onChange={(e) => setMetaForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Meta description"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm col-span-2"
            />
            <textarea
              value={metaForm.jsonld}
              onChange={(e) => setMetaForm((prev) => ({ ...prev, jsonld: e.target.value }))}
              placeholder='JSON-LD'
              rows={4}
              className="bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm col-span-2"
            />
            <button className="btn-primary h-10 col-span-2">Save Meta</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ManageSEO;
