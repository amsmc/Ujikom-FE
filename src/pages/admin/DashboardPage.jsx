import React, { useState, useEffect } from 'react';
import { moviesAPI, schedulesAPI, studiosAPI, usersAPI, seatsAPI, formatCurrency, isWeekend } from '../admin/adminapiconfig/AdminApiConfig';
import Swal from 'sweetalert2';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalSchedules: 0,
    totalStudios: 0,
    totalUsers: 0,
  });

  // Modal states
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showAddStudio, setShowAddStudio] = useState(false);
  const [editingStudio, setEditingStudio] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showManageSeats, setShowManageSeats] = useState(null);

  // Data states
  const [movies, setMovies] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [studios, setStudios] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    fetchAllData();
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMovies(),
        fetchSchedules(),
        fetchStudios(),
        fetchUsers(),
      ]);
      Swal.fire({
        icon: 'success',
        title: 'Data Loaded',
        text: 'All data has been successfully loaded',
        timer: 2000,
        showConfirmButton: false,
        background: '#1f2937',
        color: '#f9fafb'
      });
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await moviesAPI.getAll();
      const data = response.data.data || response.data;
      setMovies(data);
      setStats(prev => ({ ...prev, totalMovies: data.length }));
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await schedulesAPI.getAll();
      const data = response.data.data || response.data;
      setSchedules(data);
      setStats(prev => ({ ...prev, totalSchedules: data.length }));
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchStudios = async () => {
    try {
      const response = await studiosAPI.getAll();
      const data = response.data.data || response.data;
      setStudios(data);
      setStats(prev => ({ ...prev, totalStudios: data.length }));
    } catch (error) {
      console.error('Error fetching studios:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      const data = response.data.data || response.data;
      setUsers(data);
      setStats(prev => ({ ...prev, totalUsers: data.length }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const showSuccess = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonColor: '#3b82f6',
      background: '#1f2937',
      color: '#f9fafb',
      iconColor: '#10b981'
    });
  };

  const showError = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: message,
      confirmButtonColor: '#ef4444',
      background: '#1f2937',
      color: '#f9fafb',
      iconColor: '#ef4444'
    });
  };

  const showConfirm = (title, text, confirmCallback) => {
    Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'Cancel',
      background: '#1f2937',
      color: '#f9fafb',
      iconColor: '#f59e0b'
    }).then((result) => {
      if (result.isConfirmed) {
        confirmCallback();
      }
    });
  };

  const handleLogout = () => {
    showConfirm('Logout Confirmation', 'Are you sure you want to logout?', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status) => {
    const config = {
      playing_now: { color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', label: 'Now Playing' },
      upcoming: { color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', label: 'Upcoming' },
      archived: { color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30', label: 'Archived' },
    };
    const selected = config[status] || config.upcoming;
    return <span className={`${selected.color} px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>{selected.label}</span>;
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: { color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30', label: 'Admin' },
      cashier: { color: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', label: 'Cashier' },
      customer: { color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30', label: 'Customer' },
    };
    const selected = config[role] || config.customer;
    return <span className={`${selected.color} px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>{selected.label}</span>;
  };

  // Overview Tab
  const renderOverview = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          icon="🎬" 
          title="Total Movies" 
          value={stats.totalMovies} 
          subtitle="Active movies" 
          color="purple" 
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard 
          icon="📅" 
          title="Schedules" 
          value={stats.totalSchedules} 
          subtitle="Active schedules" 
          color="emerald" 
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard 
          icon="🏢" 
          title="Studios" 
          value={stats.totalStudios} 
          subtitle="Cinema studios" 
          color="blue" 
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard 
          icon="👥" 
          title="Users" 
          value={stats.totalUsers} 
          subtitle="Registered users" 
          color="orange" 
          gradient="from-orange-500 to-amber-500"
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <QuickAccessCard 
          title="Recent Movies" 
          items={movies.slice(0, 4)} 
          onViewAll={() => setActiveTab('movies')}
          icon="🎬"
          color="purple"
        />
        <QuickAccessCard 
          title="Upcoming Schedules" 
          items={schedules.slice(0, 4)} 
          onViewAll={() => setActiveTab('schedules')}
          icon="📅"
          color="blue"
        />
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-700">
        <h3 className="text-lg lg:text-xl font-bold text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 lg:w-3 lg:h-3 bg-emerald-400 rounded-full animate-pulse"></span>
          System Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
          <StatusItem label="API" status="online" />
          <StatusItem label="Database" status="online" />
          <StatusItem label="Storage" status="online" />
          {/* <StatusItem label="Security" status="online" /> */}
        </div>
      </div>
    </div>
  );

  // Movies Tab
  const renderMovies = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Movies Management</h2>
          <p className="text-gray-400 text-sm lg:text-base">Manage all movies in your cinema</p>
        </div>
        <button 
          onClick={() => setShowAddMovie(true)} 
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <span>+</span> Add Movie
        </button>
      </div>

      <DataTable
        columns={['Title', 'Status', 'Genre', 'Duration', 'Release Date', 'Actions']}
        data={movies}
        renderRow={(movie) => (
          <tr key={movie.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
            <td className="py-3 px-3 lg:py-4 lg:px-6">
              <div>
                <p className="font-semibold text-white text-sm lg:text-base">{movie.title}</p>
                <p className="text-xs lg:text-sm text-gray-400">{movie.director || 'N/A'}</p>
              </div>
            </td>
            <td className="py-3 px-3 lg:py-4 lg:px-6">
              <div className="flex justify-center lg:block">
                {getStatusBadge(movie.status)}
              </div>
            </td>
            <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-300 text-sm lg:text-base">{movie.genre || 'N/A'}</td>
            <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-300 text-sm lg:text-base">{formatDuration(movie.duration)}</td>
            <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-300 text-sm lg:text-base">{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</td>
            <td className="py-3 px-3 lg:py-4 lg:px-6">
              <ActionButtons
                onEdit={() => setEditingMovie(movie)}
                onDelete={() => handleDeleteMovie(movie.id)}
              />
            </td>
          </tr>
        )}
        loading={loading}
        emptyMessage="No movies found"
      />
    </div>
  );

  // Schedules Tab
  const renderSchedules = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Schedules Management</h2>
          <p className="text-gray-400 text-sm lg:text-base">Manage movie schedules and pricing</p>
        </div>
        <button 
          onClick={() => setShowAddSchedule(true)} 
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <span>+</span> Add Schedule
        </button>
      </div>

      <DataTable
        columns={['Movie', 'Studio', 'Date', 'Time', 'Weekday', 'Weekend', 'Actions']}
        data={schedules}
        renderRow={(schedule) => (
          <tr key={schedule.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
            <td className="py-3 px-3 lg:py-4 lg:px-6">
              <p className="font-semibold text-white text-sm lg:text-base">{schedule.movie?.title || 'N/A'}</p>
            </td>
            <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-300 text-sm lg:text-base">{schedule.studio?.name || 'N/A'}</td>
            <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-300 text-sm lg:text-base whitespace-nowrap">
              {new Date(schedule.date).toLocaleDateString()}
            </td>
            <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-300 text-sm lg:text-base">{schedule.showtime}</td>
            <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-300 text-sm lg:text-base">{formatCurrency(schedule.price_weekday)}</td>
            <td className="py-3 px-3 lg:py-4 lg:px-6">
              <span className="font-semibold text-amber-400 text-sm lg:text-base">{formatCurrency(schedule.price_weekend)}</span>
            </td>
            <td className="py-3 px-3 lg:py-4 lg:px-6">
              <ActionButtons
                onEdit={() => setEditingSchedule(schedule)}
                onDelete={() => handleDeleteSchedule(schedule.id)}
              />
            </td>
          </tr>
        )}
        loading={loading}
        emptyMessage="No schedules found"
      />
    </div>
  );

  // Studios Tab
  const renderStudios = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Studios Management</h2>
          <p className="text-gray-400 text-sm lg:text-base">Manage cinema studios and seats</p>
        </div>
        <button 
          onClick={() => setShowAddStudio(true)} 
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <span>+</span> Add Studio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {studios.map((studio) => (
          <div key={studio.id} className="bg-gray-800 rounded-xl lg:rounded-2xl border border-gray-700 p-4 lg:p-6 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg lg:text-xl font-bold text-white">{studio.name}</h3>
                <p className="text-xs lg:text-sm text-gray-400 mt-1 line-clamp-2">{studio.description || 'No description'}</p>
              </div>
              <span className="text-xl lg:text-2xl bg-gray-700 p-2 lg:p-3 rounded-xl ml-2">🏢</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-gray-400">Capacity:</span>
                <span className="font-semibold text-white">{studio.capacity} seats</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-gray-400">Total Seats:</span>
                <span className="font-semibold text-white">{studio.seats_count || 0} configured</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowManageSeats(studio)} 
                className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-2 lg:px-4 lg:py-2 rounded-lg hover:bg-blue-500/30 transition-colors text-xs lg:text-sm font-medium"
              >
                Manage Seats
              </button>
              <button 
                onClick={() => setEditingStudio(studio)} 
                className="bg-gray-700 text-gray-300 p-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDeleteStudio(studio.id)} 
                className="bg-red-500/20 text-red-400 border border-red-500/30 p-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Users Tab
  const renderUsers = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white">Users Management</h2>
          <p className="text-gray-400 text-sm lg:text-base">Manage system users and roles</p>
        </div>
        <button 
          onClick={() => setShowAddUser(true)} 
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <span>+</span> Add User
        </button>
      </div>

      <DataTable
        columns={['Name', 'Email', 'Role', 'Created', 'Actions']}
        data={users}
        renderRow={(user) => (
          <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
            <td className="py-3 px-3 lg:py-4 lg:px-6">
              <p className="font-semibold text-white text-sm lg:text-base">{user.name}</p>
            </td>
            <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-300 text-sm lg:text-base break-all">{user.email}</td>
            <td className="py-3 px-3 lg:py-4 lg:px-6">
              <div className="flex justify-center lg:block">
                {getRoleBadge(user.role)}
              </div>
            </td>
            <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-300 text-sm lg:text-base whitespace-nowrap">
              {new Date(user.created_at).toLocaleDateString()}
            </td>
            <td className="py-3 px-3 lg:py-4 lg:px-6">
              <ActionButtons
                onEdit={() => setEditingUser(user)}
                onDelete={() => handleDeleteUser(user.id)}
              />
            </td>
          </tr>
        )}
        loading={loading}
        emptyMessage="No users found"
      />
    </div>
  );

  // Delete Handlers dengan SweetAlert2
  const handleDeleteMovie = async (id) => {
    showConfirm('Delete Movie', 'Are you sure you want to delete this movie? This action cannot be undone.', async () => {
      try {
        await moviesAPI.delete(id);
        showSuccess('Movie deleted successfully!');
        fetchMovies();
      } catch (error) {
        showError('Failed to delete movie: ' + error.message);
      }
    });
  };

  const handleDeleteSchedule = async (id) => {
    showConfirm('Delete Schedule', 'Are you sure you want to delete this schedule? This action cannot be undone.', async () => {
      try {
        await schedulesAPI.delete(id);
        showSuccess('Schedule deleted successfully!');
        fetchSchedules();
      } catch (error) {
        showError('Failed to delete schedule: ' + error.message);
      }
    });
  };

  const handleDeleteStudio = async (id) => {
    showConfirm('Delete Studio', 'Are you sure you want to delete this studio? This action cannot be undone.', async () => {
      try {
        await studiosAPI.delete(id);
        showSuccess('Studio deleted successfully!');
        fetchStudios();
      } catch (error) {
        showError('Failed to delete studio: ' + error.message);
      }
    });
  };

  const handleDeleteUser = async (id) => {
    showConfirm('Delete User', 'Are you sure you want to delete this user? This action cannot be undone.', async () => {
      try {
        await usersAPI.delete(id);
        showSuccess('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        showError('Failed to delete user: ' + error.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header onLogout={handleLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-0 transition-all duration-300">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'movies' && renderMovies()}
          {activeTab === 'schedules' && renderSchedules()}
          {activeTab === 'studios' && renderStudios()}
          {activeTab === 'users' && renderUsers()}
        </main>
      </div>

      {/* Modals */}
      {showAddMovie && <MovieModal onClose={() => setShowAddMovie(false)} onSuccess={fetchMovies} movies={movies} studios={studios} />}
      {editingMovie && <MovieModal movie={editingMovie} onClose={() => setEditingMovie(null)} onSuccess={fetchMovies} movies={movies} studios={studios} />}
      {showAddSchedule && <ScheduleModal onClose={() => setShowAddSchedule(false)} onSuccess={fetchSchedules} movies={movies} studios={studios} />}
      {editingSchedule && <ScheduleModal schedule={editingSchedule} onClose={() => setEditingSchedule(null)} onSuccess={fetchSchedules} movies={movies} studios={studios} />}
      {showAddStudio && <StudioModal onClose={() => setShowAddStudio(false)} onSuccess={fetchStudios} />}
      {editingStudio && <StudioModal studio={editingStudio} onClose={() => setEditingStudio(null)} onSuccess={fetchStudios} />}
      {showAddUser && <UserModal onClose={() => setShowAddUser(false)} onSuccess={fetchUsers} />}
      {editingUser && <UserModal user={editingUser} onClose={() => setEditingUser(null)} onSuccess={fetchUsers} />}
      {showManageSeats && <SeatsModal studio={showManageSeats} onClose={() => setShowManageSeats(null)} />}
    </div>
  );
};

// Reusable Components dengan design modern dan responsive
const Header = ({ onLogout, onMenuToggle }) => (
  <header className="bg-gray-800 border-b border-gray-700 shadow-xl">
    <div className="px-4 lg:px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg lg:text-xl">G</span>
        </div>
        <div>
          <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            GGCinema Admin
          </h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">Cinema Management System</p>
        </div>
      </div>
      <button 
        onClick={onLogout} 
        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 group text-sm lg:text-base"
      >
        <span className="group-hover:rotate-90 transition-transform">🚪</span> 
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  </header>
);

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const tabs = [
    { id: 'overview', label: '📊 Overview', desc: 'Dashboard analytics', icon: '📊' },
    { id: 'movies', label: '🎬 Movies', desc: 'Movie management', icon: '🎬' },
    { id: 'schedules', label: '📅 Schedules', desc: 'Showtime schedules', icon: '📅' },
    { id: 'studios', label: '🏢 Studios', desc: 'Studio & seat setup', icon: '🏢' },
    { id: 'users', label: '👥 Users', desc: 'User management', icon: '👥' },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      w-64 lg:w-80 bg-gray-800 min-h-screen border-r border-gray-700 shadow-xl
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-4 lg:p-6 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              onClose();
            }}
            className={`w-full text-left p-3 lg:p-4 rounded-xl transition-all duration-300 group ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transform scale-105 text-white'
                : 'hover:bg-gray-700 text-gray-300 hover:scale-105 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg lg:text-xl">{tab.icon}</span>
              <div className="text-left">
                <div className="font-semibold text-base lg:text-lg">{tab.label}</div>
                <div className={`text-xs lg:text-sm mt-1 ${activeTab === tab.id ? 'text-purple-100' : 'text-gray-400'}`}>
                  {tab.desc}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

const StatCard = ({ icon, title, value, subtitle, color, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden`}>
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs lg:text-sm font-medium">{title}</p>
          <p className="text-xl lg:text-3xl font-bold text-white mt-1 lg:mt-2">{value}</p>
          <p className="text-white/60 text-xs mt-1">{subtitle}</p>
        </div>
        <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <span className="text-lg lg:text-2xl">{icon}</span>
        </div>
      </div>
    </div>
    <div className="absolute top-0 right-0 w-12 h-12 lg:w-20 lg:h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6 lg:-translate-y-10 lg:translate-x-10"></div>
    <div className="absolute bottom-0 left-0 w-8 h-8 lg:w-16 lg:h-16 bg-white/10 rounded-full translate-y-4 -translate-x-4 lg:translate-y-8 lg:-translate-x-8"></div>
  </div>
);

const QuickAccessCard = ({ title, items, onViewAll, icon, color }) => (
  <div className="bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-300">
    <div className="flex justify-between items-center mb-4 lg:mb-6">
      <div className="flex items-center gap-2 lg:gap-3">
        <span className="text-xl lg:text-2xl">{icon}</span>
        <h2 className="text-lg lg:text-xl font-bold text-white">{title}</h2>
      </div>
      <button onClick={onViewAll} className="text-blue-400 hover:text-blue-300 text-xs lg:text-sm font-medium transition-colors">
        View All →
      </button>
    </div>
    <div className="space-y-2 lg:space-y-3">
      {items.slice(0, 4).map((item, idx) => (
        <div key={idx} className="p-2 lg:p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group">
          <p className="font-semibold text-white text-xs lg:text-sm group-hover:text-blue-300 transition-colors truncate">
            {item.title || item.name || 'N/A'}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const StatusItem = ({ label, status }) => (
  <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-gray-700/50 rounded-lg">
    <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
    <div>
      <p className="text-white text-xs lg:text-sm font-medium">{label}</p>
      <p className="text-gray-400 text-xs capitalize">{status}</p>
    </div>
  </div>
);

const DataTable = ({ columns, data, renderRow, loading, emptyMessage }) => (
  <div className="bg-gray-800 rounded-xl lg:rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] lg:min-w-full">
        <thead className="bg-gray-700">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="text-left py-3 px-3 lg:py-4 lg:px-6 font-semibold text-gray-300 text-xs lg:text-sm">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center">
                <div className="flex justify-center">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-gray-400 text-sm lg:text-base">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(renderRow)
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const ActionButtons = ({ onEdit, onDelete }) => (
  <div className="flex items-center gap-1 lg:gap-2">
    <button 
      onClick={onEdit} 
      className="text-blue-400 hover:text-blue-300 p-1 lg:p-2 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
    >
      ✏️
    </button>
    <button 
      onClick={onDelete} 
      className="text-red-400 hover:text-red-300 p-1 lg:p-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
    >
      🗑️
    </button>
  </div>
);

// Modal Components dengan design modern dan responsive
const Modal = ({ title, children, onClose, size = 'default' }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 lg:p-4 z-50 backdrop-blur-sm">
    <div className={`bg-gray-800 rounded-xl lg:rounded-2xl w-full ${size === 'large' ? 'max-w-4xl lg:max-w-6xl' : 'max-w-2xl lg:max-w-4xl'} max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl`}>
      <div className="p-4 lg:p-8">
        <div className="flex justify-between items-center mb-4 lg:mb-8">
          <h2 className="text-xl lg:text-3xl font-bold text-white">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-xl lg:text-2xl p-1 lg:p-2 hover:bg-gray-700 rounded-xl transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const Input = ({ label, name, type = 'text', value, onChange, required, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-sm lg:text-base"
    />
  </div>
);

const Textarea = ({ label, name, value, onChange, rows, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-sm lg:text-base"
    />
  </div>
);

const Select = ({ label, name, value, onChange, required, options }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm lg:text-base"
    >
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value} className="bg-gray-700">{opt.label}</option>
      ))}
    </select>
  </div>
);

const ModalButtons = ({ onCancel, submitText, submitting }) => (
  <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 pt-4 lg:pt-6 border-t border-gray-700">
    <button 
      type="button" 
      onClick={onCancel} 
      disabled={submitting} 
      className="flex-1 px-4 lg:px-6 py-3 lg:py-4 border border-gray-600 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm lg:text-base"
    >
      Cancel
    </button>
    <button 
      type="submit" 
      disabled={submitting} 
      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 text-sm lg:text-base"
    >
      {submitting ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </div>
      ) : (
        submitText
      )}
    </button>
  </div>
);

// Movie Modal Component - Responsive
const MovieModal = ({ movie, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    genre: '',
    age_rating: '',
    release_date: '',
    status: 'upcoming',
    poster: '',
    trailer_url: '',
    director: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        duration: movie.duration || '',
        genre: movie.genre || '',
        age_rating: movie.age_rating || '',
        release_date: movie.release_date || '',
        status: movie.status || 'upcoming',
        poster: movie.poster || '',
        trailer_url: movie.trailer_url || '',
        director: movie.director || ''
      });
    }
  }, [movie]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...formData, duration: parseInt(formData.duration) };
      if (movie) {
        await moviesAPI.update(movie.id, data);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Movie updated successfully!',
          confirmButtonColor: '#3b82f6',
          background: '#1f2937',
          color: '#f9fafb'
        });
      } else {
        await moviesAPI.create(data);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Movie added successfully!',
          confirmButtonColor: '#3b82f6',
          background: '#1f2937',
          color: '#f9fafb'
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed: ' + error.message,
        confirmButtonColor: '#ef4444',
        background: '#1f2937',
        color: '#f9fafb'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={movie ? 'Edit Movie' : 'Add New Movie'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <Input label="Title *" name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          <Input label="Director" name="director" value={formData.director} onChange={(e) => setFormData({...formData, director: e.target.value})} />
          <Input label="Duration (min) *" name="duration" type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
          <Input label="Genre *" name="genre" value={formData.genre} onChange={(e) => setFormData({...formData, genre: e.target.value})} required />
          <Select label="Age Rating" name="age_rating" value={formData.age_rating} onChange={(e) => setFormData({...formData, age_rating: e.target.value})} options={[
            { value: '', label: 'Select' },
            { value: 'G', label: 'G' },
            { value: 'PG', label: 'PG' },
            { value: 'PG-13', label: 'PG-13' },
            { value: 'R', label: 'R' }
          ]} />
          <Input label="Release Date" name="release_date" type="date" value={formData.release_date} onChange={(e) => setFormData({...formData, release_date: e.target.value})} />
          <Select label="Status *" name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'playing_now', label: 'Now Playing' },
            { value: 'archived', label: 'Archived' }
          ]} />
          <Input label="Poster URL" name="poster" type="url" value={formData.poster} onChange={(e) => setFormData({...formData, poster: e.target.value})} />
          <Input label="Trailer URL" name="trailer_url" type="url" value={formData.trailer_url} onChange={(e) => setFormData({...formData, trailer_url: e.target.value})} />
        </div>
        <Textarea label="Description" name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
        <ModalButtons onCancel={onClose} submitText={movie ? 'Update' : 'Add'} submitting={submitting} />
      </form>
    </Modal>
  );
};

// Schedule Modal Component - Responsive
const ScheduleModal = ({ schedule, onClose, onSuccess, movies, studios }) => {
  const [formData, setFormData] = useState({
    movie_id: '',
    studio_id: '',
    date: '',
    showtime: '',
    price_weekday: '',
    price_weekend: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (schedule) {
      setFormData({
        movie_id: schedule.movie_id || '',
        studio_id: schedule.studio_id || '',
        date: schedule.date || '',
        showtime: schedule.showtime || '',
        price_weekday: schedule.price_weekday || '',
        price_weekend: schedule.price_weekend || ''
      });
    }
  }, [schedule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...formData,
        movie_id: parseInt(formData.movie_id),
        studio_id: parseInt(formData.studio_id),
        price_weekday: parseFloat(formData.price_weekday),
        price_weekend: parseFloat(formData.price_weekend)
      };
      if (schedule) {
        await schedulesAPI.update(schedule.id, data);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Schedule updated successfully!',
          confirmButtonColor: '#3b82f6',
          background: '#1f2937',
          color: '#f9fafb'
        });
      } else {
        await schedulesAPI.create(data);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Schedule added successfully!',
          confirmButtonColor: '#3b82f6',
          background: '#1f2937',
          color: '#f9fafb'
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed: ' + error.message,
        confirmButtonColor: '#ef4444',
        background: '#1f2937',
        color: '#f9fafb'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={schedule ? 'Edit Schedule' : 'Add New Schedule'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <Select label="Movie *" name="movie_id" value={formData.movie_id} onChange={(e) => setFormData({...formData, movie_id: e.target.value})} required options={[
            { value: '', label: 'Select Movie' },
            ...movies.map(m => ({ value: m.id, label: m.title }))
          ]} />
          <Select label="Studio *" name="studio_id" value={formData.studio_id} onChange={(e) => setFormData({...formData, studio_id: e.target.value})} required options={[
            { value: '', label: 'Select Studio' },
            ...studios.map(s => ({ value: s.id, label: s.name }))
          ]} />
          <Input label="Date *" name="date" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          <Input label="Showtime *" name="showtime" type="time" value={formData.showtime} onChange={(e) => setFormData({...formData, showtime: e.target.value})} required />
          <Input label="Weekday Price *" name="price_weekday" type="number" value={formData.price_weekday} onChange={(e) => setFormData({...formData, price_weekday: e.target.value})} required placeholder="35000" />
          <Input label="Weekend Price *" name="price_weekend" type="number" value={formData.price_weekend} onChange={(e) => setFormData({...formData, price_weekend: e.target.value})} required placeholder="50000" />
        </div>
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 lg:p-4">
          <p className="text-sm text-blue-400">💡 <strong>Weekend Pricing:</strong> Weekend prices apply on Saturdays and Sundays automatically.</p>
        </div>
        <ModalButtons onCancel={onClose} submitText={schedule ? 'Update' : 'Add'} submitting={submitting} />
      </form>
    </Modal>
  );
};

// Studio Modal Component - Responsive
const StudioModal = ({ studio, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (studio) {
      setFormData({
        name: studio.name || '',
        capacity: studio.capacity || '',
        description: studio.description || ''
      });
    }
  }, [studio]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...formData, capacity: parseInt(formData.capacity) };
      if (studio) {
        await studiosAPI.update(studio.id, data);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Studio updated successfully!',
          confirmButtonColor: '#3b82f6',
          background: '#1f2937',
          color: '#f9fafb'
        });
      } else {
        await studiosAPI.create(data);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Studio added successfully!',
          confirmButtonColor: '#3b82f6',
          background: '#1f2937',
          color: '#f9fafb'
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed: ' + error.message,
        confirmButtonColor: '#ef4444',
        background: '#1f2937',
        color: '#f9fafb'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={studio ? 'Edit Studio' : 'Add New Studio'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        <Input label="Studio Name *" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Studio 1" />
        <Input label="Capacity *" name="capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} required placeholder="50" />
        <Textarea label="Description" name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Premium studio with comfortable seats..." />
        <ModalButtons onCancel={onClose} submitText={studio ? 'Update' : 'Add'} submitting={submitting} />
      </form>
    </Modal>
  );
};

