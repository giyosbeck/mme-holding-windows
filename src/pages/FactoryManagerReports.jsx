import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const FactoryManagerReports = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.factoryManager}
          </h1>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/factory-manager/home')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              {t.homepage}
            </button>
            <button
              onClick={() => navigate('/factory-manager/statistics')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
            >
              {t.statistics}
            </button>
            <button
              onClick={() => navigate('/factory-manager/reports')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md"
            >
              {t.reports}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* View Report Card */}
          <button
            onClick={() => navigate('/factory-manager/view-report')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-md
              active:scale-[0.98] active:border-blue-500 transition-all text-left"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t.viewReport}
            </h3>
          </button>

          {/* Dresses in Shop Card */}
          <button
            onClick={() => navigate('/factory-manager/dresses')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-md
              active:scale-[0.98] active:border-blue-500 transition-all text-left"
          >
            <div className="text-6xl mb-4">👗</div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t.dressesInShop}
            </h3>
          </button>

          {/* Convert Idea to Dress Card */}
          <button
            onClick={() => navigate('/factory-manager/ideas')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-md
              active:scale-[0.98] active:border-blue-500 transition-all text-left"
          >
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t.convertIdeaToDress}
            </h3>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FactoryManagerReports;
