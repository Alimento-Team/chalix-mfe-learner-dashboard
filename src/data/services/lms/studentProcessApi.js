import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

/**
 * Fetch the authenticated user's own learning process snapshot
 * @param {Object} params
 * @param {string} params.course_id - Selected course ID for course-scoped snapshot lookup
 * @returns {Promise} API response with student's learning process data
 */
export const getStudentLearningProcess = async (params = {}) => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().LMS_BASE_URL;
  const queryString = new URLSearchParams(params).toString();
  const url = queryString
    ? `${baseUrl}/api/learning_analytics/student-learning-process/me/?${queryString}`
    : `${baseUrl}/api/learning_analytics/student-learning-process/me/`;
  const response = await client.get(
    url,
  );
  return response.data;
};

/**
 * Track an explicit material-open event in LMS analytics.
 * @param {Object} payload
 * @param {string} payload.course_id
 * @param {string} payload.module_type
 * @returns {Promise}
 */
export const trackMaterialOpened = async (payload) => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().LMS_BASE_URL;
  const response = await client.post(
    `${baseUrl}/api/learning_analytics/material-open/`,
    payload,
  );
  return response.data;
};

/**
 * Fetch staff/admin list of student learning processes with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.student_id - Filter by student_id
 * @param {string} params.position_code - Filter by position code
 * @param {string} params.gender_code - Filter by gender code
 * @param {string} params.location_code - Filter by location code
 * @param {string} params.job_title_code - Filter by job title code
 * @param {string} params.experience_code - Filter by experience code
 * @param {number} params.min_final_score - Filter by minimum final score
 * @param {number} params.max_final_score - Filter by maximum final score
 * @param {number} params.offset - Pagination offset
 * @param {number} params.limit - Pagination limit
 * @returns {Promise} API response with paginated list of learning processes
 */
export const getStudentLearningProcessList = async (params = {}) => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().LMS_BASE_URL;
  const queryString = new URLSearchParams(params).toString();
  const url = queryString
    ? `${baseUrl}/api/learning_analytics/student-learning-process/?${queryString}`
    : `${baseUrl}/api/learning_analytics/student-learning-process/`;
  const response = await client.get(url);
  return response.data;
};

/**
 * Fetch aggregated learning process data for staff/admin dashboard
 * @returns {Promise} API response with aggregate statistics
 */
export const getStudentLearningProcessAggregate = async () => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().LMS_BASE_URL;
  const response = await client.get(
    `${baseUrl}/api/learning_analytics/student-learning-process/aggregate/`,
  );
  return response.data;
};

export default {
  getStudentLearningProcess,
  getStudentLearningProcessList,
  getStudentLearningProcessAggregate,
  trackMaterialOpened,
};
