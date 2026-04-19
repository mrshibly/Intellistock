import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { immediate = true, params = {} } = options;

  const fetchData = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, { params: overrideParams || params });
      setData(res.data.data || res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch data';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, url]);

  return { data, loading, error, refetch: fetchData, setData };
};

export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (method, url, body) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api[method](url, body);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
