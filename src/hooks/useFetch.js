// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services';

/**
 * Custom hook for data fetching
 * 
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Object} options - Hook options
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useFetch = (fetchFn, options = {}) => {
  const {
    immediate = true,
    onSuccess,
    onError,
    defaultValue = null,
    showErrorNotification = true
  } = options;

  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      
      if (showErrorNotification) {
        notificationService.error(
          err?.response?.data?.message || 'Không thể tải dữ liệu'
        );
      }
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError, showErrorNotification]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  };
};

/**
 * Custom hook for paginated data fetching
 * 
 * @param {Function} fetchFn - Async function to fetch paginated data
 * @param {Object} options - Hook options
 * @returns {Object} - { data, loading, error, pagination, refetch, handleTableChange }
 */
export const useFetchPaginated = (fetchFn, options = {}) => {
  const {
    immediate = true,
    defaultPage = 1,
    defaultPageSize = 10,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: defaultPage,
    pageSize: defaultPageSize,
    total: 0
  });

  const fetchData = useCallback(async (page = pagination.current, pageSize = pagination.pageSize, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn({
        page,
        limit: pageSize,
        ...filters
      });
      
      setData(result.data || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: result.total || 0
      });
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      notificationService.error('Không thể tải dữ liệu');
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pagination.current, pagination.pageSize, onSuccess, onError]);

  const handleTableChange = (paginationConfig, filters, sorter) => {
    fetchData(paginationConfig.current, paginationConfig.pageSize, filters);
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    pagination,
    refetch: fetchData,
    handleTableChange,
    setData
  };
};