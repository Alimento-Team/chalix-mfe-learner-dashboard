import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

const lmsBaseUrl = () => getConfig().LMS_BASE_URL;

const decodeHtmlEntities = (html) => {
  if (!html || typeof html !== 'string') return '';

  let decoded = html;
  for (let i = 0; i < 2; i += 1) {
    if (!decoded.includes('&lt;') && !decoded.includes('&gt;') && !decoded.includes('&amp;')) {
      break;
    }
    const textarea = document.createElement('textarea');
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }

  return decoded;
};

/**
 * Fetch all currently published and date-active demand surveys.
 * @returns {Promise<{surveys: Array}>}
 */
export const fetchActiveSurveys = async () => {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${lmsBaseUrl()}/api/chalix/user-menu/surveys/`);
  return data;
};

/**
 * Fetch survey detail, grouped choices, user pre-fill, and already_submitted flag.
 * @param {string} publicToken
 * @returns {Promise<{survey, groups, user_prefill, already_submitted}>}
 */
export const fetchSurveyDetail = async (publicToken) => {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${lmsBaseUrl()}/api/chalix/user-menu/surveys/${publicToken}/`);
  return data;
};

/**
 * Fetch the detail_html for a single choice (lazy-loaded on "Chi tiết" click).
 * @param {string} publicToken
 * @param {number} choiceId
 * @returns {Promise<{name, detail_html}>}
 */
export const fetchChoiceDetail = async (publicToken, choiceId) => {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${lmsBaseUrl()}/api/chalix/user-menu/surveys/${publicToken}/choices/${choiceId}/detail/`);

  if (data && data.success === false) {
    throw new Error(data.error || 'Không thể tải chi tiết');
  }

  // LMS currently returns nested payload: { success, choice: { ... } }.
  // Keep compatibility with any existing flat payload.
  const choice = data?.choice || data || {};
  return {
    id: choice.id,
    name: choice.name,
    detail_html: decodeHtmlEntities(choice.detail_html || ''),
  };
};

/**
 * Submit the learner's survey response.
 * @param {string} publicToken
 * @param {{ full_name, email, phone_number, selected_choice_ids, other_text }} payload
 * @returns {Promise<{success, message}>}
 */
export const submitSurveyResponse = async (publicToken, payload) => {
  const { data } = await getAuthenticatedHttpClient()
    .post(`${lmsBaseUrl()}/api/chalix/user-menu/surveys/${publicToken}/submit/`, payload);
  return data;
};
