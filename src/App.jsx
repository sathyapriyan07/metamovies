import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import MovieDetail from './pages/MovieDetail';
import SeriesDetail from './pages/SeriesDetail';
import PersonDetail from './pages/PersonDetail';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Signup from './pages/Signup';

import AdminDashboard from './pages/admin/AdminDashboard';
import TMDBImport from './pages/admin/TMDBImport';
import AddMovie from './pages/admin/AddMovie';
import AddSeries from './pages/admin/AddSeries';
import AddPerson from './pages/admin/AddPerson';
import ManageMovies from './pages/admin/ManageMovies';
import ManageSeries from './pages/admin/ManageSeries';
import ManageCollections from './pages/admin/ManageCollections';
import UpdatePersons from './pages/admin/UpdatePersons';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/series/:id" element={<SeriesDetail />} />
            <Route path="/person/:id" element={<PersonDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/tmdb-import" element={
              <ProtectedRoute adminOnly>
                <TMDBImport />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/add-movie" element={
              <ProtectedRoute adminOnly>
                <AddMovie />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/add-series" element={
              <ProtectedRoute adminOnly>
                <AddSeries />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/add-person" element={
              <ProtectedRoute adminOnly>
                <AddPerson />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/manage-movies" element={
              <ProtectedRoute adminOnly>
                <ManageMovies />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/manage-series" element={
              <ProtectedRoute adminOnly>
                <ManageSeries />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/manage-collections" element={
              <ProtectedRoute adminOnly>
                <ManageCollections />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/update-persons" element={
              <ProtectedRoute adminOnly>
                <UpdatePersons />
              </ProtectedRoute>
            } />
          </Routes>
          <MobileNav />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
