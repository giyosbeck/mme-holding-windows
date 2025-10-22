import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';
import { getUserProfile } from '../services/authApi';

const Homepage = () => {
  const navigate = useNavigate();
  const { user, userId } = useAuthStore();
  const t = useTranslation();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const profile = await getUserProfile(userId);
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
        }
      }
    };

    fetchUserProfile();
  }, [userId]);

  const actions = [
    {
      id: 3,
      title: t.supplying,
      icon: '🚚',
      action: () => navigate('/supplying')
    },
    {
      id: 2,
      title: t.inventory,
      icon: '📋',
      action: () => navigate('/inventory/types')
    },
    {
      id: 1,
      title: t.createNewProduct,
      icon: '📦',
      action: () => alert(t.comingSoon.createProduct)
    },
    {
      id: 4,
      title: t.expenses,
      icon: '💰',
      action: () => alert(t.comingSoon.expenses)
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{t.warehouseSystem}</h1>
          <button
            onClick={() => navigate('/profile')}
            className="w-14 h-14 rounded-full bg-gray-900 hover:bg-gray-700
              flex items-center justify-center text-2xl transition-colors"
          >
            👤
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-2 gap-6">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="bg-white border-2 border-gray-200 shadow-md rounded-2xl p-8
                flex flex-col items-center justify-center transition-all h-64
                active:scale-[0.98] active:border-blue-500"
            >
              <div className="text-7xl mb-4">{action.icon}</div>
              <h3 className="text-2xl font-medium text-gray-900">{action.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
