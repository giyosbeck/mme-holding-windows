import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const SalonStatistics = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/salon/home')}
              className="w-14 h-14 rounded-full border-2 border-gray-200
                flex items-center justify-center text-2xl
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {t.statistics || 'Statistika'}
            </h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-14 h-14 rounded-full bg-gray-900
              flex items-center justify-center text-2xl
              active:scale-[0.98] transition-all"
          >
            👤
          </button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-16 text-center shadow-md">
          <div className="text-6xl mb-6">📊</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t.comingSoon || 'Tez orada'}
          </h2>
          <p className="text-lg text-gray-600">
            {t.statisticsComingSoon || 'Statistika sahifasi hozirda ishlab chiqilmoqda'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalonStatistics;
