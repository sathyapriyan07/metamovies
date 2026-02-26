import { useEffect, useState } from 'react';
import { getWeeklyTrending, upsertTrendingWeekly } from '../../services/supabase';

const ManageTrending = () => {
  const [weekStart, setWeekStart] = useState('');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    entity_type: 'movie',
    entity_id: '',
    score: '',
    metrics: '{}'
  });

  useEffect(() => {
    const monday = new Date();
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    const start = monday.toISOString().split('T')[0];
    setWeekStart(start);
  }, []);

  useEffect(() => {
    if (weekStart) loadTrending();
  }, [weekStart]);

  const loadTrending = async () => {
    const { data } = await getWeeklyTrending(weekStart);
    setItems(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let metrics = {};
    try {
      metrics = JSON.parse(form.metrics || '{}');
    } catch {
      metrics = {};
    }
    await upsertTrendingWeekly({
      entity_type: form.entity_type,
      entity_id: String(form.entity_id),
      week_start: weekStart,
      score: Number(form.score),
      metrics
    });
    setForm({ entity_type: 'movie', entity_id: '', score: '', metrics: '{}' });
    await loadTrending();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
        <h1 className="text-2xl font-bold mb-6">Manage Trending</h1>

        <section className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 mb-6">
          <div className="text-sm text-gray-400 mb-2">Week Start</div>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
          />
        </section>

        <section className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Add / Update Trending</h2>
          <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
            <select
              value={form.entity_type}
              onChange={(e) => setForm((prev) => ({ ...prev, entity_type: e.target.value }))}
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            >
              <option value="movie">Movie</option>
              <option value="person">Person</option>
              <option value="song">Song</option>
            </select>
            <input
              value={form.entity_id}
              onChange={(e) => setForm((prev) => ({ ...prev, entity_id: e.target.value }))}
              placeholder="Entity ID"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
              required
            />
            <input
              value={form.score}
              onChange={(e) => setForm((prev) => ({ ...prev, score: e.target.value }))}
              placeholder="Score"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
              required
            />
            <input
              value={form.metrics}
              onChange={(e) => setForm((prev) => ({ ...prev, metrics: e.target.value }))}
              placeholder='Metrics JSON (e.g. {"views":12})'
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm col-span-2"
            />
            <button className="btn-primary h-10 col-span-2">Save Trending</button>
          </form>
        </section>

        <section className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3">
              <div className="text-sm font-medium">{item.entity_type} #{item.entity_id}</div>
              <div className="text-xs text-gray-400">Score: {item.score}</div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-gray-400">No trending entries yet.</div>}
        </section>
      </div>
    </div>
  );
};

export default ManageTrending;
