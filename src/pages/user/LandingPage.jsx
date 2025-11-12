import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const LandingPage = () => {
  const [nowPlaying, setNowPlaying] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counters, setCounters] = useState({
    movies: 0,
    theaters: 0,
    bookings: 0
  });

  // Load movies from API
  useEffect(() => {
    const fetchPlayingNowMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8000/api/v1/movies/playing-now');
        
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          // Ambil hanya 6 movie pertama untuk ditampilkan di landing page
          setNowPlaying(data.data.slice(0, 6));
          
          // Update counter dengan jumlah movies yang sebenarnya
          setCounters(prev => ({
            ...prev,
            movies: data.data.length
          }));
        } else {
          throw new Error('Failed to load movies');
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayingNowMovies();
  }, []);

  // Counter animation
  useEffect(() => {
    const targets = { theaters: 8, bookings: 5420 };
    const duration = 2500;
    const steps = 100;
    const increment = {
      theaters: targets.theaters / steps,
      bookings: targets.bookings / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCounters(prev => ({
        ...prev,
        theaters: Math.min(Math.floor(increment.theaters * currentStep), targets.theaters),
        bookings: Math.min(Math.floor(increment.bookings * currentStep), targets.bookings)
      }));

      if (currentStep >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: "🎬",
      title: "Latest Movies",
      description: "Access the newest and most popular movie collections",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: "💺",
      title: "Seat Selection",
      description: "Choose your favorite seats with real-time seat selection system",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: "🎟️",
      title: "Digital Tickets",
      description: "Secure and easily accessible digital tickets",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: "⭐",
      title: "Premium Experience",
      description: "Enjoy cinema with state-of-the-art technology",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const quickActions = [
    {
      title: "Browse Movies",
      description: "Explore now playing and upcoming films",
      icon: "🎭",
      color: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      link: "/movies"
    },
    {
      title: "Booking History",
      description: "View your ticket booking history",
      icon: "📖",
      color: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      link: "/bookings"
    },
    {
      title: "My Profile",
      description: "Manage your account information",
      icon: "👤",
      color: "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      link: "/profile"
    }
  ];

  // Helper function untuk format duration
  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  // Helper function untuk mendapatkan image URL - FIXED
  const getImageUrl = (posterPath) => {
    // Default fallback image
    const fallbackImage = 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop';
    
    if (!posterPath) {
      return fallbackImage;
    }
    
    // Jika sudah full URL (http/https), gunakan langsung
    if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
      return posterPath;
    }
    
    // Jika relative path dari storage Laravel
    if (posterPath.startsWith('storage/') || posterPath.startsWith('/storage/')) {
      return `http://localhost:8000/${posterPath.replace(/^\//, '')}`;
    }
    
    // Default: anggap sebagai URL external
    return posterPath;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br mt-5 from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      {/* Hero Section */}
      <div id="home" className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-3 rounded-full w-fit border border-white/30">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              GGCinema - Premium Cinema Experience in The City
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300 animate-pulse">
                GGCinema
              </span>
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl max-w-2xl leading-relaxed font-light">
              Discover the ultimate movie experience with state-of-the-art visual and audio quality. 
              Your next cinematic adventure starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/movies" className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl text-lg text-center">
                Book Tickets Now
              </Link>
              <Link to="/about" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 text-center">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} text-white rounded-2xl p-6 sm:p-8 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl group backdrop-blur-sm border border-white/20 block`}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-3xl sm:text-4xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                  {action.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg sm:text-xl mb-2">{action.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose GGCinema
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Join our growing community of movie enthusiasts enjoying premium cinema experiences
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div className="text-center group p-6 rounded-3xl hover:bg-white/50 transition-all duration-300">
            <div className="text-5xl sm:text-6xl font-bold text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
              {counters.movies}+
            </div>
            <div className="text-gray-700 font-semibold text-lg">Movies Available</div>
            <div className="text-gray-500 text-sm mt-2">Updated daily</div>
          </div>
          <div className="text-center group p-6 rounded-3xl hover:bg-white/50 transition-all duration-300">
            <div className="text-5xl sm:text-6xl font-bold text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300">
              {counters.theaters}+
            </div>
            <div className="text-gray-700 font-semibold text-lg">Premium Studios</div>
            <div className="text-gray-500 text-sm mt-2">Comfortable seating</div>
          </div>
          <div className="text-center group p-6 rounded-3xl hover:bg-white/50 transition-all duration-300">
            <div className="text-5xl sm:text-6xl font-bold text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300">
              {counters.bookings.toLocaleString()}+
            </div>
            <div className="text-gray-700 font-semibold text-lg">Tickets Sold</div>
            <div className="text-gray-500 text-sm mt-2">Happy customers</div>
          </div>
        </div>
      </section>

      {/* Now Playing Section */}
      <section id="movies" className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-12">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Now Playing
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
              Catch the latest blockbusters and critically acclaimed films in our premium theaters
            </p>
          </div>
          <Link to="/movies" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2">
            View All Movies
            <span className="text-lg">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
                <div className="h-64 bg-gray-300 rounded-2xl mb-6"></div>
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-12 bg-gray-300 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <div className="text-red-600 text-lg mb-4 font-semibold">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : nowPlaying.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No movies currently playing</p>
            <p className="text-gray-600">Check back soon for new releases!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {nowPlaying.map((movie) => (
              <div
                key={movie.id}
                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:scale-105 group border border-gray-100"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={getImageUrl(movie.poster)}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Age Rating Badge */}
                  {movie.age_rating && (
                    <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-xl text-sm font-bold backdrop-blur-sm border border-white/20">
                      {movie.age_rating}
                    </div>
                  )}
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-xl text-sm backdrop-blur-sm border border-white/20 font-semibold">
                    ⏱️ {formatDuration(movie.duration)}
                  </div>
                  
                  {/* Now Playing Badge */}
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg animate-pulse">
                    NOW PLAYING
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{movie.title}</h3>
                  
                  {movie.director && (
                    <p className="text-gray-500 text-sm mb-2">🎬 {movie.director}</p>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                    <span>🎭</span>
                    <span className="line-clamp-1">{movie.genre || 'Movie'}</span>
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Starting from</span>
                      <span className="text-2xl font-bold text-blue-600">
                        Rp 35.000
                      </span>
                    </div>
                    <Link 
                      to={`/movie/${movie.id}`} 
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-center"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Premium Cinema Experience
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Enjoy the best movie-watching experience with our state-of-the-art facilities and premium services
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:scale-105 group border border-gray-100"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-2xl sm:text-3xl group-hover:rotate-12 transition-transform duration-500 shadow-lg`}>
                {feature.icon}
              </div>
              
              <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                {feature.description}
              </p>
              
              <div className={`h-1.5 w-12 bg-gradient-to-r ${feature.gradient} rounded-full group-hover:w-full transition-all duration-500`}></div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 translate-x-40"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-6 py-3 rounded-full mb-6 border border-white/30">
                  🎉 Limited Time Offer
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                  Special Weekday Pricing!
                </h3>
                <p className="text-orange-100 text-lg sm:text-xl max-w-2xl">
                  Enjoy special discounts on weekday bookings. Book now and save more!
                </p>
              </div>
              
              <Link to="/movies" className="bg-white text-orange-600 hover:bg-gray-100 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl whitespace-nowrap">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 sm:p-12 border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Get the latest movie updates, exclusive offers, and early access to ticket sales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;