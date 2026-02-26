import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { getReleasesByRange, getPlatforms } from '../services/supabase';

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

const ReleaseCalendar = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date());
  const [releases, setReleases] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [filters, setFilters] = useState({ language: '', platformId: '' });
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => getMonthRange(month), [month]);

  useEffect(() => {
    loadPlatforms();
  }, []);

  useEffect(() => {
    loadReleases();
  }, [range.start, range.end, filters.language, filters.platformId]);

  const loadPlatforms = async () => {
    const { data } = await getPlatforms({ activeOnly: true });
    setPlatforms(data || []);
  };

  const loadReleases = async () => {
    setLoading(true);
    const { data } = await getReleasesByRange(range.start, range.end, {
      language: filters.language || null,
      platformId: filters.platformId || null
    });
    setReleases(data || []);
    setLoading(false);
  };

  const grouped = releases.reduce((acc, item) => {
    const key = item.release_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    cells.push(date);
  }

  const goToPrev = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const goToNext = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SeoHead title="Release Calendar - MetaMovies+" description="Upcoming theatre and OTT releases." />
      <div className="max-w-2xl mx-auto px-4 pb-10 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Release Calendar</h1>
          <div className="flex gap-2">
            <button className="btn-secondary h-9 px-3" onClick={goToPrev}>Prev</button>
            <button className="btn-secondary h-9 px-3" onClick={goToNext}>Next</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <input
            value={filters.language}
            onChange={(e) => setFilters((prev) => ({ ...prev, language: e.target.value }))}
            placeholder="Filter language"
            className="h-11 bg-[#1a1a1a] border border-gray-800 rounded-md px-3 text-sm"
          />
          <select
            value={filters.platformId}
            onChange={(e) => setFilters((prev) => ({ ...prev, platformId: e.target.value }))}
            className="h-11 bg-[#1a1a1a] border border-gray-800 rounded-md px-3 text-sm"
          >
            <option value="">All Platforms</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>{platform.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs text-gray-400 text-center">{d}</div>
            ))}
            {cells.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="h-24 bg-transparent" />;
              const dayKey = date.toISOString().split('T')[0];
              const items = grouped[dayKey] || [];
              return (
                <div key={dayKey} className="min-h-[120px] rounded-md border border-gray-800 bg-[#121212] p-2">
                  <div className="text-xs text-gray-400">{date.getDate()}</div>
                  <div className="mt-2 space-y-2">
                    {items.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        className="w-full text-left text-xs bg-[#1a1a1a] rounded-md px-2 py-1"
                        onClick={() => navigate(`/movie/${item.movie?.id}`)}
                      >
                        <div className="truncate">{item.movie?.title || 'Untitled'}</div>
                        <div className="text-[10px] text-gray-400">
                          {item.release_type === 'ott' ? item.platform?.name || 'OTT' : 'Theatre'}
                        </div>
                      </button>
                    ))}
                    {items.length === 0 && <div className="text-[10px] text-gray-600">No releases</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReleaseCalendar;
