import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const SalonReports = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.salon || 'Salon'}
          </h1>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/salon/home')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              {t.sales || 'Sotuv'}
            </button>
            <button
              onClick={() => navigate('/salon/statistics')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              {t.statistics || 'Statistika'}
            </button>
            <button
              onClick={() => navigate('/salon/reports')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md"
            >
              {t.reports || 'Hisobot'}
            </button>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="w-14 h-14 rounded-full bg-gray-900 active:bg-gray-700
              flex items-center justify-center text-2xl transition-colors"
          >
            👤
          </button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-16 text-center shadow-md">
          <div className="text-6xl mb-6">📈</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t.comingSoon || 'Tez orada'}
          </h2>
          <p className="text-lg text-gray-600">
            {t.reportsComingSoon || 'Hisobot sahifasi hozirda ishlab chiqilmoqda'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalonReports;
