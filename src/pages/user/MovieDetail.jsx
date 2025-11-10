import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const MovieDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Fetch movie detail and schedules
  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch movie detail
        const movieResponse = await fetch(`http://localhost:8000/api/v1/movies/${id}`);
        
        if (!movieResponse.ok) {
          throw new Error('Movie not found');
        }

        const movieData = await movieResponse.json();
        
        if (movieData.status === 'success') {
          setMovie(movieData.data);

          // Fetch schedules for this movie
          try {
            const schedulesResponse = await fetch(`http://localhost:8000/api/v1/movies/${id}/schedules`);
            const schedulesData = await schedulesResponse.json();
            
            if (schedulesData.status === 'success') {
              setSchedules(schedulesData.data);
            }
          } catch (schedError) {
            console.error('Error fetching schedules:', schedError);
            // Don't throw error, just show movie without schedules
          }
        } else {
          throw new Error('Failed to load movie details');
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id]);

  // Get movie poster URL
  const getPosterUrl = (posterPath) => {
    const fallback = 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&h=500&fit=crop';
    
    if (!posterPath) return fallback;
    
    if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
      return posterPath;
    }
    
    if (posterPath.startsWith('storage/') || posterPath.startsWith('/storage/')) {
      return `http://localhost:8000/${posterPath.replace(/^\//, '')}`;
    }
    
    return posterPath;
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get minimum price from schedules

