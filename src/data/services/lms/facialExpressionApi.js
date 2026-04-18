import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

/**
 * Upload a facial-expression recording for a learner and material context.
 */
export const uploadFacialExpressionVideo = async ({
  videoFile,
  courseId,
  unitId,
  topicId,
  timestamp,
  isFinal = true,
  durationSeconds = 10,
}) => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().LMS_BASE_URL;

  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('course_id', courseId);
  formData.append('unit_id', unitId);
  if (topicId) {
    formData.append('topic_id', topicId);
  }
  formData.append('timestamp', timestamp || new Date().toISOString());
  formData.append('is_final', String(isFinal));
  formData.append('duration_seconds', String(durationSeconds));

  const response = await client.post(
    `${baseUrl}/api/facial-expression/upload/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
};

export default {
  uploadFacialExpressionVideo,
};