// User Modal Component - Responsive
const UserModal = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'customer'
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...formData };
      if (user && !data.password) delete data.password;
      if (user) {
        await usersAPI.update(user.id, data);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'User updated successfully!',
          confirmButtonColor: '#3b82f6',
          background: '#1f2937',
          color: '#f9fafb'
        });
      } else {
        await usersAPI.create(data);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'User added successfully!',
          confirmButtonColor: '#3b82f6',
          background: '#1f2937',
          color: '#f9fafb'
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed: ' + error.message,
        confirmButtonColor: '#ef4444',
        background: '#1f2937',
        color: '#f9fafb'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={user ? 'Edit User' : 'Add New User'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        <Input label="Name *" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <Input label="Email *" name="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <Input label={user ? 'Password (leave blank to keep)' : 'Password *'} name="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!user} />
        <Select label="Role *" name="role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required options={[
          { value: 'customer', label: 'Customer' },
          { value: 'cashier', label: 'Cashier' },
          { value: 'admin', label: 'Admin' }
        ]} />
        <ModalButtons onCancel={onClose} submitText={user ? 'Update' : 'Add'} submitting={submitting} />
      </form>
    </Modal>
  );
};

// Seats Management Modal - Responsive
const SeatsModal = ({ studio, onClose }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    rows: '',
    seats_per_row: '',
    type: 'regular'
  });

  useEffect(() => {
    fetchSeats();
  }, [studio]);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const response = await seatsAPI.getAll(studio.id);
      const data = response.data.data || response.data;
      setSeats(data);
    } catch (error) {
      console.error('Error fetching seats:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to fetch seats: ' + error.message,
        confirmButtonColor: '#ef4444',
        background: '#1f2937',
        color: '#f9fafb'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    try {
      const rows = bulkForm.rows.split(',').map(r => r.trim().toUpperCase());
      await seatsAPI.bulkCreate({
        studio_id: studio.id,
        rows,
        seats_per_row: parseInt(bulkForm.seats_per_row),
        type: bulkForm.type
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Seats created successfully!',
        confirmButtonColor: '#3b82f6',
        background: '#1f2937',
        color: '#f9fafb'
      });
      setShowBulkCreate(false);
      fetchSeats();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to create seats: ' + error.message,
        confirmButtonColor: '#ef4444',
        background: '#1f2937',
        color: '#f9fafb'
      });
    }
  };

  const handleDeleteSeat = async (id) => {
    Swal.fire({
      title: 'Delete Seat',
      text: 'Are you sure you want to delete this seat?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      background: '#1f2937',
      color: '#f9fafb'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await seatsAPI.delete(id);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Seat deleted successfully!',
            confirmButtonColor: '#3b82f6',
            background: '#1f2937',
            color: '#f9fafb'
          });
          fetchSeats();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to delete seat: ' + error.message,
            confirmButtonColor: '#ef4444',
            background: '#1f2937',
            color: '#f9fafb'
          });
        }
      }
    });
  };

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row_label]) acc[seat.row_label] = [];
    acc[seat.row_label].push(seat);
    return acc;
  }, {});

  return (
    <Modal title={`Manage Seats - ${studio.name}`} onClose={onClose} size="large">
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-300 text-sm lg:text-base">Total Seats: <span className="font-bold text-white">{seats.length}</span></p>
          </div>
          <button 
            onClick={() => setShowBulkCreate(!showBulkCreate)} 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm lg:text-base w-full sm:w-auto"
          >
            {showBulkCreate ? 'Cancel' : '+ Bulk Create Seats'}
          </button>
        </div>

        {showBulkCreate && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 lg:p-6">
            <h3 className="font-bold text-white mb-4 text-lg lg:text-xl">Bulk Create Seats</h3>
            <form onSubmit={handleBulkCreate} className="space-y-4">
              <Input label="Rows (comma separated) *" value={bulkForm.rows} onChange={(e) => setBulkForm({...bulkForm, rows: e.target.value})} required placeholder="A,B,C,D,E" />
              <Input label="Seats per Row *" type="number" value={bulkForm.seats_per_row} onChange={(e) => setBulkForm({...bulkForm, seats_per_row: e.target.value})} required placeholder="10" />
              <Select label="Seat Type *" value={bulkForm.type} onChange={(e) => setBulkForm({...bulkForm, type: e.target.value})} required options={[
                { value: 'regular', label: 'Regular' },
                { value: 'vip', label: 'VIP' },
                { value: 'premium', label: 'Premium' }
              ]} />
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm lg:text-base">
                Create Seats
              </button>
            </form>
          </div>
        )}

        <div className="bg-gray-700 border border-gray-600 rounded-xl p-4 lg:p-6 max-h-64 lg:max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 lg:w-8 lg:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : seats.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm lg:text-base">No seats configured. Use bulk create to add seats.</p>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {Object.keys(groupedSeats).sort().map(row => (
                <div key={row}>
                  <h4 className="font-bold text-white mb-2 lg:mb-3 text-sm lg:text-base">Row {row}</h4>
                  <div className="flex flex-wrap gap-1 lg:gap-2">
                    {groupedSeats[row].sort((a, b) => a.seat_number - b.seat_number).map(seat => (
                      <div key={seat.id} className="relative group">
                        <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center text-xs lg:text-sm font-semibold border ${
                          seat.type === 'vip' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          seat.type === 'premium' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                          'bg-gray-600 text-gray-300 border-gray-500/30'
                        }`}>
                          {seat.row_label}{seat.seat_number}
                        </div>
                        <button
                          onClick={() => handleDeleteSeat(seat.id)}
                          className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-red-500 text-white rounded-full w-4 h-4 lg:w-5 lg:h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 lg:gap-4 text-xs lg:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gray-600 rounded border border-gray-500/30"></div>
            <span className="text-gray-300">Regular</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-yellow-500/20 rounded border border-yellow-500/30"></div>
            <span className="text-gray-300">VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-purple-500/20 rounded border border-purple-500/30"></div>
            <span className="text-gray-300">Premium</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DashboardPage;