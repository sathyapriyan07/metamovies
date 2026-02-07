import { useState, useEffect } from 'react';
import { getWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export const useWatchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    } else {
      setWatchlist([]);
      setLoading(false);
    }
  }, [user]);

  const loadWatchlist = async () => {
    setLoading(true);
    const { data } = await getWatchlist(user.id);
    setWatchlist(data || []);
    setLoading(false);
  };

  const addItem = async (itemId, itemType) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await addToWatchlist(user.id, itemId, itemType);
    if (!error) await loadWatchlist();
    return { error };
  };

  const removeItem = async (itemId, itemType) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await removeFromWatchlist(user.id, itemId, itemType);
    if (!error) await loadWatchlist();
    return { error };
  };

  const checkInWatchlist = async (itemId, itemType) => {
    if (!user) return false;
    return await isInWatchlist(user.id, itemId, itemType);
  };

  return { watchlist, loading, addItem, removeItem, checkInWatchlist };
};
