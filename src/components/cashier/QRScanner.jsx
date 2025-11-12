import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { cashierAPI } from '../../services/CashierApiService';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualTicketNumber, setManualTicketNumber] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setTicketData(null);
    setUploadedImage(null);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.onload = async () => {
            // Create canvas to process image
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            // Get image data
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // Decode QR code
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
              console.log('QR Code detected:', code.data);
              setUploadedImage(e.target.result);
              
              // Parse QR code data - it might be JSON or plain text
              let ticketNumber = code.data;
              
              try {
                // Try to parse as JSON if it's an object
                const qrData = JSON.parse(code.data);
                if (qrData.ticket_number) {
                  ticketNumber = qrData.ticket_number;
                  console.log('Extracted ticket number from JSON:', ticketNumber);
                }
              } catch (e) {
                // If not JSON, use the raw data as ticket number
                console.log('Using raw QR data as ticket number:', ticketNumber);
              }
              
              // Verify the ticket with the extracted ticket number
              await verifyTicket(ticketNumber);
            } else {
              setError('QR code tidak ditemukan dalam gambar. Pastikan gambar QR code jelas dan tidak buram.');
              setLoading(false);
            }
          };

          img.onerror = () => {
            setError('Gagal memuat gambar. Pastikan file adalah gambar yang valid.');
            setLoading(false);
          };

          img.src = e.target.result;
        } catch (error) {
          console.error('QR processing error:', error);
          setError('Gagal memproses QR code: ' + error.message);
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Gagal membaca file');
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      setError('Gagal membaca file');
      setLoading(false);
    }
  };

  const verifyTicket = async (ticketNumber) => {
    try {
      const response = await cashierAPI.verifyTicket(ticketNumber.trim());
      if (response.status === 'success') {
        setTicketData(response.data);
        setError('');
      } else {
        setError(response.message || 'Tiket tidak valid');
      }
    } catch (error) {
      console.error('Verify error:', error);
      setError(error.message || 'Gagal memverifikasi tiket. Pastikan nomor tiket benar.');
    } finally {
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
    setUploadedImage(null);

    await verifyTicket(manualTicketNumber.trim());
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
          used_at: response.data.scanned_at || new Date().toISOString(),
          is_valid: false
        });
        setError('');
        // Show success message
        setTimeout(() => {
          alert('✅ Tiket berhasil dipindai!');
        }, 100);
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
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && manualTicketNumber.trim() && !loading && !ticketData) {
      handleManualVerify();
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
            onChange={(e) => setManualTicketNumber(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Contoh: TKT-20251108-000001"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || ticketData}
          />
          <button
            onClick={handleManualVerify}
            disabled={loading || !manualTicketNumber.trim() || ticketData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifikasi...
              </div>
            ) : 'Verifikasi'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Format: TKT-YYYYMMDD-XXXXXX (contoh: TKT-20251108-000001)
        </p>
      </div>

      {/* QR Upload Section */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-dashed border-purple-300 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan QR Code dari Gambar
        </h3>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="qr-upload"
          disabled={ticketData || loading}
        />
        
        <label
          htmlFor="qr-upload"
          className={`block w-full py-4 px-4 rounded-lg text-center font-medium transition-all cursor-pointer
            ${ticketData || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'}`}
        >
          <div className="flex items-center justify-center">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses QR Code...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload & Scan QR Code
              </>
            )}
          </div>
        </label>
        
        <p className="text-sm text-gray-600 mt-3 text-center">
          📱 Format: JPG, PNG, GIF • QR Code akan otomatis di-scan
        </p>

        {uploadedImage && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Gambar QR yang di-upload:</p>
            <img src={uploadedImage} alt="QR Code" className="max-w-xs mx-auto rounded border" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start animate-shake">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Ticket Data Display */}
      {ticketData && (
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg animate-fadeIn">
          {/* Status Header */}
          <div className={`p-6 ${ticketData.is_valid ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200' : 'bg-gradient-to-r from-red-50 to-rose-50 border-b-2 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {ticketData.is_valid ? (
                  <div className="relative">
                    <svg className="w-12 h-12 text-green-600 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                ) : (
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div className="ml-4">
                  <p className={`text-2xl font-bold ${ticketData.is_valid ? 'text-green-800' : 'text-red-800'}`}>
                    {ticketData.is_valid ? '✓ TIKET VALID' : '✗ TIKET TIDAK VALID'}
                  </p>
                  <p className={`text-sm font-medium ${ticketData.is_valid ? 'text-green-600' : 'text-red-600'}`}>
                    {ticketData.is_valid ? 'Tiket dapat dipindai' : ticketData.status === 'used' ? 'Tiket sudah digunakan' : 'Tiket tidak valid'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6 space-y-5 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Nomor Tiket</p>
                <p className="font-bold text-gray-900 text-lg">{ticketData.ticket_number}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                  ticketData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {ticketData.status === 'active' ? '● Aktif' : '● Terpakai'}
                </span>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 pt-5">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Film</p>
              <p className="font-bold text-xl text-gray-900">{ticketData.movie.title}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-1 uppercase tracking-wide font-medium">Tanggal</p>
                <p className="font-bold text-gray-900">{new Date(ticketData.schedule.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 mb-1 uppercase tracking-wide font-medium">Jam</p>
                <p className="font-bold text-gray-900">{ticketData.schedule.showtime}</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-600 mb-1 uppercase tracking-wide font-medium">Studio</p>
                <p className="font-bold text-gray-900">{ticketData.schedule.studio}</p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700 mb-2 uppercase tracking-wide font-medium">Nomor Kursi</p>
              <p className="font-bold text-lg text-gray-900">{ticketData.seats.join(', ')}</p>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 pt-5">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Pemesan</p>
              <p className="font-bold text-gray-900">{ticketData.customer.name}</p>
              <p className="text-sm text-gray-600 mt-1">{ticketData.customer.email}</p>
            </div>

            {ticketData.used_at && (
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                <p className="text-xs text-red-600 mb-1 uppercase tracking-wide font-medium">⚠️ Digunakan Pada</p>
                <p className="font-bold text-gray-900">
                  {new Date(ticketData.used_at).toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 border-t-2 flex gap-3">
            <button
              onClick={handleScanTicket}
              disabled={loading || !ticketData.is_valid}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memindai...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pindai Tiket
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-8 bg-gray-600 text-white py-4 rounded-lg hover:bg-gray-700 disabled:cursor-not-allowed font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;