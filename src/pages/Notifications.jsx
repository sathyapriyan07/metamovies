import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/supabase';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    const { data } = await getNotifications(user.id);
    setItems(data || []);
    setLoading(false);
  };

  const handleOpen = async (notification) => {
    await markNotificationRead(notification.id, user.id);
    if (notification.entity_type === 'movie') {
      navigate(`/movie/${notification.entity_id}`);
      return;
    }
    if (notification.entity_type === 'person') {
      navigate(`/person/${notification.entity_id}`);
      return;
    }
    if (notification.entity_type === 'news') {
      navigate(`/news/${notification.entity_id}`);
      return;
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead(user.id);
    await loadNotifications();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Login to view notifications.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SeoHead title="Notifications - MetaMovies+" description="Your activity notifications." />
      <div className="max-w-2xl mx-auto px-4 pb-10 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <button className="text-sm text-[#F5C518]" onClick={handleMarkAll}>Mark all read</button>
        </div>
        {loading ? (
          <p className="py-6">Loading...</p>
        ) : (
          <div className="py-6 space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                className={`w-full text-left rounded-md p-3 border ${item.read_at ? 'border-gray-800 bg-[#1a1a1a]' : 'border-[#F5C518] bg-[#1f1a0c]'}`}
                onClick={() => handleOpen(item)}
              >
                <div className="text-sm font-medium">{item.payload?.title || 'Notification'}</div>
                <div className="text-xs text-gray-400 mt-1">{item.payload?.message || item.type}</div>
              </button>
            ))}
            {items.length === 0 && <div className="text-sm text-gray-400">No notifications yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
