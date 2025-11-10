import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // atau dari context
      
      const response = await axios.get('http://localhost:8000/api/v1/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        setInvoices(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case 'completed':
    case 'paid': 
      return 'bg-green-500';
    case 'pending': 
      return 'bg-yellow-500';
    case 'cancelled':
    case 'expired':
    case 'failed': 
      return 'bg-red-500';
    default: 
      return 'bg-gray-500';
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-3 rounded-full w-fit border border-white/30">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              Booking History & Invoices
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              My <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300 animate-pulse">
                Invoices
              </span>
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl max-w-2xl leading-relaxed font-light">
              View your booking history, download invoices, and manage your movie tickets all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Invoice List Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Booking History
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
                All your movie bookings and purchase history in one place
              </p>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2">
              Download All Invoices
              <span className="text-lg">📥</span>
            </button>
          </div>

          <div className="space-y-6">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:scale-[1.02] group border border-gray-100"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Movie Image */}
                    <div className="lg:w-1/4">
                      <div className="relative h-48 lg:h-full rounded-2xl overflow-hidden">
                        <img
                          src={invoice.image}
                          alt={invoice.movieTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="lg:w-3/4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-2xl text-gray-900 mb-2">
                            {invoice.movieTitle}
                          </h3>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                            <span className="text-gray-600 font-semibold">
                              {invoice.id}
                            </span>
                          </div>
                        </div>
                        <div className="text-right mt-4 sm:mt-0">
                          <div className="text-3xl font-bold text-blue-600">
                            Rp {invoice.totalAmount.toLocaleString('id-ID')}
                          </div>
                          <div className="text-gray-500 text-sm">
                            Total Amount
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              🎭
                            </div>
                            <div>
                              <div className="text-gray-500 text-sm">Theater</div>
                              <div className="font-semibold">{invoice.theater}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              🕒
                            </div>
                            <div>
                              <div className="text-gray-500 text-sm">Showtime</div>
                              <div className="font-semibold">{invoice.showtime}</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              💺
                            </div>
                            <div>
                              <div className="text-gray-500 text-sm">Seats</div>
                              <div className="font-semibold">{invoice.seats.join(', ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              💳
                            </div>
                            <div>
                              <div className="text-gray-500 text-sm">Payment Method</div>
                              <div className="font-semibold">{invoice.paymentMethod}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                        <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                          View Details
                        </button>
                        <button className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                          Download Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading invoices...</p>
              </div>
            )}

            {!loading && invoices.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl shadow-xl">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Invoices Yet</h3>
                <p className="text-gray-600">Start booking your favorite movies to see your invoices here!</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12 bg-red-50 rounded-3xl border border-red-200">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-red-900 mb-2">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InvoicePage;