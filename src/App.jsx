import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GlassNavbar from './components/GlassNavbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import PersonDetail from './pages/PersonDetail';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import TMDBImport from './pages/admin/TMDBImport';
import AddMovie from './pages/admin/AddMovie';
import AddPerson from './pages/admin/AddPerson';
import ManageMovies from './pages/admin/ManageMovies';
import ManageCollections from './pages/admin/ManageCollections';
import UpdatePersons from './pages/admin/UpdatePersons';
import ManageLinks from './pages/admin/ManageLinks';
import ManagePersons from './pages/admin/ManagePersons';
import ManageCrew from './pages/admin/ManageCrew';
import ManageHeroBanner from './pages/admin/ManageHeroBanner';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAvatars from './pages/admin/ManageAvatars';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-shell">
          <GlassNavbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/person/:id" element={<PersonDetail />} />
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
              path="/admin/manage-movies"
              element={(
                <ProtectedRoute adminOnly>
                  <ManageMovies />
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
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
