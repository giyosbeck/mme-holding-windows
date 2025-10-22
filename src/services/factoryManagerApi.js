import api from './api';

/**
 * Factory Manager API Service
 * All API calls for FACTORY_MANAGER role (role code "6")
 */

/**
 * Get all dress orders with filtering
 * @param {boolean} accepted - Filter by acceptance status (true/false)
 * @returns {Promise} Array of dress orders
 */
export const getAllOrders = async (accepted) => {
  try {
    const response = await api.get('/dress-order/all', {
      params: { accepted }
    });

    console.log('📦 Orders Data:', {
      accepted,
      count: response.data?.length || 0,
      orders: response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch orders:', error);
    throw error;
  }
};

/**
 * Get dress order details by ID
 * @param {string} id - Order ID
 * @returns {Promise} Order details object
 */
export const getOrderDetails = async (id) => {
  try {
    const response = await api.get(`/dress-order/by-id-new/${id}/`);

    console.log('📋 Order Details:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch order details:', error);
    throw error;
  }
};

/**
 * Get rejected orders with pagination
 * @param {number} limit - Number of orders per page (default: 20)
 * @param {number} offset - Page offset
 * @returns {Promise} Object with orders array and total count
 */
export const getRejectedOrders = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/dress-order/rejected/all', {
      params: { limit, offset }
    });

    console.log('🚫 Rejected Orders:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch rejected orders:', error);
    throw error;
  }
};

/**
 * Accept or reject a dress order
 * @param {string} id - Order ID
 * @param {boolean} accept - true to accept, false to reject
 * @param {string} rejectDescription - Rejection reason (required if accept=false)
 * @returns {Promise} Response object with order ID
 */
export const acceptOrRejectOrder = async (id, accept, rejectDescription = '') => {
  try {
    const response = await api.put('/dress-order/accept', {
      id,
      accept,
      reject_description: accept ? undefined : rejectDescription
    });

    console.log('✅ Order Action:', {
      id,
      action: accept ? 'accepted' : 'rejected',
      response: response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to accept/reject order:', error);
    throw error;
  }
};

/**
 * Mark dress order as ready/completed
 * @param {string} id - Order ID
 * @param {boolean} ready - true to mark as ready
 * @returns {Promise} Response object with order ID
 */
export const markOrderReady = async (id, ready = true) => {
  try {
    const response = await api.put('/dress-order/ready', {
      id,
      ready
    });

    console.log('✅ Order Ready Status:', {
      id,
      ready,
      response: response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to mark order ready:', error);
    throw error;
  }
};

/**
 * Get all dresses in inventory
 * @returns {Promise} Array of dresses
 */
export const getAllDresses = async () => {
  try {
    const response = await api.get('/dress/all');

    console.log('👗 All Dresses:', {
      count: response.data?.length || 0,
      dresses: response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dresses:', error);
    throw error;
  }
};

/**
 * Get warehouse statistics for date range
 * @param {string} fromDate - Start date (format: "yyyy-MM-dd")
 * @param {string} toDate - End date (format: "yyyy-MM-dd")
 * @returns {Promise} Statistics object with orders_count, accepted, not_accepted, rejected
 */
export const getWarehouseStatistics = async (fromDate, toDate) => {
  try {
    const response = await api.get('/report/warehouse-general', {
      params: { from: fromDate, to: toDate }
    });

    console.log('📊 Warehouse Statistics:', {
      dateRange: `${fromDate} to ${toDate}`,
      data: response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch warehouse statistics:', error);
    throw error;
  }
};

/**
 * Get warehouse report general statistics (original function for backward compatibility)
 * @param {string} fromDate - Start date (format: "yyyy-MM-dd")
 * @param {string} toDate - End date (format: "yyyy-MM-dd")
 * @param {string} userId - Optional user ID to filter by
 * @returns {Promise} Statistics object
 */
export const getWarehouseReport = async (fromDate, toDate, userId = null) => {
  try {
    const params = { from: fromDate, to: toDate };
    if (userId) params.user_id = userId;

    const response = await api.get('/report/warehouse-general', { params });

    console.log('📊 Warehouse Report:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch warehouse report:', error);
    throw error;
  }
};

/**
 * Get detailed warehouse report
 * @param {string} userId - Optional user ID to filter by
 * @returns {Promise} Object with reports array and count
 */
export const getWarehouseReportDetails = async (userId = null) => {
  try {
    const params = userId ? { user_id: userId } : {};

    const response = await api.get('/report/warehouse-details', { params });

    console.log('📈 Warehouse Report Details:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch warehouse report details:', error);
    throw error;
  }
};

/**
 * Get completed designer ideas
 * @returns {Promise} Array of completed ideas
 */
export const getCompletedIdeas = async () => {
  try {
    const response = await api.get('/designer/completed/ideas');

    console.log('💡 Completed Ideas:', {
      count: response.data?.length || 0,
      ideas: response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch completed ideas:', error);
    throw error;
  }
};

/**
 * Get designer idea details
 * @param {string} id - Idea ID
 * @returns {Promise} Idea details object
 */
export const getIdeaDetails = async (id) => {
  try {
    const response = await api.get(`/designer/get/idea/${id}/v2`);

    console.log('💭 Idea Details:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch idea details:', error);
    throw error;
  }
};

/**
 * Transfer idea to dress (approve or reject)
 * @param {string} ideaId - Idea ID
 * @param {string} action - "TRANSFER" to approve, "REJECTED" to reject
 * @returns {Promise} Response object with idea ID
 */
export const transferIdeaToDress = async (ideaId, action) => {
  try {
    const response = await api.patch('/designer/transfer/to/dress', {
      ideaId,
      action
    });

    console.log('🔄 Idea Transfer:', {
      ideaId,
      action,
      response: response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to transfer idea:', error);
    throw error;
  }
};

/**
 * Get dress details by ID
 * @param {string} id - Dress ID
 * @returns {Promise} Dress details object
 */
export const getDressById = async (id) => {
  try {
    const response = await api.get(`/dress/${id}`);

    console.log('👗 Dress Details:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dress details:', error);
    throw error;
  }
};

/**
 * Update dress information
 * @param {Object} data - Dress data to update
 * @returns {Promise} Response object
 */
export const updateDress = async (data) => {
  try {
    const response = await api.put('/dress/update', data);

    console.log('✅ Dress Updated:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to update dress:', error);
    throw error;
  }
};

/**
 * Delete dress by ID
 * @param {string} id - Dress ID
 * @returns {Promise} Response object
 */
export const deleteDress = async (id) => {
  try {
    const response = await api.delete('/dress/delete', {
      params: { id }
    });

    console.log('🗑️ Dress Deleted:', id);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete dress:', error);
    throw error;
  }
};

/**
 * Get available dress colors
 * @returns {Promise} Array of color strings
 */
export const getDressColors = async () => {
  try {
    const response = await api.get('/dress/colors');

    console.log('🎨 Dress Colors:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dress colors:', error);
    throw error;
  }
};

/**
 * Get dress authors/designers
 * Fetches all employees with DESIGNER role
 * @returns {Promise} Array of designer objects with {id, name, phone, role, role_id}
 */
export const getDressAuthors = async () => {
  try {
    const response = await api.get('/employee/all', {
      params: { role: 'DESIGNER' }
    });

    console.log('👨‍🎨 Dress Authors (Designers):', {
      count: response.data?.length || 0,
      designers: response.data
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch dress authors:', error);
    throw error;
  }
};
