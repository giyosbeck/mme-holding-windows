import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { getCompletedIdeas } from '../services/factoryManagerApi';
import { getImageUrl } from '../services/api';

const IdeasList = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCompletedIdeas();
      setIdeas(data || []);
      console.log('💡 Ideas loaded:', data?.length || 0);
    } catch (err) {
      console.error('❌ Failed to fetch ideas:', err);
      setError('Failed to load ideas');
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
            ← {t.convertIdeaToDress}
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
          <>
            {/* Ideas Grid */}
            {ideas.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    onClick={() => navigate(`/factory-manager/idea/${idea.id}`)}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md
                      active:scale-[0.98] active:border-blue-500 transition-all cursor-pointer"
                  >
                    {/* Idea Image */}
                    <div className="mb-4">
                      {idea.idea_image ? (
                        <img
                          src={getImageUrl(idea.idea_image)}
                          alt={idea.idea_name}
                          className="w-full h-64 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-6xl">💡</span>
                        </div>
                      )}
                    </div>

                    {/* Idea Name */}
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{t.ideaName}</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {idea.idea_name || '--'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No Ideas State */
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center shadow-md">
                <div className="text-6xl mb-6">💡</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t.noIdeas}
                </h2>
                <p className="text-xl text-gray-600">
                  No completed ideas available
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IdeasList;
