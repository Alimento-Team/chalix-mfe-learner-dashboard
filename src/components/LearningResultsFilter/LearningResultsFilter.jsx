/**
 * Local copy of LearningResultsFilter for the learner-dashboard app
 * This mirrors the component in the shared MFE so the dashboard can use it
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './LearningResultsFilter.scss';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'enrolled', label: 'Đã ghi danh' },
  { value: 'in-progress', label: 'Đang học' },
  { value: 'failed-exam', label: 'Thi thất bại' },
  { value: 'success', label: 'Thành công' },
];

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [{ value: 'all', label: 'Tất cả' }];
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    years.push({ value: year.toString(), label: `Năm ${year}` });
  }
  return years;
};

const LearningResultsFilter = ({
  onStatusChange,
  onYearChange,
  selectedStatus,
  selectedYear,
  className,
}) => {
  const yearOptions = getYearOptions();

  return (
    <div className={classNames('learning-results-filter', className)}>
      <div className="filter-section">
        <label className="filter-section-label">Lọc theo trạng thái</label>
        <select
          className="filter-dropdown"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Lọc theo trạng thái"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-section-label">Lọc theo năm</label>
        <select
          className="filter-dropdown"
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          aria-label="Lọc theo năm"
        >
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

LearningResultsFilter.propTypes = {
  onStatusChange: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
  selectedStatus: PropTypes.string,
  selectedYear: PropTypes.string,
  className: PropTypes.string,
};

LearningResultsFilter.defaultProps = {
  selectedStatus: 'all',
  selectedYear: 'all',
  className: '',
};

export default LearningResultsFilter;
