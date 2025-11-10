import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { cashierAPI } from '../../services/CashierApiService';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualTicketNumber, setManualTicketNumber] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setTicketData(null);

    try {
      // Simulate QR code reading from image
      // In real implementation, you would use a QR code library like jsqr or qr-scanner
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // TODO: Implement actual QR code decoding here
          // For now, show error and suggest manual input
          setError('QR code scanning belum diimplementasikan. Silakan gunakan input manual di bawah.');
        } catch (error) {
          setError('Gagal memproses QR code');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError('Gagal membaca file');
      setLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (!manualTicketNumber.trim()) {
      setError('Masukkan nomor tiket');
      return;
    }

    setLoading(true);
    setError('');
    setTicketData(null);

    try {
      const response = await cashierAPI.verifyTicket(manualTicketNumber.trim());
      if (response.status === 'success') {
        setTicketData(response.data);
      } else {
        setError(response.message || 'QR code tidak valid');
      }
    } catch (error) {
      console.error('Verify error:', error);
      setError(error.message || 'Gagal memverifikasi tiket. Pastikan nomor tiket benar.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanTicket = async () => {
    if (!ticketData || !ticketData.is_valid) {
      setError('Tidak ada tiket valid untuk dipindai');
      return;
    }

    setLoading(true);
    
    try {
      const response = await cashierAPI.scanTicket(ticketData.ticket_number);
      if (response.status === 'success') {
        setTicketData({
          ...ticketData,
          status: 'used',
          used_at: response.data.scanned_at,
          is_valid: false
        });
        alert('Tiket berhasil dipindai!');
      } else {
        setError(response.message || 'Gagal memindai tiket');
      }
    } catch (error) {
      console.error('Scan error:', error);
      setError(error.message || 'Gagal memindai tiket');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTicketData(null);
    setError('');
    setIsScanning(false);
    setManualTicketNumber('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pemindai QR Code</h2>
        <p className="text-gray-600">Verifikasi dan pindai tiket menggunakan QR code atau nomor tiket</p>
      </div>

      {/* Manual Input Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Input Manual Nomor Tiket
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualTicketNumber}
            onChange={(e) => setManualTicketNumber(e.target.value)}
            placeholder="Contoh: TKT-20251108-000001"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || ticketData}
          />
          <button
            onClick={handleManualVerify}
            disabled={loading || !manualTicketNumber.trim() || ticketData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Verifikasi...' : 'Verifikasi'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Format: TKT-YYYYMMDD-XXXXXX (contoh: TKT-20251108-000001)
        </p>
      </div>

      {/* QR Upload Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Upload Gambar QR Code
        </h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="qr-upload"
          disabled={ticketData}
        />
        <label
          htmlFor="qr-upload"
          className={`block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors cursor-pointer
            ${ticketData ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
        >
          {loading ? 'Memproses...' : 'Upload Gambar QR Code'}
        </label>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Format: JPG, PNG, GIF (Fitur dalam pengembangan)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Ticket Data Display */}
      {ticketData && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Status Header */}
          <div className={`p-4 ${ticketData.is_valid ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {ticketData.is_valid ? (
                  <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div>
                  <p className={`text-xl font-bold ${ticketData.is_valid ? 'text-green-800' : 'text-red-800'}`}>
                    {ticketData.is_valid ? 'TIKET VALID' : 'TIKET TIDAK VALID'}
                  </p>
                  <p className={`text-sm ${ticketData.is_valid ? 'text-green-600' : 'text-red-600'}`}>
                    {ticketData.is_valid ? 'Tiket dapat dipindai' : ticketData.status === 'used' ? 'Tiket sudah digunakan' : 'Tiket tidak valid'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nomor Tiket</p>
                <p className="font-semibold text-gray-900">{ticketData.ticket_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  ticketData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {ticketData.status === 'active' ? 'Aktif' : 'Terpakai'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Film</p>
              <p className="font-semibold text-lg text-gray-900">{ticketData.movie.title}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tanggal</p>
                <p className="font-semibold text-gray-900">{new Date(ticketData.schedule.date).toLocaleDateString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Jam</p>
                <p className="font-semibold text-gray-900">{ticketData.schedule.showtime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Studio</p>
                <p className="font-semibold text-gray-900">{ticketData.schedule.studio}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Kursi</p>
              <p className="font-semibold text-gray-900">{ticketData.seats.join(', ')}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">Pemesan</p>
              <p className="font-semibold text-gray-900">{ticketData.customer.name}</p>
              <p className="text-sm text-gray-600">{ticketData.customer.email}</p>
            </div>

            {ticketData.used_at && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Digunakan Pada</p>
                <p className="font-semibold text-gray-900">
                  {new Date(ticketData.used_at).toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 border-t flex gap-3">
            <button
              onClick={handleScanTicket}
              disabled={loading || !ticketData.is_valid}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memindai...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pindai Tiket
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-6 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;