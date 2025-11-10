import React, { useState } from 'react';
import { cashierAPI } from '../../services/CashierApiService';

const TicketScanner = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('verify'); // 'verify' or 'scan'

  const handleVerify = async () => {
    if (!ticketNumber.trim()) {
      setError('Please enter a ticket number');
      return;
    }

    setError('');
    setLoading(true);
    setTicketData(null);
    
    try {
      const response = await cashierAPI.verifyTicket(ticketNumber);
      if (response.status === 'success') {
        setTicketData(response.data);
        setScanMode('scan');
      } else {
        setError(response.message || 'Failed to verify ticket');
      }
    } catch (error) {
      setError(error.message || 'Ticket not found');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!ticketData || !ticketData.is_valid) {
      setError('Please verify a valid ticket first');
      return;
    }

    setLoading(true);
    
    try {
      const response = await cashierAPI.scanTicket(ticketNumber);
      if (response.status === 'success') {
        setTicketData({
          ...ticketData,
          status: 'used',
          used_at: response.data.scanned_at,
          is_valid: false
        });
        setScanMode('verify');
        setTicketNumber('');
        alert('Ticket scanned successfully!');
      } else {
        setError(response.message || 'Failed to scan ticket');
      }
    } catch (error) {
      setError(error.message || 'Failed to scan ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTicketNumber('');
    setTicketData(null);
    setError('');
    setScanMode('verify');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Ticket Scanner</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          placeholder="Enter ticket number"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={scanMode === 'scan'}
        />
      </div>

      <div className="flex gap-2 mb-4">
        {scanMode === 'verify' ? (
          <button
            onClick={handleVerify}
            disabled={loading || !ticketNumber}
            className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Verifying...' : 'Verify Ticket'}
          </button>
        ) : (
          <>
            <button
              onClick={handleScan}
              disabled={loading || !ticketData?.is_valid}
              className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Scanning...' : 'Scan Ticket'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-6 bg-gray-500 text-white py-3 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {ticketData && (
        <div className="border-t pt-4">
          <div className={`p-4 rounded mb-4 ${ticketData.is_valid ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-bold text-lg">
              Status: {ticketData.is_valid ? '✓ Valid' : '✗ Invalid/Used'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600">Ticket Number</p>
              <p className="font-semibold">{ticketData.ticket_number}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-semibold capitalize">{ticketData.status}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600">Movie</p>
            <p className="font-semibold">{ticketData.movie.title}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-gray-600">Date</p>
              <p className="font-semibold">{ticketData.schedule.date}</p>
            </div>
            <div>
              <p className="text-gray-600">Time</p>
              <p className="font-semibold">{ticketData.schedule.showtime}</p>
            </div>
            <div>
              <p className="text-gray-600">Studio</p>
              <p className="font-semibold">{ticketData.schedule.studio}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600">Seats</p>
            <p className="font-semibold">{ticketData.seats.join(', ')}</p>
          </div>

          <div className="mb-4">
            <p className="text-gray-600">Customer</p>
            <p className="font-semibold">{ticketData.customer.name}</p>
            <p className="text-sm text-gray-500">{ticketData.customer.email}</p>
          </div>

          {ticketData.used_at && (
            <div className="mb-4">
              <p className="text-gray-600">Used At</p>
              <p className="font-semibold">{new Date(ticketData.used_at).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketScanner;