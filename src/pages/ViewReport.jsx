import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getWarehouseReportDetails } from '../services/factoryManagerApi';

const ViewReport = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get warehouse report details (ready orders count)
      const data = await getWarehouseReportDetails();

      // Use ready_orders_count from response
      const readyCount = parseInt(data.ready_orders_count || data.report_order_count || '0');
      setCompletedCount(readyCount);
      console.log('✅ Completed Orders (Ready):', readyCount);
    } catch (err) {
      console.error('❌ Failed to fetch completed orders:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate('/factory-manager/reports')}
            className="text-2xl font-semibold text-gray-900 flex items-center gap-2
              active:scale-95 transition-transform"
          >
            ← {t.viewReport}
          </button>

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
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 text-center">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-xl text-gray-600">Loading...</div>
          </div>
        ) : (
          /* Completed Orders Card */
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-12 shadow-lg
            active:scale-[0.98] transition-transform">
            <div className="text-white/80 text-2xl font-medium mb-4">
              {t.completedOrders}
            </div>
            <div className="text-white text-8xl font-bold">
              {completedCount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReport;
