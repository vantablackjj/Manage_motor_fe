// src/utils/helpers.js
// Helper functions

import dayjs from 'dayjs';
import { DATE_FORMAT, DATETIME_FORMAT, API_DATE_FORMAT } from './constant';

// ===== DATE HELPERS =====

export const formatDate = (date, format = DATE_FORMAT) => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDateTime = (date, format = DATETIME_FORMAT) => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDateForAPI = (date) => {
  if (!date) return '';
  return dayjs(date).format(API_DATE_FORMAT);
};

export const parseDate = (dateString) => {
  if (!dateString) return null;
  return dayjs(dateString);
};

export const isDateInRange = (date, startDate, endDate) => {
  const d = dayjs(date);
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return d.isAfter(start) && d.isBefore(end);
};

export const getDaysFromNow = (date) => {
  if (!date) return 0;
  return dayjs().diff(dayjs(date), 'day');
};

export const addDays = (date, days) => {
  return dayjs(date).add(days, 'day').toDate();
};

// ===== NUMBER HELPERS =====

export const formatCurrency = (amount, currency = 'VND') => {
  if (amount === null || amount === undefined) return '0 ₫';
  
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return formatted;
};

export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '0';
  
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

export const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Remove all non-digit characters except decimal point
  const cleaned = value.toString().replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

export const calculateTotal = (items, key) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (parseNumber(item[key]) || 0), 0);
};

// ===== STRING HELPERS =====

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(capitalizeFirst).join(' ');
};

export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const removeAccents = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const slugify = (str) => {
  if (!str) return '';
  return removeAccents(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const searchFilter = (text, searchTerm) => {
  if (!searchTerm) return true;
  if (!text) return false;
  
  const normalizedText = removeAccents(text.toLowerCase());
  const normalizedSearch = removeAccents(searchTerm.toLowerCase());
  
  return normalizedText.includes(normalizedSearch);
};

// ===== VALIDATION HELPERS =====

export const isEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isPhone = (phone) => {
  const re = /^[0-9]{10,11}$/;
  return re.test(phone.replace(/[\s-]/g, ''));
};

export const isValidCMND = (cmnd) => {
  const re = /^[0-9]{9,12}$/;
  return re.test(cmnd);
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

// ===== ARRAY HELPERS =====

export const sortByKey = (array, key, order = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === bVal) return 0;
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

export const uniqueBy = (array, key) => {
  if (!Array.isArray(array)) return [];
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const arrayToOptions = (array, labelKey = 'label', valueKey = 'value') => {
  if (!Array.isArray(array)) return [];
  
  return array.map(item => ({
    label: item[labelKey],
    value: item[valueKey]
  }));
};

// ===== OBJECT HELPERS =====

export const pick = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return {};
  
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

export const omit = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return {};
  
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return {};
  
  return Object.keys(obj).reduce((acc, key) => {
    if (!isEmpty(obj[key])) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

// ===== FILE HELPERS =====

export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ===== DEBOUNCE & THROTTLE =====

export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===== STORAGE HELPERS =====

export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

// ===== COLOR HELPERS =====

export const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(0, 0, 0, ${alpha})`;
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getContrastColor = (hexColor) => {
  if (!hexColor) return '#000000';
  
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// ===== CLIPBOARD =====

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy to clipboard error:', error);
    return false;
  }
};