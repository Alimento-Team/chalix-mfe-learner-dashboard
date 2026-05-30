import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

/**
 * Fetch live account profile data for the authenticated user.
 * @param {string} username
 * @returns {Promise<Object>}
 */
export const getAccountProfile = async (username) => {
  if (!username) {
    return null;
  }

  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().LMS_BASE_URL;
  const response = await client.get(`${baseUrl}/api/user/v1/accounts/${username}`);
  return response.data;
};

export default {
  getAccountProfile,
};
