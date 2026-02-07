# MetaMovies - Quick Reference Guide

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔑 Environment Setup

Create `.env` file:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
VITE_TMDB_API_KEY=xxxxx
```

## 📝 Common Tasks

### Add a New Page

1. Create file in `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`:
```jsx
<Route path="/your-path" element={<YourPage />} />
```

### Create Protected Route

```jsx
<Route path="/protected" element={
  <ProtectedRoute>
    <YourPage />
  </ProtectedRoute>
} />
```

### Create Admin-Only Route

```jsx
<Route path="/admin/something" element={
  <ProtectedRoute adminOnly>
    <YourPage />
  </ProtectedRoute>
} />
```

### Add New Component

```jsx
// src/components/YourComponent.jsx
const YourComponent = ({ prop1, prop2 }) => {
  return (
    <div className="glass-dark p-4 rounded-xl">
      {/* Your content */}
    </div>
  );
};

export default YourComponent;
```

### Use Watchlist Hook

```jsx
import { useWatchlist } from '../hooks/useWatchlist';

const YourComponent = () => {
  const { watchlist, addItem, removeItem, checkInWatchlist } = useWatchlist();
  
  const handleAdd = async () => {
    await addItem(movieId, 'movie');
  };
  
  return <button onClick={handleAdd}>Add to Watchlist</button>;
};
```

### Use Auth Context

```jsx
import { useAuth } from '../context/AuthContext';

const YourComponent = () => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Welcome {user.email}</div>;
};
```

### Fetch from Supabase

```jsx
import { getMovies } from '../services/supabase';

const YourComponent = () => {
  const [movies, setMovies] = useState([]);
  
  useEffect(() => {
    const loadMovies = async () => {
      const { data } = await getMovies(20, 0);
      setMovies(data);
    };
    loadMovies();
  }, []);
  
  return <div>{/* Display movies */}</div>;
};
```

### Fetch from TMDB

```jsx
import { getMovieDetails } from '../services/tmdb';

const fetchMovie = async (tmdbId) => {
  const movie = await getMovieDetails(tmdbId);
  console.log(movie);
};
```

### Upload Image to Supabase

```jsx
import { uploadImage } from '../services/supabase';

const handleUpload = async (file) => {
  const { data: url, error } = await uploadImage(
    file,
    'posters', // bucket name
    `${Date.now()}_${file.name}` // file path
  );
  
  if (url) {
    console.log('Image URL:', url);
  }
};
```

## 🎨 Styling Quick Reference

### Glassmorphism

```jsx
<div className="glass">Light glass effect</div>
<div className="glass-dark">Dark glass effect</div>
```

### Buttons

```jsx
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>
```

### Poster Card

```jsx
<div className="poster-card">
  <img src={posterUrl} alt="Title" />
</div>
```

### Skeleton Loading

```jsx
<div className="skeleton h-64 w-48" />
```

### Common Layouts

```jsx
// Grid Layout
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
  {items.map(item => <PosterCard key={item.id} item={item} />)}
</div>

// Horizontal Scroll
<div className="flex gap-4 overflow-x-auto pb-4">
  {items.map(item => <PosterCard key={item.id} item={item} />)}
</div>

// Container
<div className="container mx-auto px-4">
  {/* Content */}
</div>
```

## 🗄️ Database Quick Reference

### Query Movies

```sql
-- Get all movies
SELECT * FROM movies ORDER BY created_at DESC;

-- Get trending movies
SELECT * FROM movies WHERE trending = true;

-- Get movies with cast
SELECT m.*, c.character, p.name
FROM movies m
JOIN cast c ON m.id = c.movie_id
JOIN persons p ON c.person_id = p.id;
```

### Insert Movie

```sql
INSERT INTO movies (title, overview, release_date, rating, poster_url, backdrop_url, genres)
VALUES ('Movie Title', 'Overview...', '2024-01-01', 8.5, 'url', 'url', ARRAY['Action', 'Drama']);
```

### Create Admin User

```sql
-- After user signs up, update their metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

## 🔧 Troubleshooting

### Clear Supabase Cache

```jsx
// In browser console
localStorage.clear();
location.reload();
```

### Check Auth State

```jsx
import { supabase } from './services/supabase';

supabase.auth.getSession().then(({ data }) => {
  console.log('Session:', data);
});
```

### Debug API Calls

```jsx
// Add to service functions
console.log('Request:', params);
const { data, error } = await supabase.from('movies').select('*');
console.log('Response:', data, error);
```

## 📱 Responsive Breakpoints

```jsx
// Tailwind breakpoints
sm: 640px   // Small devices
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large devices
2xl: 1536px // 2X Extra large devices

// Usage
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

## 🎯 Common Patterns

### Loading State

```jsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    const { data } = await fetchData();
    setData(data);
    setLoading(false);
  };
  loadData();
}, []);

if (loading) return <SkeletonRow />;
```

### Error Handling

```jsx
const [error, setError] = useState('');

try {
  await someOperation();
} catch (err) {
  setError(err.message);
}

{error && (
  <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg">
    {error}
  </div>
)}
```

### Form Handling

```jsx
const [formData, setFormData] = useState({ title: '', overview: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  await createMovie(formData);
};

<input
  value={formData.title}
  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
/>
```

## 🔗 Useful Links

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [TMDB API Docs](https://developers.themoviedb.org)
- [React Router](https://reactrouter.com)

## 💡 Tips

1. **Use React DevTools** - Install browser extension for debugging
2. **Check Console** - Always check browser console for errors
3. **Test Responsive** - Use browser DevTools device mode
4. **Supabase Logs** - Check Supabase dashboard for database errors
5. **TMDB Rate Limits** - Be aware of API rate limits (40 requests/10 seconds)

## 🎓 Code Examples

### Navigate Programmatically

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/movies');
navigate(`/movie/${id}`);
```

### Get URL Parameters

```jsx
import { useParams } from 'react-router-dom';

const { id } = useParams();
```

### Conditional Rendering

```jsx
{user ? (
  <button onClick={handleLogout}>Logout</button>
) : (
  <Link to="/login">Login</Link>
)}

{isAdmin && <Link to="/admin">Admin Panel</Link>}
```

---

**Keep this file handy for quick reference while developing!**
