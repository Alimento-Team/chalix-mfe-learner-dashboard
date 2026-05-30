import { useEffect, useState } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getAccountProfile } from '../services/lms/accountApi';

export const useAccountProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const authenticatedUser = getAuthenticatedUser();
      const username = authenticatedUser?.username;
      if (!username) {
        setProfile(null);
        setError(null);
        return;
      }

      const data = await getAccountProfile(username);
      setProfile(data || null);
      setError(null);
    } catch (err) {
      setProfile(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};

export default {
  useAccountProfile,
};
