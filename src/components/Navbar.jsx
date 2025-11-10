import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/api/v1/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (e) {
          console.error('Error fetching user data:', e);
        }
      }
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Custom event for login/logout
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  // Scroll handler for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    
    if (!confirmed) {
      return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
      // Call logout API
      await fetch('http://localhost:8000/api/v1/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setProfileDropdownOpen(false);
      
      // Dispatch custom event
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect to home
      navigate('/');
    }
  };


  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full h-18 z-50 backdrop-blur-md transition-all duration-700 ease-out ${
          scrolled
            ? "bg-white/95 shadow-xl text-black border-b border-gray-100"
            : "bg-gradient-to-r from-blue-600/90 via-blue-700/90 to-indigo-800/90 text-white border-b border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative overflow-hidden rounded-xl p-2 bg-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                  GG
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl tracking-tight">GGCinema</h1>
                <p className={`text-xs font-medium tracking-wide transition-colors ${
                  scrolled ? 'text-gray-500' : 'text-white/70'
                }`}>
                  Premium Theater
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`relative px-4 py-2 font-medium text-sm tracking-wide rounded-lg transition-all duration-300 group ${
                  scrolled 
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Home
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-8 transition-all duration-300 rounded-full"></div>
              </Link>

              {/* About Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setAboutDropdownOpen(!aboutDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className={`relative px-4 py-2 font-medium text-sm tracking-wide rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    scrolled
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md'
                      : 'text-white hover:bg-white/10'
                  } ${aboutDropdownOpen && !scrolled ? 'bg-white/10' : ''}`}
                >
                  About
                  <svg
                    className={`w-4 h-4 transition-all duration-300 ${
                      aboutDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {aboutDropdownOpen && (
                  <div className="absolute top-full mt-3 left-0 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-3">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Learn More</p>
                    </div>
                    
                    <Link
                      to="/about"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 transition-all duration-200 group"
                      onClick={() => setAboutDropdownOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">About Us</p>
                        <p className="text-xs text-gray-500">Our story</p>
                      </div>
                    </Link>

                    <Link
                      to="/contact"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-200 group"
                      onClick={() => setAboutDropdownOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Contact</p>
                        <p className="text-xs text-gray-500">Get in touch</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Buy Ticket Button */}
              <Link 
                to="/movies"
                className={`hidden sm:block relative px-6 py-2.5 font-bold text-sm rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 ${
                  scrolled
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                    : "bg-white/20 hover:bg-orange-500 text-white backdrop-blur-sm border border-white/30"
                }`}
              >
                <span className="relative z-10">Buy Ticket</span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setAboutDropdownOpen(false);
                  }}
                  className="relative group"
                >
                  <div className={`relative w-10 h-10 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                    scrolled
                      ? "ring-2 ring-gray-200 group-hover:ring-purple-400 group-hover:shadow-lg group-hover:shadow-purple-300/50"
                      : "ring-2 ring-white/30 group-hover:ring-purple-400 group-hover:shadow-lg group-hover:shadow-purple-500/50"
                  }`}>
                    {user?.photo ? (
                      <img 
                        src={user.photo.startsWith('http') ? user.photo : `http://localhost:8000/${user.photo}`} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm"><span>${user.name[0].toUpperCase()}</span></div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10">{user ? user.name[0].toUpperCase() : '?'}</span>
                      </div>
                    )}
                  </div>

                  {user && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg">
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute top-full mt-3 right-0 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-3">
                    {user ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <div className="mt-2 px-2 py-1 bg-green-100 rounded-lg inline-flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-medium text-green-700">Online</span>
                          </div>
                        </div>

                        {/* My Profile */}
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-700 transition-all duration-200 group"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span>My Profile</span>
                        </Link>

                        {/* My Ticket */}
                        <Link
                          to="/Ticket"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-pink-100 hover:text-pink-700 transition-all duration-200 group"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                            <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                          <span>My Tickets</span>
                        </Link>
                        
                        <hr className="my-2 border-gray-100" />
                        
                        {/* Sign Out */}
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Guest User */}
                        <div className="px-4 py-3 border-b border-gray-100 text-center">
                          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-2">
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <p className="font-semibold text-gray-900">Welcome!</p>
                          <p className="text-xs text-gray-500">Please sign in to continue</p>
                        </div>

                        {/* Create Account */}
                        <Link
                          to="/register"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 transition-all duration-200 group"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Create Account</p>
                            <p className="text-xs text-gray-500">Join us today</p>
                          </div>
                        </Link>
                                                  
                        {/* Sign In */}
                        <Link
                          to="/login"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Sign In</p>
                            <p className="text-xs text-blue-400">Access your account</p>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/10">
              <Link to="/" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/movies" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>Movies</Link>
              <Link to="/about" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link to="/contact" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              
              {user && (
                <>
                  <hr className="my-2 border-white/10" />
                  <Link to="/profile" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                  <Link to="/ticket" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(false)}>My Ticket</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-red-400">Sign Out</button>
                </>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;