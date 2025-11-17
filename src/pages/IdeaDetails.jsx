import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getIdeaDetails, transferIdeaToDress } from '../services/factoryManagerApi';
import { getImageUrl } from '../services/api';
import FullscreenImageViewer from '../components/FullscreenImageViewer';

const IdeaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTranslation();

  const [ideaData, setIdeaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchIdeaDetails();
  }, [id]);

  const fetchIdeaDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getIdeaDetails(id);
      setIdeaData(data);
      console.log('💡 Idea Data Loaded:', data);
    } catch (err) {
      console.error('❌ Failed to fetch idea details:', err);
      setError('Failed to load idea details');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await transferIdeaToDress(id, 'REJECTED');
      console.log('✅ Idea Rejected');
      navigate('/factory-manager/ideas');
    } catch (err) {
      console.error('❌ Failed to reject idea:', err);
      setErrorMessage('Failed to reject idea');
      setShowError(true);
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await transferIdeaToDress(id, 'TRANSFER');
      console.log('✅ Idea Approved');
      navigate('/factory-manager/ideas');
    } catch (err) {
      console.error('❌ Failed to approve idea:', err);
      setErrorMessage('Failed to approve idea');
      setShowError(true);
      setActionLoading(false);
      setShowApproveModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !ideaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error || 'Idea not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate('/factory-manager/ideas')}
            className="text-2xl font-semibold text-gray-900 flex items-center gap-2
              active:scale-95 transition-transform"
          >
            ← {t.ideaDetails}
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
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-md mb-6">
          {/* Idea Image */}
          {ideaData.idea_image && (
            <div className="mb-8">
              <img
                src={getImageUrl(ideaData.idea_image)}
                alt={ideaData.idea_name}
                onClick={() => setFullscreenImage(ideaData.idea_image)}
                className="w-full h-96 object-cover rounded-xl cursor-pointer
                  active:scale-[0.98] transition-transform"
              />
            </div>
          )}

          <div className="space-y-6">
            {/* Idea Name */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-gray-100">
              <div className="text-sm text-gray-500">{t.ideaName}</div>
              <div className="text-lg font-semibold text-gray-900 text-right max-w-md">
                {ideaData.idea_name || '--'}
              </div>
            </div>

            {/* Assigned Tasks */}
            {ideaData.task_templates && ideaData.task_templates.length > 0 && (
              <div className="pb-6 border-b-2 border-gray-100">
                <div className="text-sm text-gray-500 mb-4">{t.assignedTasks}</div>
                <div className="space-y-4">
                  {ideaData.task_templates.map((task, index) => {
                    // Get all staff names for this task
                    const staffNames = task.staffs?.map(s => s.staff_name).filter(Boolean) || [];

                    return (
                      <div key={task.id || index}>
                        <div className="flex items-start gap-3">
                          <div className="text-lg font-semibold text-gray-900">
                            {task.task_name || '--'}
                          </div>
                          <div className="text-lg text-gray-500">→</div>
                          <div className="text-lg font-semibold text-gray-900 flex-1">
                            {staffNames.length > 0 ? (
                              <div className="space-y-1">
                                {staffNames.map((name, idx) => (
                                  <div key={idx}>{name}</div>
                                ))}
                              </div>
                            ) : (
                              '--'
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="flex justify-between items-start">
              <div className="text-sm text-gray-500">{t.additionalInfo}</div>
              <div className="text-lg font-semibold text-gray-900 text-right max-w-md">
                {ideaData.description || '--'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex-1 py-4 bg-red-600 text-white rounded-xl font-semibold text-lg
              active:scale-[0.98] transition-all shadow-md"
          >
            {t.reject}
          </button>
          <button
            onClick={() => setShowApproveModal(true)}
            className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg
              active:scale-[0.98] transition-all shadow-md"
          >
            {t.approve}
          </button>
        </div>
      </div>

      {/* Fullscreen Image Viewer with Zoom */}
      {fullscreenImage && ideaData?.idea_image && (
        <FullscreenImageViewer
          images={ideaData.idea_image}
          currentIndex={0}
          onClose={() => setFullscreenImage(null)}
        />
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.rejectConfirm}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {ideaData.idea_name}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold
                  active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold
                  active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    {t.rejecting || 'Rejecting...'}
                  </span>
                ) : (
                  'OK'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowApproveModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.approveConfirm}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {ideaData.idea_name}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={actionLoading}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold
                  active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold
                  active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    {t.approving || 'Approving...'}
                  </span>
                ) : (
                  'OK'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8"
          onClick={() => setShowError(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-8xl mb-6">❌</div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              {t.errorTitle || 'Error'}
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowError(false)}
              className="w-full h-14 text-xl font-medium rounded-lg
                bg-gray-900 text-white hover:bg-gray-700 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaDetails;
