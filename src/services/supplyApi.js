import api from './api';

/**
 * Supply Management API Services
 */

// Get all employees, optionally filtered by role
export const getAllEmployees = async (role = null) => {
  const params = role ? { role } : {};
  const response = await api.get('/employee/all', { params });
  return response.data;
};

// Get employee projects
export const getEmployeeProjects = async (role, employeeId) => {
  const response = await api.get('/supply/get/employee/projects', {
    params: {
      role,
      employeeId
    }
  });
  return response.data;
};

// Create supply
export const createSupply = async (productId, projectId, receiverId, quantity) => {
  const response = await api.post('/supply/create', {
    product_id: productId,
    project_id: projectId,
    receiver_id: receiverId,
    quantity
  });
  return response.data;
};

// Get all supply projects list
export const getSupplyProjects = async () => {
  const response = await api.get('/supply/get/projects');
  return response.data;
};

// Get products by project ID
export const getProductsByProjectId = async (projectId) => {
  const response = await api.get(`/supply/get/${projectId}/products`);
  return response.data;
};

// Accept supply product
export const acceptSupply = async (supplyId) => {
  const response = await api.patch(`/supply/accepted/${supplyId}/product`);
  return response.data;
};

// Cancel supply product
export const cancelSupply = async (supplyId) => {
  const response = await api.patch(`/supply/cancelled/${supplyId}/product`);
  return response.data;
};

// Return product
export const returnProduct = async (supplyId, quantity) => {
  const response = await api.patch(`/supply/returned/${supplyId}`, {
    quantity
  });
  return response.data;
};
