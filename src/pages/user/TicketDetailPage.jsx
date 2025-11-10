import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const TicketDetailPage = () => {
  const { id } = useParams();

  // Static ticket data
  const ticketDetail = {
    id: '1',
    bookingId: 'BK2024001',
    movieTitle: 'Avengers: Endgame',
    genre: 'Action, Adventure',
    duration: '181 min',
    theater: 'GGCinema Mall',
    screen: 'Screen 1',
    showtime: '2024-01-20T19:30:00',
    seats: ['A1', 'A2'],
    totalPrice: 90000,
    paymentDate: '2024-01-15T14:30:00',
    paymentMethod: 'Credit Card',
    cardNumber: '**** **** **** 1234',
    status: 'Confirmed',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TKT001-BK2024001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+62 812 3456 7890',
    transactionId: 'TXN2024001',
    bookingDate: '2024-01-15T14:25:00'
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/tickets" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2">
            ← Back to My Tickets
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Details</h1>
          <p className="text-gray-600">Complete information about your movie ticket</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Ticket Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Movie & Showtime Info */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🎬 Movie Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Movie Title:</span>
                  <span className="font-semibold">{ticketDetail.movieTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Genre:</span>
                  <span className="font-semibold">{ticketDetail.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{ticketDetail.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Theater:</span>
                  <span className="font-semibold">{ticketDetail.theater}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Screen:</span>
                  <span className="font-semibold">{ticketDetail.screen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Showtime:</span>
                  <span className="font-semibold">{formatDateTime(ticketDetail.showtime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seats:</span>
                  <span className="font-semibold text-lg text-blue-600">{ticketDetail.seats.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                💳 Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="font-semibold">{formatDateTime(ticketDetail.paymentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">{ticketDetail.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Card Number:</span>
                  <span className="font-semibold">{ticketDetail.cardNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-semibold">{ticketDetail.transactionId}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-xl text-green-600">{formatPrice(ticketDetail.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                👤 Customer Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{ticketDetail.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{ticketDetail.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{ticketDetail.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="font-semibold">{formatDateTime(ticketDetail.bookingDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Actions */}
          <div className="space-y-6">
            
            {/* QR Code */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <h2 className="text-xl font-bold mb-4">Digital Ticket</h2>
              <div className="mb-4">
                <img
                  src={ticketDetail.qrCode}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto border-4 border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Scan at theater entrance</p>
                <p className="font-bold text-lg">{ticketDetail.id}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  ticketDetail.status === 'Confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {ticketDetail.status}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Download PDF
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Share Ticket
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Add to Calendar
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Cancel Ticket
                </button>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-semibold">{ticketDetail.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Seats ({ticketDetail.seats.length}):</span>
                  <span className="font-semibold">{ticketDetail.seats.join(', ')}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span>Total Paid:</span>
                  <span className="font-bold text-blue-800">{formatPrice(ticketDetail.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
            ⚠️ Important Notes
          </h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Please arrive at least 30 minutes before showtime</li>
            <li>• Present this QR code at the theater entrance</li>
            <li>• Tickets are non-refundable after showtime</li>
            <li>• Food and beverages from outside are not allowed</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TicketDetailPage;