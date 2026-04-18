import { useState, useEffect } from 'react';
import { getStudentLearningProcess } from '../services/lms/studentProcessApi';

/**
 * Hook to manage student learning process snapshot data
 * Fetches the authenticated user's own learning process metrics on mount
 * @returns {Object} Object with:
 *   - snapshot: Student learning process data or null
 *   - loading: Boolean indicating if data is being fetched
 *   - error: Error object if fetch failed, null otherwise
 *   - refetch: Function to manually refetch the data
 */
export const useStudentLearningProcess = (courseId = null) => {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSnapshot = async () => {
    if (!courseId) {
      setSnapshot(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = { course_id: courseId };
      const data = await getStudentLearningProcess(params);
      setSnapshot(data || null);
      setError(null);
    } catch (err) {
      // 404 is expected if no learning process snapshot exists yet
      if (err.response?.status === 404) {
        setSnapshot(null);
        setError(null);
      } else {
        console.error('Failed to fetch learning process snapshot:', err);
        setError(err);
        setSnapshot(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, [courseId]);

  const refetch = () => {
    fetchSnapshot();
  };

  return {
    snapshot,
    loading,
    error,
    refetch,
  };
};

export default {
  useStudentLearningProcess,
};
