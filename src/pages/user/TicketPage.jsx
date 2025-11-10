import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const TicketPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active'); // active, used, expired, cancelled

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:8000/api/v1/tickets?status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        setTickets(data.data);
      } else {
        throw new Error('Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load tickets. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      used: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-orange-100 text-orange-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Active',
      used: 'Used',
      expired: 'Expired',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const getPosterUrl = (posterPath) => {
    if (!posterPath) return 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400';
    if (posterPath.startsWith('http')) return posterPath;
    return `http://localhost:8000/${posterPath.replace(/^\//, '')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="w-full px-4 py-20 animate-pulse">
          <div className="max-w-6xl mx-auto">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-3 rounded-full w-fit border border-white/30">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              Digital Tickets & E-Tickets
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              My <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 animate-pulse">
                Tickets
              </span>
            </h1>
            <p className="text-purple-100 text-lg sm:text-xl max-w-2xl leading-relaxed font-light">
              Access your digital tickets anytime, anywhere. Show the QR code at the theater entrance.
            </p>
          </div>
        </div>
      </div>

      {/* Tickets Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {filter === 'active' ? 'Active Tickets' : `${getStatusText(filter)} Tickets`}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
                Your {filter === 'active' ? 'upcoming movie screenings and active' : filter} tickets
              </p>
            </div>
            <Link 
              to="/invoice" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2"
            >
              Invoice History
              <span className="text-lg">→</span>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {['active', 'used', 'expired', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  filter === status
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>

          {tickets.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🎟️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-gray-600 mb-6">
                You don't have any {filter} tickets yet.
              </p>
              <Link 
                to="/movies"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold inline-block"
              >
                Browse Movies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transform transition-all duration-500 hover:scale-105 group border border-gray-200"
                >
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          GGCinema
                        </div>
                        <div className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {ticket.movieTitle}
                      </h3>
                      <p className="text-purple-200 text-sm">
                        {ticket.genre} • {ticket.duration}
                      </p>
                    </div>
                  </div>

                  {/* Ticket Content */}
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                          🎭
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Theater</div>
                          <div className="font-semibold">{ticket.theater}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          📽️
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Screen</div>
                          <div className="font-semibold">{ticket.screen}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                          🕒
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Showtime</div>
                          <div className="font-semibold">{formatDate(ticket.showtime)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                          💺
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Seats</div>
                          <div className="font-semibold text-lg">{ticket.seats.join(', ')}</div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="text-center border-t border-gray-200 pt-6">
                      <div className="mb-4">
                        <img
                          src={ticket.qrCode}
                          alt="QR Code"
                          className="w-32 h-32 mx-auto border-4 border-gray-200 rounded-xl"
                          onError={(e) => {
                            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.id}`;
                          }}
                        />
                      </div>
                      <p className="text-gray-500 text-sm mb-4">
                        {ticket.status === 'active' 
                          ? 'Scan this QR code at the theater entrance'
                          : ticket.status === 'used'
                          ? 'This ticket has been used'
                          : 'This ticket is no longer valid'
                        }
                      </p>
                      <div className="text-xs text-gray-400">
                        Ticket ID: {ticket.id}
                      </div>
                      {ticket.usedAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          Used on: {formatDate(ticket.usedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Actions */}
                  <div className="px-6 pb-6">
                    <div className="flex gap-3">
                      <Link to={`/ticket/${ticket.id}`} className="flex-1">
                        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm">
                          View Details
                        </button>
                      </Link>
                      {ticket.status === 'active' && (
                        <button 
                          onClick={() => {
                            // Download QR code logic
                            const link = document.createElement('a');
                            link.href = ticket.qrCode;
                            link.download = `ticket-${ticket.id}.png`;
                            link.click();
                          }}
                          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm"
                        >
                          Save QR
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Movies Banner */}
          {filter === 'active' && tickets.length > 0 && (
            <div className="mt-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 translate-x-40"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-6 py-3 rounded-full mb-6 border border-white/30">
                      🎊 Special Reminder
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                      Don't Forget Your Movie!
                    </h3>
                    <p className="text-orange-100 text-lg max-w-2xl">
                      Arrive at least 30 minutes before the showtime. Enjoy your cinematic experience!
                    </p>
                  </div>
                  
                  <button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl whitespace-nowrap">
                    Set Reminder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TicketPage;