import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NumericKeypad from '../components/NumericKeypad';
import { verifyOTP, requestOTP } from '../services/authApi';

const OTPVerify = () => {
  const navigate = useNavigate();
  const { phoneNumber, login } = useAuthStore();
  const t = useTranslation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phoneNumber) {
      navigate('/');
    }
  }, [phoneNumber, navigate]);

  useEffect(() => {
    if (otp.length === 5) {
      handleVerify();
    }
  }, [otp]);

  const handleNumberClick = (num) => {
    if (otp.length < 5) {
      setOtp(otp + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setOtp(otp.slice(0, -1));
    setError('');
  };

  const handleVerify = async () => {
    if (otp.length !== 5 || loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await verifyOTP(phoneNumber, otp);

      // Check if account is expired
      if (response.expired) {
        setError('Account is expired. Please contact support.');
        setOtp('');
        setLoading(false);
        return;
      }

      // Check if user has valid role (WAREHOUSE or FACTORY_MANAGER)
      const validRoles = ['WAREHOUSE', 'FACTORY_MANAGER'];
      if (!validRoles.includes(response.userRole)) {
        setError('You do not have access to this system.');
        console.log('❌ Unauthorized role attempt:', response);
        setOtp('');
        setLoading(false);
        return;
      }

      console.log('✅ Login successful:', {
        role: response.userRole,
        userId: response.userID,
        roleStatus: response.userRoleStatus
      });

      // Check role status
      if (response.userRoleStatus < 1) {
        setError('Your account is pending approval.');
        setOtp('');
        setLoading(false);
        return;
      }

      // Login successful
      login(response);

      // Navigate based on role
      if (response.userRole === 'FACTORY_MANAGER') {
        navigate('/factory-manager/home');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Failed to verify OTP:', err);
      setError(err.response?.data?.message || t.invalidOtp);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setOtp('');
    setError('');
    setLoading(true);

    try {
      const response = await requestOTP(phoneNumber);
      console.log('OTP Code:', response.code); // For development
      alert('OTP code resent!');
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    const digits = phone.replace('+998', '');
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="w-full max-w-2xl">
        {/* Language Switcher */}
        <div className="flex justify-center mb-8">
          <LanguageSwitcher />
        </div>

        <p className="text-center text-gray-900 font-medium mb-12 text-xl">
          {formatPhoneForDisplay(phoneNumber)}
        </p>

        {/* OTP Display */}
        <div className="mb-8">
          <div className="flex justify-center gap-3 mb-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="w-16 h-20 flex items-center justify-center
                  rounded-lg border-2 border-gray-300 text-4xl font-mono
                  bg-white text-gray-900"
              >
                {otp[index] || '-'}
              </div>
            ))}
          </div>
          {error && (
            <p className="text-red-600 text-center text-lg">
              {error}
            </p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="mb-8">
          <NumericKeypad
            onNumberClick={handleNumberClick}
            onBackspace={handleBackspace}
          />
        </div>

        {/* Resend Code Button */}
        <button
          onClick={handleResendCode}
          disabled={loading}
          className={`w-full h-14 text-lg font-medium rounded-lg mb-4
            border-2 transition-colors
            ${loading
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
            }`}
        >
          {loading ? 'Sending...' : t.resendCode}
        </button>

        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="w-full text-gray-600 hover:text-gray-900 text-lg"
        >
          {t.changePhoneNumber}
        </button>
      </div>
    </div>
  );
};

export default OTPVerify;
