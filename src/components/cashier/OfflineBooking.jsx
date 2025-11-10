import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { cashierAPI } from '../../services/CashierApiService';

const OfflineBooking = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Fetch movies on mount
  useEffect(() => {
    fetchMovies();
  }, []);

  // Fetch schedules when movie selected
  useEffect(() => {
    if (selectedMovie) {
      fetchSchedules(selectedMovie.id);
    }
  }, [selectedMovie]);

  // Fetch seats when schedule selected
  useEffect(() => {
    if (selectedSchedule) {
      fetchSeats(selectedSchedule.id);
    }
  }, [selectedSchedule]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/movies');
      const data = await response.json();
      
      if (data.status === 'success') {
        // Filter only playing_now movies
        const nowShowingMovies = data.data.filter(m => m.status === 'playing_now');
        setMovies(nowShowingMovies);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load movies',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async (movieId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/v1/movies/${movieId}/schedules`);
      const data = await response.json();
      
      if (data.status === 'success') {
        // Filter available schedules
        const availableSchedules = data.data.filter(s => {
          if (!s.is_available) return false;
          
          const now = new Date();
          const scheduleDate = new Date(s.date);
          const [hours, minutes] = s.showtime.split(':');
          const scheduleDateTime = new Date(
            scheduleDate.getFullYear(),
            scheduleDate.getMonth(),
            scheduleDate.getDate(),
            parseInt(hours),
            parseInt(minutes)
          );
          
          return scheduleDateTime > now;
        });
        
        setSchedules(availableSchedules);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load schedules',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (scheduleId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(
        `http://localhost:8000/api/v1/schedules/${scheduleId}/seats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSeats(data.data);
        setSelectedSeats([]);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load seats',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.is_booked) return;

    setSelectedSeats(prev => {
      if (prev.includes(seat.id)) {
        return prev.filter(id => id !== seat.id);
      } else {
        return [...prev, seat.id];
      }
    });
  };

  const getSeatClass = (seat) => {
    if (seat.is_booked) return 'bg-red-400 cursor-not-allowed';
    if (selectedSeats.includes(seat.id)) return 'bg-green-500 hover:bg-green-600';
    
    if (seat.type === 'vip') return 'bg-yellow-300 hover:bg-yellow-400';
    if (seat.type === 'premium') return 'bg-purple-300 hover:bg-purple-400';
    return 'bg-gray-300 hover:bg-blue-400';
  };

  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getCurrentPrice = (schedule) => {
    const weekend = isWeekend(schedule.date);
    return weekend ? schedule.price_weekend : schedule.price_weekday;
  };

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row_label]) acc[seat.row_label] = [];
    acc[seat.row_label].push(seat);
    return acc;
  }, {});

  const totalPrice = selectedSchedule && selectedSeats.length 
    ? getCurrentPrice(selectedSchedule) * selectedSeats.length 
    : 0;

  const handleCreateBooking = async () => {
    // Validation
    if (!customerName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Customer Name Required',
        text: 'Please enter customer name',
      });
      return;
    }

    if (!customerPhone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Phone Number Required',
        text: 'Please enter customer phone number',
      });
      return;
    }

    if (!selectedSchedule || selectedSeats.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Selection',
        text: 'Please select schedule and seats',
      });
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        schedule_id: selectedSchedule.id,
        seat_ids: selectedSeats,
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: 'cash'
      };

      const data = await cashierAPI.createOfflineBooking(bookingData);

      if (data.status === 'success') {
        // Show success with ticket details
        await Swal.fire({
          icon: 'success',
          title: 'Booking Success!',
          html: `
            <div class="text-left">
              <p><strong>Ticket Number:</strong> ${data.data.ticket.ticket_number}</p>
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Movie:</strong> ${selectedMovie.title}</p>
              <p><strong>Showtime:</strong> ${selectedSchedule.date} ${selectedSchedule.showtime}</p>
              <p><strong>Seats:</strong> ${seats
                .filter(s => selectedSeats.includes(s.id))
                .map(s => `${s.row_label}${s.seat_number}`)
                .join(', ')}</p>
              <p><strong>Total:</strong> Rp ${totalPrice.toLocaleString('id-ID')}</p>
            </div>
          `,
          confirmButtonColor: '#3b82f6',
        });

        // Reset form
        setSelectedMovie(null);
        setSelectedSchedule(null);
        setSeats([]);
        setSelectedSeats([]);
        setCustomerName('');
        setCustomerPhone('');
        setSchedules([]);
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error.message || 'Failed to create booking',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && movies.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Offline Booking</h2>
        <div className="text-sm text-gray-500">
          Kasir dapat membuat booking untuk pelanggan offline
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Movie Selection */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Select Movie</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {movies.map(movie => (
            <button
              key={movie.id}
              onClick={() => {
                setSelectedMovie(movie);
                setSelectedSchedule(null);
                setSelectedSeats([]);
              }}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedMovie?.id === movie.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="font-semibold text-sm line-clamp-2">{movie.title}</div>
              <div className="text-xs text-gray-500 mt-1">{movie.genre}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Selection */}
      {selectedMovie && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            Select Schedule - {selectedMovie.title}
          </h3>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available schedules
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {schedules.map(schedule => {
                const price = getCurrentPrice(schedule);
                const weekend = isWeekend(schedule.date);
                
                return (
                  <button
                    key={schedule.id}
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setSelectedSeats([]);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSchedule?.id === schedule.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <div className="font-bold text-lg">{schedule.showtime}</div>
                        <div className="text-xs text-gray-600">{formatDate(schedule.date)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {schedule.studio?.name}
                        </div>
                        {weekend && (
                          <div className="text-xs text-orange-600 font-semibold mt-1">
                            Weekend
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">
                          Rp {price.toLocaleString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">per seat</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Seat Selection */}
      {selectedSchedule && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Select Seats</h3>
          
          {/* Screen */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white text-center py-3 rounded-xl shadow-lg">
              <div className="text-sm font-semibold tracking-wider">SCREEN</div>
            </div>
          </div>

          {/* Seats Grid */}
          <div className="mb-4 overflow-x-auto">
            <div className="inline-block min-w-full">
              {Object.keys(groupedSeats).sort().map(row => (
                <div key={row} className="flex items-center mb-2">
                  <div className="w-8 text-center font-bold text-gray-700 mr-3">
                    {row}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {groupedSeats[row]
                      .sort((a, b) => a.seat_number - b.seat_number)
                      .map(seat => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all transform hover:scale-110 ${getSeatClass(seat)}`}
                          disabled={seat.is_booked}
                          title={`${seat.row_label}${seat.seat_number} - ${seat.type}`}
                        >
                          {seat.seat_number}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-xs border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <span>Regular</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-300 rounded"></div>
              <span>VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-300 rounded"></div>
              <span>Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-400 rounded"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedSeats.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Booking Summary</h3>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-semibold">{customerName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold">{customerPhone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Movie:</span>
              <span className="font-semibold">{selectedMovie.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Schedule:</span>
              <span className="font-semibold">
                {formatDate(selectedSchedule.date)} - {selectedSchedule.showtime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Studio:</span>
              <span className="font-semibold">{selectedSchedule.studio?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seats:</span>
              <span className="font-semibold">
                {seats
                  .filter(s => selectedSeats.includes(s.id))
                  .map(s => `${s.row_label}${s.seat_number}`)
                  .join(', ')}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t-2 border-green-300">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                Rp {totalPrice.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            onClick={handleCreateBooking}
            disabled={loading || !customerName || !customerPhone}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Create Booking & Print Ticket'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OfflineBooking;