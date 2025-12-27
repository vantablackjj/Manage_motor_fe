// src/hooks/useTable.js
import { useState, useCallback } from 'react';
import { storageService } from '../services';

/**
 * Custom hook for table state management
 * 
 * @param {String} tableId - Unique table identifier for saving settings
 * @param {Object} defaultOptions - Default table options
 * @returns {Object} - Table state and handlers
 */
export const useTable = (tableId, defaultOptions = {}) => {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    defaultFilters = {},
    defaultSorter = {},
    saveSettings = true
  } = defaultOptions;

  // Load saved settings
  const savedSettings = saveSettings 
    ? storageService.getTableSettings(tableId) 
    : null;

  // Pagination state
  const [page, setPage] = useState(savedSettings?.page || defaultPage);
  const [pageSize, setPageSize] = useState(savedSettings?.pageSize || defaultPageSize);
  
  // Filters state
  const [filters, setFilters] = useState(savedSettings?.filters || defaultFilters);
  
  // Sorter state
  const [sorter, setSorter] = useState(savedSettings?.sorter || defaultSorter);
  
  // Selected rows
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // Save settings to localStorage
  const saveTableSettings = useCallback((settings) => {
    if (saveSettings && tableId) {
      storageService.saveTableSettings(tableId, settings);
    }
  }, [tableId, saveSettings]);

  // Handle pagination change
  const handlePaginationChange = useCallback((newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
    saveTableSettings({ page: newPage, pageSize: newPageSize, filters, sorter });
  }, [filters, sorter, saveTableSettings]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1); // Reset to first page when filter changes
    saveTableSettings({ page: 1, pageSize, filters: newFilters, sorter });
  }, [filters, pageSize, sorter, saveTableSettings]);

  // Handle multiple filters change
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    saveTableSettings({ page: 1, pageSize, filters: newFilters, sorter });
  }, [pageSize, sorter, saveTableSettings]);

  // Handle sorter change
  const handleSorterChange = useCallback((newSorter) => {
    setSorter(newSorter);
    saveTableSettings({ page, pageSize, filters, sorter: newSorter });
  }, [page, pageSize, filters, saveTableSettings]);

  // Handle table change (pagination, filters, sorter combined)
  const handleTableChange = useCallback((pagination, tableFilters, tableSorter) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    setFilters(tableFilters);
    setSorter(tableSorter);
    
    saveTableSettings({
      page: pagination.current,
      pageSize: pagination.pageSize,
      filters: tableFilters,
      sorter: tableSorter
    });
  }, [saveTableSettings]);

  // Handle row selection
  const handleRowSelectionChange = useCallback((keys, rows) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(1);
    saveTableSettings({ page: 1, pageSize, filters: defaultFilters, sorter });
  }, [defaultFilters, pageSize, sorter, saveTableSettings]);

  // Reset all
  const resetTable = useCallback(() => {
    setPage(defaultPage);
    setPageSize(defaultPageSize);
    setFilters(defaultFilters);
    setSorter(defaultSorter);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    
    if (saveSettings && tableId) {
      storageService.saveTableSettings(tableId, {
        page: defaultPage,
        pageSize: defaultPageSize,
        filters: defaultFilters,
        sorter: defaultSorter
      });
    }
  }, [
    defaultPage,
    defaultPageSize,
    defaultFilters,
    defaultSorter,
    saveSettings,
    tableId
  ]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, []);

  // Pagination config for Ant Design Table
  const paginationConfig = {
    current: page,
    pageSize: pageSize,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `Tổng ${total} bản ghi`,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: handlePaginationChange,
    onShowSizeChange: handlePaginationChange
  };

  // Row selection config for Ant Design Table
  const rowSelectionConfig = {
    selectedRowKeys,
    onChange: handleRowSelectionChange,
    preserveSelectedRowKeys: true
  };

  return {
    // State
    page,
    pageSize,
    filters,
    sorter,
    selectedRowKeys,
    selectedRows,
    
    // Setters
    setPage,
    setPageSize,
    setFilters,
    setSorter,
    setSelectedRowKeys,
    setSelectedRows,
    
    // Handlers
    handlePaginationChange,
    handleFilterChange,
    handleFiltersChange,
    handleSorterChange,
    handleTableChange,
    handleRowSelectionChange,
    
    // Reset functions
    resetFilters,
    resetTable,
    clearSelection,
    
    // Ant Design configs
    paginationConfig,
    rowSelectionConfig
  };
};

export default useTable;