const getMinPrice = () => {

    if (!Array.isArray(schedules) || schedules.length === 0) {
        return 35000; // default
    }

    const prices = schedules.map(schedule => 
        Math.min(schedule.price_weekday || 0, schedule.price_weekend || 0)
    ).filter(price => price > 0);
    
    return prices.length > 0 ? Math.min(...prices) : 35000;
};

  // Get YouTube embed URL from trailer URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url; // Return as is if already embed URL
  };

  // Handler untuk book now button
  const handleBookNow = () => {
    if (!isLoggedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to book tickets',
        showCancelButton: true,
        confirmButtonText: 'Login Now',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login', { state: { from: `/movie/${id}` } });
        }
      });
      return;
    }
    
    // Check if schedules available
    if (schedules.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Schedules Available',
        text: 'This movie currently has no available showtimes. Please check back later.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }
    
    // Jika sudah login, lanjut ke booking
    navigate(`/booking/${movie.id}`);
  };

  // Handler untuk choose showtimes
  const handleChooseShowtimes = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        html: 'You need to login first to view showtimes and book tickets.<br><br>🎟️ <strong>Join GGCinema today!</strong>',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Register',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#10b981',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login', { state: { from: `/movie/${id}` } });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate('/register', { state: { from: `/movie/${id}` } });
        }
      });
    } else if (schedules.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Schedules Available',
        text: 'This movie currently has no available showtimes. Please check back later.',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  // Handle watch trailer
  const handleWatchTrailer = () => {
    if (movie.trailer_url) {
      window.open(movie.trailer_url, '_blank');
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Trailer Not Available',
        text: 'Trailer for this movie is not available yet.',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="w-full px-4 sm:px-6 lg:px-8 py-20 animate-pulse">
          <div className="max-w-7xl mx-auto">
            <div className="h-96 bg-gray-300 rounded-3xl mb-12"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-6"></div>
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-10"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2">
                <div className="h-40 bg-gray-200 rounded-xl mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              </div>
              <div className="bg-gray-200 rounded-xl p-6 h-56"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-20 px-4">
            <div className="text-6xl mb-6">🎬</div>
            <h1 className="text-4xl font-bold text-red-600 mb-4">Movie Not Found</h1>
            <p className="text-gray-600 text-lg mb-6">
              {error || 'The movie you are looking for is not available.'}
            </p>
            <Link 
              to="/movies" 
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Browse All Movies
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const minPrice = getMinPrice();
  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailer_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />

      {/* Hero Section Detail Film */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white pt-20 pb-16 overflow-hidden shadow-2xl">
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: `url(${getPosterUrl(movie.poster)})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            filter: 'blur(30px) brightness(0.7)'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Poster */}
            <div className="w-56 h-80 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 transform hover:scale-105 transition-transform duration-300">
              <img
                src={getPosterUrl(movie.poster)}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&h=500&fit=crop';
                }}
              />
            </div>

            {/* Info Dasar */}
            <div className="text-center md:text-left">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full w-fit mb-4 border border-white/30">
                {movie.status === 'playing_now' && (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Now Playing
                  </>
                )}
                {movie.status === 'upcoming' && (
                  <>
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                    Coming Soon
                  </>
                )}
                {movie.status === 'archived' && (
                  <>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Archived
                  </>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight">
                {movie.title}
              </h1>
              
              <p className="text-blue-200 text-lg mb-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                {movie.genre && <span>{movie.genre}</span>}
                {movie.genre && movie.duration && <span>•</span>}
                {movie.duration && <span>{formatDuration(movie.duration)}</span>}
                {movie.release_date && (
                  <>
                    <span>•</span>
                    <span>{formatDate(movie.release_date)}</span>
                  </>
                )}
              </p>

              {/* Age Rating */}
              {movie.age_rating && (
                <div className="inline-block bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 px-4 py-2 rounded-lg text-sm font-bold mb-4">
                  {movie.age_rating}
                </div>
              )}
              
              {/* Tombol Aksi Utama */}
              {movie.status === 'playing_now' && (
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                  <button 
                    onClick={handleBookNow}
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl text-lg flex items-center gap-2"
                  >
                    <span className="text-xl">🎟️</span> 
                    Book Now - Rp {minPrice.toLocaleString('id-ID')}
                  </button>
                  {movie.trailer_url && (
                    <button 
                      onClick={handleWatchTrailer}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                      <span className="text-xl">▶️</span> Watch Trailer
                    </button>
                  )}
                </div>
              )}

              {movie.status === 'upcoming' && (
                <div className="mt-6">
                  <div className="inline-block bg-orange-500/20 backdrop-blur-sm border border-orange-400/40 rounded-xl p-4">
                    <p className="text-orange-200 flex items-center gap-2">
                      <span className="text-2xl">📅</span>
                      <span>Coming to theaters on {formatDate(movie.release_date)}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Login Notice */}
              {!isLoggedIn && movie.status === 'playing_now' && (
                <div className="mt-6 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/40 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <p className="text-sm text-yellow-100">
                    <strong>Login required</strong> to book tickets and view showtimes
                  </p>
                </div>
              )}

              {/* Schedules Info */}
              {schedules.length > 0 && (
                <div className="mt-4 bg-green-500/20 backdrop-blur-sm border border-green-400/40 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-sm text-green-100">
                    <strong>{schedules.length} showtimes</strong> available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Konten Utama Detail Film */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Kolom Kiri: Sinopsis & Trailer */}
          <div className="lg:col-span-2">
            
            {/* Sinopsis */}
            {movie.description && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2 border-indigo-100">
                  Synopsis
                </h2>
                <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                  {movie.description}
                </p>
              </div>
            )}

            {/* Trailer Video */}
            {trailerEmbedUrl && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2 border-indigo-100">
                  Official Trailer
                </h2>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    className="w-full h-96 rounded-2xl shadow-2xl"
                    src={trailerEmbedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

          </div>

          {/* Kolom Kanan: Info Tambahan & Jadwal Tayang */}
          <div className="lg:col-span-1">

            {/* Info Tambahan (Director, Cast) */}
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-200 mb-12">
              <h2 className="text-2xl font-bold text-blue-800 mb-6">
                Movie Info
              </h2>
              <div className="space-y-4 text-gray-800">
                {movie.director && (
                  <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="text-blue-600">🎬</span> Director:
                    </span>
                    <span className="font-medium text-right">{movie.director}</span>
                  </div>
                )}
                {movie.release_date && (
                  <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="text-blue-600">🗓️</span> Release:
                    </span>
                    <span className="font-medium text-right">{formatDate(movie.release_date)}</span>
                  </div>
                )}
                {movie.duration && (
                  <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="text-blue-600">⏱️</span> Duration:
                    </span>
                    <span className="font-medium text-right">{formatDuration(movie.duration)}</span>
                  </div>
                )}
                {movie.genre && (
                  <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="text-blue-600">🎭</span> Genre:
                    </span>
                    <span className="font-medium text-right">{movie.genre}</span>
                  </div>
                )}
                {movie.age_rating && (
                  <div className="flex justify-between items-start">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="text-blue-600">🔞</span> Age Rating:
                    </span>
                    <span className="font-medium text-right">{movie.age_rating}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Jadwal Tayang (Call to Action) */}
            {movie.status === 'playing_now' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {schedules.length > 0 ? 'Check Showtimes' : 'No Showtimes Yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {schedules.length > 0 
                    ? 'View available schedules and book your tickets now!'
                    : 'Showtimes for this movie will be available soon.'}
                </p>
                
                {isLoggedIn ? (
                  schedules.length > 0 ? (
                    <Link 
                      to={`/booking/${movie.id}`} 
                      className="block w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                    >
                      Choose Showtimes & Seats →
                    </Link>
                  ) : (
                    <div className="bg-gray-100 text-gray-600 px-8 py-4 rounded-xl font-semibold">
                      Coming Soon
                    </div>
                  )
                ) : (
                  <button
                    onClick={handleChooseShowtimes}
                    className="block w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">🔒</span>
                      Login to View Showtimes
                    </span>
                  </button>
                )}

                {/* Additional notice for non-logged users */}
                {!isLoggedIn && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      New to GGCinema? 
                      <Link to="/register" className="font-bold hover:underline ml-1">
                        Sign up now
                      </Link> and get exclusive benefits! 🎁
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MovieDetailPage;