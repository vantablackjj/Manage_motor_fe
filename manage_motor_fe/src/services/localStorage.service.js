// src/services/storage.service.js
// LocalStorage management service

class StorageService {
  // ===== BASIC OPERATIONS =====

  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  exists(key) {
    return localStorage.getItem(key) !== null;
  }

  // ===== ADVANCED OPERATIONS =====

  // Set with expiration time
  setWithExpiry(key, value, ttl) {
    try {
      const now = new Date();
      const item = {
        value: value,
        expiry: now.getTime() + ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Storage setWithExpiry error:', error);
      return false;
    }
  }

  // Get with expiration check
  getWithExpiry(key, defaultValue = null) {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return defaultValue;

      const item = JSON.parse(itemStr);
      const now = new Date();

      // Check if expired
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      console.error('Storage getWithExpiry error:', error);
      return defaultValue;
    }
  }

  // ===== USER PREFERENCES =====

  setUserPreference(key, value) {
    const preferences = this.get('userPreferences', {});
    preferences[key] = value;
    return this.set('userPreferences', preferences);
  }

  getUserPreference(key, defaultValue = null) {
    const preferences = this.get('userPreferences', {});
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  }

  clearUserPreferences() {
    return this.remove('userPreferences');
  }

  // ===== FORM DRAFT =====

  saveDraft(formName, formData) {
    const drafts = this.get('formDrafts', {});
    drafts[formName] = {
      data: formData,
      savedAt: new Date().toISOString()
    };
    return this.set('formDrafts', drafts);
  }

  getDraft(formName) {
    const drafts = this.get('formDrafts', {});
    return drafts[formName]?.data || null;
  }

  removeDraft(formName) {
    const drafts = this.get('formDrafts', {});
    delete drafts[formName];
    return this.set('formDrafts', drafts);
  }

  hasDraft(formName) {
    const drafts = this.get('formDrafts', {});
    return !!drafts[formName];
  }

  getAllDrafts() {
    return this.get('formDrafts', {});
  }

  // ===== RECENT ITEMS =====

  addRecentItem(category, item, maxItems = 10) {
    const key = `recent_${category}`;
    const recentItems = this.get(key, []);

    // Remove duplicate if exists
    const filtered = recentItems.filter(i => i.id !== item.id);

    // Add to beginning
    filtered.unshift(item);

    // Limit to maxItems
    const limited = filtered.slice(0, maxItems);

    return this.set(key, limited);
  }

  getRecentItems(category, limit = 10) {
    const key = `recent_${category}`;
    const items = this.get(key, []);
    return items.slice(0, limit);
  }

  clearRecentItems(category) {
    const key = `recent_${category}`;
    return this.remove(key);
  }

  // ===== SEARCH HISTORY =====

  addSearchHistory(query, maxHistory = 20) {
    if (!query || !query.trim()) return false;

    const history = this.get('searchHistory', []);
    
    // Remove duplicate
    const filtered = history.filter(q => q !== query);
    
    // Add to beginning
    filtered.unshift(query);
    
    // Limit to maxHistory
    const limited = filtered.slice(0, maxHistory);
    
    return this.set('searchHistory', limited);
  }

  getSearchHistory(limit = 10) {
    const history = this.get('searchHistory', []);
    return history.slice(0, limit);
  }

  clearSearchHistory() {
    return this.remove('searchHistory');
  }

  // ===== TABLE SETTINGS =====

  saveTableSettings(tableId, settings) {
    const allSettings = this.get('tableSettings', {});
    allSettings[tableId] = settings;
    return this.set('tableSettings', allSettings);
  }

  getTableSettings(tableId, defaultSettings = {}) {
    const allSettings = this.get('tableSettings', {});
    return allSettings[tableId] || defaultSettings;
  }

  // ===== FILTER SETTINGS =====

  saveFilterSettings(pageId, filters) {
    const key = `filters_${pageId}`;
    return this.set(key, filters);
  }

  getFilterSettings(pageId) {
    const key = `filters_${pageId}`;
    return this.get(key, {});
  }

  clearFilterSettings(pageId) {
    const key = `filters_${pageId}`;
    return this.remove(key);
  }

  // ===== CACHE =====

  setCache(key, value, ttl = 3600000) { // Default 1 hour
    return this.setWithExpiry(`cache_${key}`, value, ttl);
  }

  getCache(key) {
    return this.getWithExpiry(`cache_${key}`);
  }

  clearCache(key) {
    return this.remove(`cache_${key}`);
  }

  clearAllCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    return true;
  }

  // ===== THEME =====

  setTheme(theme) {
    return this.set('theme', theme);
  }

  getTheme() {
    return this.get('theme', 'light');
  }

  // ===== LANGUAGE =====

  setLanguage(language) {
    return this.set('language', language);
  }

  getLanguage() {
    return this.get('language', 'vi');
  }

  // ===== SIDEBAR =====

  setSidebarCollapsed(collapsed) {
    return this.set('sidebarCollapsed', collapsed);
  }

  getSidebarCollapsed() {
    return this.get('sidebarCollapsed', false);
  }

  // ===== UTILITIES =====

  getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  getStorageSizeInMB() {
    return (this.getStorageSize() / 1024 / 1024).toFixed(2);
  }

  isStorageFull() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return false;
    } catch (e) {
      return true;
    }
  }

  exportStorage() {
    const data = {};
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        data[key] = localStorage[key];
      }
    }
    return JSON.stringify(data);
  }

  importStorage(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      for (let key in data) {
        localStorage.setItem(key, data[key]);
      }
      return true;
    } catch (error) {
      console.error('Storage import error:', error);
      return false;
    }
  }

  // ===== SESSION STORAGE =====

  setSession(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Session storage set error:', error);
      return false;
    }
  }

  getSession(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Session storage get error:', error);
      return defaultValue;
    }
  }

  removeSession(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Session storage remove error:', error);
      return false;
    }
  }

  clearSession() {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Session storage clear error:', error);
      return false;
    }
  }
}

export default new StorageService();