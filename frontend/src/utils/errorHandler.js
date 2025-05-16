export const notifyUser = (message) => {
  // Display a toast notification or other UI feedback
};

// Then in axiosClient.js:
import { notifyUser } from './errorHandler';

// In the response interceptor:
if (status === 401 || status === 403) {
  handleLogout();
  notifyUser('Your session has expired. Please log in again.');
}
