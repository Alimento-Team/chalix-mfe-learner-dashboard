import React, { useState, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import messages from '../messages';

const LearningOverview = ({ data }) => {
  const { formatMessage } = useIntl();
  const [learningHoursData, setLearningHoursData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  // Local filter state for the UI (must be declared at top-level to keep hooks order stable)
  const [selectedStatus, setSelectedStatus] = useState('all');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  useEffect(() => {
    const fetchLearningHours = async () => {
      try {
        // Only show full loading on initial load, not on year changes
        if (!learningHoursData) {
          setLoading(true);
        } else {
          setTableLoading(true);
        }
        
        const client = getAuthenticatedHttpClient();
        const baseUrl = getConfig().LMS_BASE_URL;
        
        // Add year parameter to API call if a specific year is selected
        const params = new URLSearchParams();
        if (selectedYear && selectedYear !== 'all') {
          params.append('year', selectedYear);
        }
        
        const url = `${baseUrl}/api/learning_analytics/courses/${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await client.get(url);
        setLearningHoursData(response.data);
        
        // Debug logging
        if (response.data?.courses && response.data.courses.length > 0) {
          console.log('Selected Year:', selectedYear);
          console.log('Sample course data:', response.data.courses[0]);
          console.log('Total courses count:', response.data.courses.length);
        }
      } catch (err) {
        console.error('Failed to fetch learning hours:', err);
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    };

    fetchLearningHours();
  }, [selectedYear]); // Only re-fetch when selectedYear changes

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Use real API data
  const coursesData = learningHoursData?.courses || [];

  // Map filter values (from LearningResultsFilter) to the course.status strings used in data
  const STATUS_VALUE_TO_LABEL = {
    enrolled: 'Đã ghi danh',
    'in-progress': 'Đang học',
    'failed-exam': 'Thi thất bại',
    success: 'Hoàn thành',
  };

  // Mapping for backend status values to Vietnamese labels
  const BACKEND_STATUS_TO_LABEL = {
    completed: 'Hoàn thành',
    in_progress: 'Đang học',
    not_started: 'Chưa bắt đầu',
    failed: 'Không đạt',
    success: 'Hoàn thành',
  };

  // Apply simple filtering based on selectedStatus and selectedYear (if present on course)
  const filteredCourses = coursesData.filter((course) => {
    // Status filter
    if (selectedStatus && selectedStatus !== 'all') {
      const expectedLabel = STATUS_VALUE_TO_LABEL[selectedStatus];
      if (!expectedLabel || course.status !== expectedLabel) {
        return false;
      }
    }

    // Year filter - extract year from course enrollment/created date
    if (selectedYear && selectedYear !== 'all') {
      let courseYear = null;
      
      // Try multiple fields to get the year
      if (course.year) {
        courseYear = course.year.toString();
      } else if (course.enrollment_date) {
        try {
          courseYear = new Date(course.enrollment_date).getFullYear().toString();
        } catch (e) {
          console.warn('Invalid enrollment_date:', course.enrollment_date);
        }
      } else if (course.enrolled_at) {
        try {
          courseYear = new Date(course.enrolled_at).getFullYear().toString();
        } catch (e) {
          console.warn('Invalid enrolled_at:', course.enrolled_at);
        }
      } else if (course.created_at) {
        try {
          courseYear = new Date(course.created_at).getFullYear().toString();
        } catch (e) {
          console.warn('Invalid created_at:', course.created_at);
        }
      } else if (course.start_date) {
        try {
          courseYear = new Date(course.start_date).getFullYear().toString();
        } catch (e) {
          console.warn('Invalid start_date:', course.start_date);
        }
      }
      
      // Only include courses that match the selected year
      if (courseYear && courseYear !== selectedYear) {
        return false;
      }
      
      // If no year could be determined, exclude the course when filtering by year
      if (!courseYear) {
        return false;
      }
    }

    return true;
  });

  // Use backend-loaded (and filtered) course values for metrics
  const totalCompleted = filteredCourses.reduce((sum, course) => sum + (course.hours || 0), 0);
  // Only count configured courses (where total is not null) for totalRequired
  const totalRequired = filteredCourses
    .filter(course => course.total != null)
    .reduce((sum, course) => sum + (course.total || 0), 0);
  const totalCourses = filteredCourses.length;
  const completedCourses = filteredCourses.filter(c => c.status === 'Hoàn thành' || c.status === 'completed' || c.status === 'success').length;
  const inProgressCourses = filteredCourses.filter(c => c.status === 'Đang học' || c.status === 'in-progress' || c.status === 'started').length;
  const completionPercentage = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

  // Calculate average time per course (only for completed courses)
  const completedCoursesWithHours = filteredCourses.filter(c => (c.status === 'Hoàn thành' || c.status === 'completed' || c.status === 'success') && (c.hours > 0));
  const averageHoursPerCourse = completedCoursesWithHours.length > 0
    ? Math.round(completedCoursesWithHours.reduce((sum, c) => sum + (c.hours || 0), 0) / completedCoursesWithHours.length)
    : 0;

  // Get statistics from API data
  const testsCompleted = learningHoursData?.tests_completed || 0;
  const certificatesEarned = learningHoursData?.certificates_earned || 0;

  // Calculate time-based statistics
  const currentMonth = new Date().toLocaleString('vi-VN', { month: 'long' });
  const currentMonthYear = `Năm ${currentYear}`;

  return (
    <div className="learning-overview-vietnamese">
      {/* Learning Process Statistics Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <div className="statistics-icon me-3">
                <i className="fas fa-chart-line text-primary" style={{ fontSize: '24px' }} />
              </div>
              <h4 className="mb-0 fw-bold text-dark">QUÁ TRÌNH HỌC TẬP</h4>
            </div>
          </div>
          
          <div className="stats-grid-container">
            <div className="stats-left">
              <div className="stat-item">
                <div className="stat-label text-muted">Số khóa tham gia: <strong>{totalCourses}</strong></div>
              </div>
              <div className="stat-item">
                <div className="stat-label text-muted">Số khóa hoàn thành: <strong>{completedCourses} khóa</strong></div>
              </div>
              <div className="stat-item">
                <div className="stat-label text-muted">Thời gian trung bình: <strong>{averageHoursPerCourse}h/khóa</strong></div>
              </div>
            </div>
            
            <div className="stats-middle">
              <div className="stat-item">
                <div className="stat-label text-muted">Số bài kiểm tra (đạt): <strong>{testsCompleted}</strong></div>
              </div>
              <div className="stat-item">
                <div className="stat-label text-muted">Số chứng chỉ (đạt): <strong>{certificatesEarned}</strong></div>
              </div>
            </div>
            
            <div className="stats-right">
              <div className="filter-row">
                <label className="filter-label">Trạng thái</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  aria-label="Lọc theo trạng thái"
                >
                  <option value="all">Tất cả</option>
                  <option value="enrolled">Đã ghi danh</option>
                  <option value="in-progress">Đang học</option>
                  <option value="failed-exam">Thi thất bại</option>
                  <option value="success">Thành công</option>
                </select>
              </div>
              <div className="filter-row">
                <label className="filter-label">Năm</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  aria-label="Lọc theo năm"
                >
                  <option value="all">Tất cả</option>
                  <option value={currentYear.toString()}>Năm {currentYear}</option>
                  <option value={(currentYear - 1).toString()}>Năm {currentYear - 1}</option>
                  <option value={(currentYear - 2).toString()}>Năm {currentYear - 2}</option>
                  <option value={(currentYear - 3).toString()}>Năm {currentYear - 3}</option>
                  <option value={(currentYear - 4).toString()}>Năm {currentYear - 4}</option>
                </select>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Learning Hours Statistics Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h4 className="mb-4 fw-bold text-center text-dark">
            THỐNG KÊ SỐ GIỜ HỌC CÁ NHÂN NĂM {selectedYear !== 'all' ? selectedYear : currentYear}
          </h4>

          <div className="table-responsive" style={{ position: 'relative', opacity: tableLoading ? 0.6 : 1 }}>
            {tableLoading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}>
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="sr-only">Đang tải...</span>
                </div>
              </div>
            )}
            <table className="table table-bordered table-hover learning-hours-table mb-4">
              <thead className="table-light">
                <tr>
                  <th>Tên khóa học</th>
                  <th className="text-center" style={{ width: '150px' }}>Số giờ (thực tế / cấu hình)</th>
                  <th className="text-center" style={{ width: '200px' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.name}</td>
                    <td className="text-center">
                      <span className="fw-semibold">
                        {(course.hours ?? 0)}h / {course.total != null ? `${course.total}h` : <span className="text-muted">Chưa cấu hình</span>}
                      </span>
                    </td>
                    <td className="text-center">
                      {(() => {
                        const rawStatus = course.status || '';
                        // prefer server-provided human text when available
                        const statusLabel = course.status_text
                          || BACKEND_STATUS_TO_LABEL[rawStatus]
                          || STATUS_VALUE_TO_LABEL[rawStatus]
                          || rawStatus;
                        const badgeClass = statusLabel === 'Hoàn thành' ? 'bg-success' : 'bg-warning text-dark';
                        return (
                          <span className={`badge ${badgeClass}`}>
                            {statusLabel}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="completion-note">
            <p className="fw-bold text-dark mb-0" style={{ fontSize: '1.1rem' }}>
              Tỷ lệ hoàn thành trong năm: <span className="text-primary">{completionPercentage}%</span>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

LearningOverview.propTypes = {
  data: PropTypes.shape({
    summary: PropTypes.shape({
      totalCourses: PropTypes.number,
      completedCourses: PropTypes.number,
      inProgressCourses: PropTypes.number,
      certificatesEarned: PropTypes.number,
    }),
    courseProgress: PropTypes.arrayOf(
      PropTypes.shape({
        courseId: PropTypes.string,
        courseName: PropTypes.string,
        progressPercentage: PropTypes.number,
        timeSpent: PropTypes.number,
        lastAccessed: PropTypes.string,
      })
    ),
    learningStreak: PropTypes.number,
    studyTimeToday: PropTypes.number,
    weeklyGoals: PropTypes.shape({
      studyMinutes: PropTypes.number,
      targetStudyMinutes: PropTypes.number,
      completedAssignments: PropTypes.number,
      targetAssignments: PropTypes.number,
    }),
  }),
};

LearningOverview.defaultProps = {
  data: null,
};

export default LearningOverview;
