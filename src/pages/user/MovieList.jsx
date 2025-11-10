import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { publicMoviesAPI } from '../admin/adminapiconfig/AdminApiConfig';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const MovieList = () => {
  const [activeTab, setActiveTab] = useState('now-playing');
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState({
    'now-playing': [],
    'coming-soon': [],
    'finished': []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all movies
      const allMoviesResponse = await publicMoviesAPI.getAll();
      const allMovies = allMoviesResponse.data.data || allMoviesResponse.data;

      // Separate movies by status
      const nowPlaying = allMovies.filter(movie => movie.status === 'playing_now');
      const comingSoon = allMovies.filter(movie => movie.status === 'upcoming');
      const finished = allMovies.filter(movie => movie.status === 'archived');

      setMovies({
        'now-playing': nowPlaying,
        'coming-soon': comingSoon,
        'finished': finished
      });
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = useMemo(() => {
    const currentMovies = movies[activeTab] || [];
    if (!searchQuery) return currentMovies;
    
    return currentMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeTab, searchQuery, movies]);

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTabCount = (tabKey) => {
    return movies[tabKey]?.length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg font-semibold">Loading movies...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center bg-white rounded-xl p-8 shadow-lg max-w-md">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchMovies}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Movie Collection</h1>
          <p className="text-gray-600 text-lg">Discover amazing movies at GGCinema</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search movies by title or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-2 shadow-lg inline-flex flex-wrap gap-2">
            {[
              { key: 'now-playing', label: 'Now Playing' },
              { key: 'coming-soon', label: 'Coming Soon' },
              { key: 'finished', label: 'Finished' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all relative ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.label}
                {getTabCount(tab.key) > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key 
                      ? 'bg-white text-blue-600' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {getTabCount(tab.key)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map(movie => (
              <div key={movie.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <img 
                    src={movie.poster || 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400'} 
                    alt={movie.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400';
                    }}
                  />
                  {activeTab === 'now-playing' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      NOW PLAYING
                    </div>
                  )}
                  {activeTab === 'coming-soon' && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      COMING SOON
                    </div>
                  )}
                  {activeTab === 'finished' && (
                    <div className="absolute top-2 right-2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      FINISHED
                    </div>
                  )}
                  
                  {/* Age Rating Badge */}
                  {movie.age_rating && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                      {movie.age_rating}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 h-14">
                    {movie.title}
                  </h3>
                  
                  <div className="space-y-2 mb-3">
                    {movie.genre && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>🎭</span>
                        <span className="line-clamp-1">{movie.genre}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>⏱️</span>
                      <span>{formatDuration(movie.duration)}</span>
                    </div>
                    
                    {movie.director && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>🎬</span>
                        <span className="line-clamp-1">{movie.director}</span>
                      </div>
                    )}
                  </div>
                  
                  {activeTab === 'now-playing' && (
                    <>
                      <div className="flex items-center justify-between mb-3 pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-500">Starting from</span>
                        <span className="text-blue-600 font-bold text-lg">Rp 35.000</span>
                      </div>
                      <Link 
                        to={`/movie/${movie.id}`}
                        className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
                      >
                        Book Now
                      </Link>
                    </>
                  )}
                  
                  {activeTab === 'coming-soon' && (
                    <>
                      {movie.release_date && (
                        <div className="mb-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold">
                            <span>📅</span>
                            <span>Release: {new Date(movie.release_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}</span>
                          </div>
                        </div>
                      )}
                      <button className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed">
                        Coming Soon
                      </button>
                    </>
                  )}
                  
                  {activeTab === 'finished' && (
                    <>
                      <div className="mb-3 pt-3 border-t border-gray-200">
                        <div className="text-center text-gray-500 text-sm">
                          No longer showing in theaters
                        </div>
                      </div>
                      <button className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold cursor-not-allowed">
                        No Longer Available
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <span className="text-6xl mb-4 block">🎬</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Movies Found</h3>
            <p className="text-gray-500 text-lg mb-4">
              {searchQuery 
                ? `No movies match "${searchQuery}"`
                : `No movies available in ${activeTab === 'now-playing' ? 'Now Playing' : activeTab === 'coming-soon' ? 'Coming Soon' : 'Finished'} category`
              }
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {!searchQuery && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-3xl font-bold text-green-600">{movies['now-playing'].length}</div>
              <div className="text-gray-600">Now Playing</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">📅</div>
              <div className="text-3xl font-bold text-orange-600">{movies['coming-soon'].length}</div>
              <div className="text-gray-600">Coming Soon</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-3xl font-bold text-gray-600">{movies['finished'].length}</div>
              <div className="text-gray-600">Archived</div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default MovieList;