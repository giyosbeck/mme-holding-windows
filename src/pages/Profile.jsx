import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Profile = () => {
  const navigate = useNavigate();
  const { user, phoneNumber, logout } = useAuthStore();
  const t = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoBack = () => {
    // Navigate based on user role
    if (user?.role === 'FACTORY_MANAGER') {
      navigate('/factory-manager/home');
    } else if (user?.role === 'SALON') {
      navigate('/salon/home');
    } else {
      navigate('/home');
    }
  };

  // Get role display text
  const getRoleText = () => {
    if (user?.role === 'FACTORY_MANAGER') {
      return t.factoryManager;
    } else if (user?.role === 'SALON') {
      return t.salonManager;
    }
    return t.warehouseManager;
  };

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    const digits = phone.replace('+998', '');
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="mr-4 text-2xl text-gray-600 active:text-gray-900
                w-12 h-12 rounded-lg active:bg-gray-100 flex items-center justify-center
                transition-colors"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{t.profile}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-12 py-16">
        <div className="bg-white border border-gray-200 rounded-lg p-16">
          {/* Profile Icon */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-32 h-32 rounded-full bg-gray-900 flex items-center justify-center text-7xl mb-6">
              👤
            </div>
            <h2 className="text-4xl font-semibold text-gray-900 mb-2">
              {user?.name || 'User'}
            </h2>
            <p className="text-2xl text-gray-600">
              {formatPhoneForDisplay(phoneNumber)}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-10"></div>

          {/* Info Section */}
          <div className="space-y-6 mb-10">
            <div className="flex justify-between items-center py-4 border-b border-gray-100">
              <span className="text-2xl text-gray-600">{t.role}</span>
              <span className="text-2xl font-medium text-gray-900">{getRoleText()}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-gray-100">
              <span className="text-2xl text-gray-600">{t.status}</span>
              <span className="text-2xl font-medium text-gray-900">{t.active}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full h-16 text-xl font-medium rounded-lg
              bg-gray-900 active:bg-gray-700 text-white transition-colors"
          >
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
