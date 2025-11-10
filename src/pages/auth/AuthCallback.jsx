import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Ambil token dan user dari URL query parameters
        const token = searchParams.get('token');
        const userEncoded = searchParams.get('user');

        if (!token || !userEncoded) {
          throw new Error('Invalid callback data');
        }

        // Decode user data dari base64
        const userData = JSON.parse(atob(userEncoded));

        // Simpan ke localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Tampilkan success message
        await Swal.fire({
          icon: 'success',
          title: 'Login Successful! 🎉',
          text: `Welcome back, ${userData.name}!`,
          showConfirmButton: false,
          timer: 2000
        });

        // Redirect ke home
        navigate('/');
        
      } catch (error) {
        console.error('Callback error:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: 'Something went wrong during Google sign in. Please try again.',
          confirmButtonText: 'Go to Login'
        }).then(() => {
          navigate('/login');
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Completing Sign In...
        </h2>
        <p className="text-gray-600">
          Please wait while we log you in
        </p>
      </div>
    </div>
  );
}

export default AuthCallback;