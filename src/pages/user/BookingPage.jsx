import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to book tickets',
        confirmButtonText: 'Login Now',
        confirmButtonColor: '#3b82f6',
      }).then(() => {
        navigate('/login', { state: { from: `/booking/${id}` } });
      });
      return;
    }
  }, [id, navigate]);

  // Fetch movie details and schedules
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch movie details
        const movieResponse = await fetch(`http://localhost:8000/api/v1/movies/${id}`);
        const movieData = await movieResponse.json();

        if (movieData.status === 'success') {
          setMovie(movieData.data);

          // Fetch schedules
          const schedulesResponse = await fetch(`http://localhost:8000/api/v1/movies/${id}/schedules`);
          const schedulesData = await schedulesResponse.json();

          if (schedulesData.status === 'success') {
            setSchedules(schedulesData.data);
            
            // Set default date to first available schedule date
            if (schedulesData.data.length > 0) {
              const firstDate = schedulesData.data[0].date;
              setSelectedDate(firstDate);
            }
          }
        } else {
          throw new Error('Movie not found');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch seats when schedule is selected
  useEffect(() => {
    if (selectedSchedule) {
      fetchSeats(selectedSchedule.id);
    }
  }, [selectedSchedule]);

  const fetchSeats = async (scheduleId) => {
  try {
    // Double check availability sebelum fetch seats
    const selectedScheduleObj = filteredSchedules.find(s => s.id === scheduleId);
    if (selectedScheduleObj && !isScheduleAvailable(selectedScheduleObj)) {
      Swal.fire({
        icon: 'warning',
        title: 'Showtime Expired',
        text: 'This showtime is no longer available for booking.',
        confirmButtonColor: '#3b82f6',
      });
      setSelectedSchedule(null);
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
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
  } catch (err) {
    console.error('Error fetching seats:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load seats. Please try again.',
    });
  }
};

  // Function untuk cek apakah schedule masih available
const isScheduleAvailable = (schedule) => {
  if (!schedule.is_available) return false;
  
  const now = new Date();
  const scheduleDate = new Date(schedule.date);
  const [hours, minutes] = schedule.showtime.split(':');
  
  const scheduleDateTime = new Date(
    scheduleDate.getFullYear(),
    scheduleDate.getMonth(),
    scheduleDate.getDate(),
    parseInt(hours),
    parseInt(minutes)
  );
  
  return scheduleDateTime > now;
};

// Update handleScheduleSelect untuk double check
const handleScheduleSelect = (schedule) => {
  if (!isScheduleAvailable(schedule)) {
    Swal.fire({
      icon: 'warning',
      title: 'Showtime Expired',
      text: 'This showtime is no longer available for booking.',
      confirmButtonColor: '#3b82f6',
    });
    return;
  }
  setSelectedSchedule(schedule);
};

  const handleSeatClick = (seat) => {
    if (seat.is_booked) return;

    const seatId = seat.id;
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const getSeatClass = (seat) => {
    if (seat.is_booked) return 'bg-red-400 cursor-not-allowed';
    if (selectedSeats.includes(seat.id)) return 'bg-green-500 hover:bg-green-600';
    
    // Different colors for seat types
    if (seat.type === 'vip') return 'bg-yellow-300 hover:bg-yellow-400';
    if (seat.type === 'premium') return 'bg-purple-300 hover:bg-purple-400';
    return 'bg-gray-300 hover:bg-blue-400';
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  const getCurrentPrice = (schedule) => {
    const weekend = isWeekend(schedule.date);
    return weekend ? schedule.price_weekend : schedule.price_weekday;
  };

  const getPosterUrl = (posterPath) => {
    if (!posterPath) return 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400';
    if (posterPath.startsWith('http')) return posterPath;
    return `http://localhost:8000/${posterPath.replace(/^\//, '')}`;
  };
  

  // Group schedules by date
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(schedule);
    return acc;
  }, {});

  // Get unique dates
  const availableDates = Object.keys(groupedSchedules).sort();

  // Filter schedules by selected date
  const filteredSchedules = selectedDate ? groupedSchedules[selectedDate] || [] : [];

  // Group seats by row
  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row_label]) acc[seat.row_label] = [];
    acc[seat.row_label].push(seat);
    return acc;
  }, {});

  const totalPrice = selectedSchedule && selectedSeats.length 
    ? getCurrentPrice(selectedSchedule) * selectedSeats.length 
    : 0;

  const handleProceedToPayment = async () => {
  if (!selectedSchedule || selectedSeats.length === 0) return;

  if (!isScheduleAvailable(selectedSchedule)) {
    Swal.fire({
      icon: 'error',
      title: 'Showtime Expired',
      text: 'This showtime is no longer available. Please select another showtime.',
      confirmButtonColor: '#3b82f6',
    }).then(() => {
      setSelectedSchedule(null);
      setSelectedSeats([]);
    });
    return;
  }

  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    const bookingData = {
      schedule_id: selectedSchedule.id,
      seat_ids: selectedSeats
    };

    const response = await fetch('http://localhost:8000/api/v1/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (data.status === 'success') {
      window.snap.pay(data.data.snap_token, {
      onSuccess: async function(result) {
        console.log('Payment success:', result);
        
        // Call backend to update status
        try {
          const updateResponse = await fetch(
            `http://localhost:8000/api/v1/midtrans/manual-update/${data.data.payment.order_id}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          const updateData = await updateResponse.json();
          
          if (updateData.status === 'success') {
            Swal.fire({
              icon: 'success',
              title: 'Payment Successful!',
              text: 'Your booking has been confirmed.',
              confirmButtonColor: '#3b82f6',
            }).then(() => {
              navigate('/bookings');
            });
          }
        } catch (err) {
          console.error('Failed to update payment status:', err);
        }
      },
    });
    } else {
      throw new Error(data.message || 'Booking failed');
    }
    } catch (err) {
      console.error('Error creating booking:', err);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: err.message || 'Failed to create booking. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="w-full px-4 py-20 animate-pulse">
          <div className="max-w-6xl mx-auto">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded-xl"></div>
              <div className="h-96 bg-gray-300 rounded-xl"></div>
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
            <p className="text-gray-600 mb-6">{error || 'The movie you are looking for is not available.'}</p>
            <Link to="/movies" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block">
              Browse Movies
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="w-full px-4 py-20 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">🎟️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Schedules Available</h2>
            <p className="text-gray-600 mb-6">
              This movie currently has no available showtimes. Please check back later.
            </p>
            <Link 
              to={`/movie/${id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
            >
              Back to Movie Details
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="w-full px-4 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/movie/${id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2 font-semibold">
            ← Back to Movie Details
          </Link>
          <div className="flex items-center gap-4 mb-4 bg-white p-4 rounded-xl shadow-lg">
            <img 
              src={getPosterUrl(movie.poster)} 
              alt={movie.title} 
              className="w-16 h-20 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Book Tickets</h1>
              <p className="text-gray-600">
                {movie.title} • {formatDuration(movie.duration)} • {movie.genre}
              </p>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Select Date</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {availableDates.map(date => {
              const dateObj = new Date(date);
              const weekend = isWeekend(date);
              return (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedSchedule(null);
                    setSelectedSeats([]);
                  }}
                  className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all min-w-[120px] ${
                    selectedDate === date
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm text-gray-600">
                      {dateObj.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {dateObj.getDate()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {dateObj.toLocaleDateString('id-ID', { month: 'short' })}
                    </div>
                    {weekend && (
                      <div className="text-xs text-orange-600 font-semibold mt-1">
                        Weekend
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pilih Jadwal */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              Select Showtime
              {selectedDate && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({formatDate(selectedDate)})
                </span>
              )}
            </h2>
            
            {filteredSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No showtimes available for this date</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">

                {filteredSchedules.map(schedule => {
                  const price = getCurrentPrice(schedule);
                  const weekend = isWeekend(schedule.date);
                  const isAvailable = schedule.is_available;
                  
                  return (
                    <button
                      key={schedule.id}
                      onClick={() => isAvailable && handleScheduleSelect(schedule)}
                      disabled={!isAvailable}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        !isAvailable
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                          : selectedSchedule?.id === schedule.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-bold text-lg flex items-center gap-2">
                            {schedule.showtime}
                            {!isAvailable && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                Expired
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {schedule.studio?.name || 'Studio'}
                          </div>
                          {weekend && (
                            <div className="text-xs text-orange-600 font-semibold mt-1">
                              Weekend Price
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-lg ${
                            !isAvailable ? 'text-gray-500' : 'text-blue-600'
                          }`}>
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

          {/* Pilih Kursi */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Select Seats</h2>
            
            {!selectedSchedule ? (
              <div className="text-center py-20 text-gray-500">
                <div className="text-4xl mb-4">💺</div>
                <p>Please select a showtime first</p>
              </div>
            ) : seats.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="text-4xl mb-4">⏳</div>
                <p>Loading seats...</p>
              </div>
            ) : (
              <>
                {/* Screen */}
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white text-center py-3 rounded-xl mb-4 shadow-lg">
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
              </>
            )}
          </div>
        </div>

        {/* Summary & Checkout */}
        {(selectedSchedule || selectedSeats.length > 0) && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Booking Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Movie Details</h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">Movie:</span>
                  <span className="font-semibold">{movie.title}</span>
                </div>
                {selectedSchedule && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">{formatDate(selectedSchedule.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold">{selectedSchedule.showtime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Studio:</span>
                      <span className="font-semibold">{selectedSchedule.studio?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price/Seat:</span>
                      <span className="font-semibold">
                        Rp {getCurrentPrice(selectedSchedule).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Seat Selection</h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seats:</span>
                  <span className="font-semibold">
                    {selectedSeats.length > 0 
                      ? seats
                          .filter(s => selectedSeats.includes(s.id))
                          .map(s => `${s.row_label}${s.seat_number}`)
                          .join(', ')
                      : 'No seats selected'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Seats:</span>
                  <span className="font-semibold">{selectedSeats.length}</span>
                </div>
                {totalPrice > 0 && (
                  <div className="flex justify-between pt-3 border-t-2 border-blue-100">
                    <span className="text-lg font-bold text-gray-900">Total Price:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              {!selectedSchedule && (
                <p className="text-gray-500 mb-4">Please select a showtime to continue</p>
              )}
              {selectedSchedule && selectedSeats.length === 0 && (
                <p className="text-orange-500 mb-4">Please select at least one seat</p>
              )}
              {selectedSchedule && selectedSeats.length > 0 && (
                <button 
                  onClick={handleProceedToPayment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg"
                >
                  Proceed to Payment →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;