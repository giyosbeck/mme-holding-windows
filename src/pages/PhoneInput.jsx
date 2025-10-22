import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NumericKeypad from '../components/NumericKeypad';
import { requestOTP } from '../services/authApi';

const PhoneInput = () => {
  const navigate = useNavigate();
  const { phoneNumber: savedPhone, setPhoneNumber, clearAll } = useAuthStore();
  const t = useTranslation();

  const [phoneDigits, setPhoneDigits] = useState(
    savedPhone ? savedPhone.replace('+998', '').replace(/\s/g, '') : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNumberClick = (num) => {
    if (phoneDigits.length < 9) {
      setPhoneDigits(phoneDigits + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPhoneDigits(phoneDigits.slice(0, -1));
    setError('');
  };

  const formatPhoneNumber = (digits) => {
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const handleSendCode = async () => {
    if (phoneDigits.length === 9) {
      const fullPhone = '+998' + phoneDigits;
      setLoading(true);
      setError('');

      try {
        const response = await requestOTP(fullPhone);
        // OTP sent successfully
        console.log('OTP Code:', response.code); // For development - shows code in console
        setPhoneNumber(fullPhone);
        navigate('/otp');
      } catch (err) {
        console.error('Failed to send OTP:', err);
        setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDifferentNumber = () => {
    clearAll();
    setPhoneDigits('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Language Switcher */}
        <div className="flex justify-center mb-6">
          <LanguageSwitcher />
        </div>

        {/* Phone Number Display */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-base">{t.phoneNumber}</label>
          <div className="flex items-center bg-white border-2 border-gray-300 rounded-lg p-4">
            <span className="text-2xl font-mono text-gray-900 mr-2">+998</span>
            <span className="flex-1 text-2xl font-mono text-gray-900">
              {formatPhoneNumber(phoneDigits) || <span className="text-gray-400">90 333 56 44</span>}
            </span>
          </div>
          {error && (
            <p className="text-red-600 mt-2 text-base">{error}</p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="mb-4">
          <NumericKeypad
            onNumberClick={handleNumberClick}
            onBackspace={handleBackspace}
          />
        </div>

        {/* Send Code Button */}
        <button
          onClick={handleSendCode}
          disabled={phoneDigits.length !== 9 || loading}
          className={`
            w-full h-14 text-lg font-medium rounded-lg mb-3
            transition-colors
            ${phoneDigits.length === 9 && !loading
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {loading ? 'Sending...' : t.sendCode}
        </button>

        {/* Different Number Link */}
        {savedPhone && (
          <button
            onClick={handleDifferentNumber}
            className="w-full text-gray-600 hover:text-gray-900 text-lg"
          >
            {t.useDifferentNumber}
          </button>
        )}
      </div>
    </div>
  );
};

export default PhoneInput;
