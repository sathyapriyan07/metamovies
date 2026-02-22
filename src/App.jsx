import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Movies from './pages/Movies';
import Platforms from './pages/Platforms';
import PlatformDetail from './pages/PlatformDetail';
import MovieDetail from './pages/MovieDetail';
import CastCrew from './pages/CastCrew';
import PersonDetail from './pages/PersonDetail';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import Watch from './pages/Watch';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import TMDBImport from './pages/admin/TMDBImport';
import AddMovie from './pages/admin/AddMovie';
import AddPerson from './pages/admin/AddPerson';
import AddVideo from './pages/admin/AddVideo';
import AddNews from './pages/admin/AddNews';
import ManageMovies from './pages/admin/ManageMovies';
import ManageVideos from './pages/admin/ManageVideos';
import ManageNews from './pages/admin/ManageNews';
import ManageCollections from './pages/admin/ManageCollections';
import UpdatePersons from './pages/admin/UpdatePersons';
import ManageLinks from './pages/admin/ManageLinks';
import ManagePersons from './pages/admin/ManagePersons';
import ManageCrew from './pages/admin/ManageCrew';
import ManageHeroBanner from './pages/admin/ManageHeroBanner';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAvatars from './pages/admin/ManageAvatars';
import ManagePlatforms from './pages/admin/ManagePlatforms';

function AppRoutes() {
  const Layout = ({ children }) => (
    <div className="min-h-screen overflow-x-hidden bg-[#0f0f0f] text-white">
      <Header />
      <main className="pt-16">{children}</main>
    </div>
  );

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/platforms" element={<Platforms />} />
        <Route path="/platforms/:id" element={<PlatformDetail />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/movie/:id/cast-crew" element={<CastCrew />} />
        <Route path="/person/:id" element={<PersonDetail />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/videos/:id" element={<VideoDetail />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/profile"
          element={(
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/watchlist"
          element={(
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin"
          element={(
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/tmdb-import"
          element={(
            <ProtectedRoute adminOnly>
              <TMDBImport />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/add-movie"
          element={(
            <ProtectedRoute adminOnly>
              <AddMovie />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/add-person"
          element={(
            <ProtectedRoute adminOnly>
              <AddPerson />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/add-video"
          element={(
            <ProtectedRoute adminOnly>
              <AddVideo />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/add-news"
          element={(
            <ProtectedRoute adminOnly>
              <AddNews />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/manage-movies"
          element={(
            <ProtectedRoute adminOnly>
              <ManageMovies />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/videos"
          element={(
            <ProtectedRoute adminOnly>
              <ManageVideos />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/news"
          element={(
            <ProtectedRoute adminOnly>
              <ManageNews />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/manage-collections"
          element={(
            <ProtectedRoute adminOnly>
              <ManageCollections />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/update-persons"
          element={(
            <ProtectedRoute adminOnly>
              <UpdatePersons />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/manage-links"
          element={(
            <ProtectedRoute adminOnly>
              <ManageLinks />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/manage-persons"
          element={(
            <ProtectedRoute adminOnly>
              <ManagePersons />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/manage-crew"
          element={(
            <ProtectedRoute adminOnly>
              <ManageCrew />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/manage-hero-banner"
          element={(
            <ProtectedRoute adminOnly>
              <ManageHeroBanner />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/manage-users"
          element={(
            <ProtectedRoute adminOnly>
              <ManageUsers />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/manage-avatars"
          element={(
            <ProtectedRoute adminOnly>
              <ManageAvatars />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin/manage-platforms"
          element={(
            <ProtectedRoute adminOnly>
              <ManagePlatforms />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


