import React, { useState, useEffect } from 'react';
import { cashierAPI } from '../../services/CashierApiService';
import { publicSchedulesAPI } from '../../pages/admin/adminapiconfig/AdminApiConfig';

const ScheduleTicketList = () => {
  const [scheduleId, setScheduleId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchTickets = async () => {
    if (!scheduleId.trim()) {
      setError('Please enter a schedule ID');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const response = await cashierAPI.getTicketsBySchedule(scheduleId);
      if (response.status === 'success') {
        setTickets(response.data);
      } else {
        setError(response.message || 'Failed to fetch tickets');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Schedule Tickets</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={scheduleId}
          onChange={(e) => setScheduleId(e.target.value)}
          placeholder="Enter schedule ID"
          className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleFetchTickets}
          disabled={loading || !scheduleId}
          className="px-6 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Fetch Tickets'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {tickets.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Ticket Number</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Customer</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Seats</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Used At</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                    {ticket.ticket_number}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {ticket.customer_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {ticket.seats.join(', ')}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {ticket.used_at ? new Date(ticket.used_at).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-sm text-gray-600">
            Total tickets: {tickets.length} | 
            Active: {tickets.filter(t => t.status === 'active').length} | 
            Used: {tickets.filter(t => t.status === 'used').length}
          </div>
        </div>
      )}

      {tickets.length === 0 && !loading && !error && scheduleId && (
        <div className="text-center py-8 text-gray-500">
          No tickets found for this schedule
        </div>
      )}
    </div>
  );
};

export default ScheduleTicketList;