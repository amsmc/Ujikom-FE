import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/OwnerApiService';

const OwnerDashboard = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [movieRevenue, setMovieRevenue] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revenue, movies, daily] = await Promise.all([
        ownerAPI.getRevenue({ period }),
        ownerAPI.getRevenueByMovie({ period }),
        ownerAPI.getDailyRevenue({ days: 30 })
      ]);

      setRevenueData(revenue.data);
      setMovieRevenue(movies.data);
      setDailyRevenue(daily.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getPeriodLabel = () => {
    const labels = {
      day: 'Hari Ini',
      week: 'Minggu Ini',
      month: 'Bulan Ini',
      year: 'Tahun Ini'
    };
    return labels[period];
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg"></div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-neutral-900">Dashboard Owner</h1>
                <p className="text-sm text-neutral-500">Analisis kinerja bisnis</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Filter */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Ringkasan Pendapatan</h2>
            <p className="text-neutral-500 mt-1">Periode: {getPeriodLabel()}</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-neutral-700"
          >
            <option value="day">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Revenue Summary Cards */}
            {revenueData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-neutral-900 mt-1">
                        {formatCurrency(revenueData.total_revenue)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Total Pemesanan</p>
                      <p className="text-2xl font-bold text-neutral-900 mt-1">
                        {formatNumber(revenueData.total_bookings)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Total Tiket</p>
                      <p className="text-2xl font-bold text-neutral-900 mt-1">
                        {formatNumber(revenueData.total_tickets)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue by Movie */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Pendapatan per Film</h3>
                <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                  {movieRevenue.length} film
                </span>
              </div>
              
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">Film</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-600">Pendapatan</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-600">Pemesanan</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-600">Tiket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {movieRevenue.map((movie, index) => (
                      <tr key={index} className="hover:bg-neutral-50 transition-colors duration-150">
                        <td className="py-3 px-4">
                          <div className="font-medium text-neutral-900">{movie.movie_title}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {formatCurrency(movie.total_revenue)}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-700">
                          {formatNumber(movie.total_bookings)}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-700">
                          {formatNumber(movie.total_tickets)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Pendapatan Harian (30 Hari Terakhir)</h3>
                <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                  {dailyRevenue.length} hari
                </span>
              </div>
              
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-600">Tanggal</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-600">Pendapatan</th>
                      <th className="text-right py-3 px-4 font-medium text-neutral-600">Pemesanan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {dailyRevenue.map((day, index) => (
                      <tr key={index} className="hover:bg-neutral-50 transition-colors duration-150">
                        <td className="py-3 px-4 text-neutral-700">{day.date}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {formatCurrency(day.revenue)}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-700">
                          {formatNumber(day.bookings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;