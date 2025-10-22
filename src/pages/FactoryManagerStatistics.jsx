import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getWarehouseStatistics } from '../services/factoryManagerApi';

const FactoryManagerStatistics = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  // Get today's date in yyyy-MM-dd format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getWarehouseStatistics(fromDate, toDate);
      setStatistics(data);
      console.log('📊 Statistics loaded:', data);
    } catch (err) {
      console.error('❌ Failed to fetch statistics:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchStatistics = () => {
    fetchStatistics();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.dailyReports}
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
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md"
            >
              {t.statistics}
            </button>
            <button
              onClick={() => navigate('/factory-manager/reports')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium
                active:scale-[0.98] active:border-blue-500 transition-all"
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
        {/* Date Range Selector */}
        <div className="mb-8 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            {/* From Date */}
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-2">{t.from}</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl
                  focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* To Date */}
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-2">{t.to}</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl
                  focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Fetch Button */}
            <div className="flex-shrink-0 pt-6">
              <button
                onClick={handleFetchStatistics}
                disabled={loading}
                className={`h-14 px-8 rounded-xl font-semibold text-lg transition-all shadow-md
                  ${loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white active:scale-[0.98] active:bg-blue-700'
                  }`}
              >
                {loading ? 'Loading...' : t.search}
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 text-center">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 gap-6">
            {/* Total Orders Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-lg
              active:scale-[0.98] transition-transform">
              <div className="text-white/80 text-lg font-medium mb-2">{t.totalOrders}</div>
              <div className="text-white text-6xl font-bold">{statistics.orders_count || 0}</div>
            </div>

            {/* Confirmed Orders Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-lg
              active:scale-[0.98] transition-transform">
              <div className="text-white/80 text-lg font-medium mb-2">{t.confirmedOrders}</div>
              <div className="text-white text-6xl font-bold">{statistics.accepted || 0}</div>
            </div>

            {/* Unconfirmed Orders Card */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-lg
              active:scale-[0.98] transition-transform">
              <div className="text-white/80 text-lg font-medium mb-2">{t.unconfirmedOrders}</div>
              <div className="text-white text-6xl font-bold">{statistics.not_accepted || 0}</div>
            </div>

            {/* Rejected Orders Card */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 shadow-lg
              active:scale-[0.98] transition-transform">
              <div className="text-white/80 text-lg font-medium mb-2">{t.rejectedOrders}</div>
              <div className="text-white text-6xl font-bold">{statistics.rejected || 0}</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !statistics && (
          <div className="text-center py-20">
            <div className="text-xl text-gray-600">Loading statistics...</div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !statistics && !error && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center shadow-md">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.dailyReports}
            </h2>
            <p className="text-xl text-gray-600">
              Select date range and click search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryManagerStatistics;
