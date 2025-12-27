// src/components/common/DataTable/DataTable.jsx
import React from "react";
import { Table, Card } from "antd";
import { useResponsive } from "../../../hooks/useResponsive";
import "./DataTable.css";

/**
 * Reusable DataTable Component
 *
 * @param {Array} columns - Table columns configuration
 * @param {Array} dataSource - Table data
 * @param {Boolean} loading - Loading state
 * @param {Object} pagination - Pagination config
 * @param {Function} onChange - Handle table change (pagination, filters, sorter)
 * @param {Object} rowSelection - Row selection config
 * @param {String} rowKey - Row key field
 * @param {Object} scroll - Scroll config
 * @param {Boolean} bordered - Show border
 * @param {String} size - Table size (small, middle, large)
 * @param {Object} summary - Table summary
 * @param {Boolean} showCard - Wrap in Card
 * @param {String} cardTitle - Card title
 * @param {React.Node} cardExtra - Card extra content
 * @param {Object} locale - Locale config
 */
const DataTable = ({
  columns = [],
  dataSource = [],
  loading = false,
  pagination = {},
  onChange,
  rowSelection,
  rowKey = "id",
  scroll,
  bordered = false,
  size = "middle",
  summary,
  showCard = true,
  cardTitle,
  cardExtra,
  locale = {
    emptyText: "Không có dữ liệu",
  },
  ...restProps
}) => {
  const { isMobile } = useResponsive();

  // Default pagination config
  const defaultPagination = {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `Tổng ${total} bản ghi`,
    pageSizeOptions: ["10", "20", "50", "100"],
    defaultPageSize: 10,
    size: isMobile ? "small" : "default",
    simple: isMobile,
    ...pagination,
  };

  // Default scroll config
  const defaultScroll = {
    x: isMobile ? 800 : scroll?.x || "max-content",
    y: scroll?.y,
  };

  // Adjust table size on mobile
  const tableSize = isMobile ? "small" : size;

  const tableElement = (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={defaultPagination}
      onChange={onChange}
      rowSelection={rowSelection}
      rowKey={rowKey}
      scroll={defaultScroll}
      bordered={bordered}
      size={tableSize}
      summary={summary}
      locale={locale}
      className="data-table"
      {...restProps}
    />
  );

  if (showCard) {
    return (
      <Card title={cardTitle} extra={cardExtra} className="data-table-card">
        {tableElement}
      </Card>
    );
  }

  return tableElement;
};

export default DataTable;
