import React, { useState, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Row,
  Col,
  Card,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import messages from '../messages';
// Import the reusable LearningResultsFilter component from the local MFE source
// Using a relative import here avoids needing the package to be installed in node_modules
// Import local copy of the component
import LearningResultsFilter from '../../../components/LearningResultsFilter/LearningResultsFilter';

const LearningOverview = ({ data }) => {
  const { formatMessage } = useIntl();
  const [learningHoursData, setLearningHoursData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Local filter state for the UI (must be declared at top-level to keep hooks order stable)
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchLearningHours = async () => {
      try {
        const client = getAuthenticatedHttpClient();
        const baseUrl = getConfig().LMS_BASE_URL;
        const response = await client.get(`${baseUrl}/api/learning_analytics/courses/`);
        setLearningHoursData(response.data);
      } catch (err) {
        console.error('Failed to fetch learning hours:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningHours();
  }, []);

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

    // Year filter - only if course.year exists
    if (selectedYear && selectedYear !== 'all' && course.year) {
      if (course.year.toString() !== selectedYear.toString()) {
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
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="statistics-icon me-3">
              <i className="fas fa-chart-line text-primary" style={{ fontSize: '24px' }} />
            </div>
            <h4 className="mb-0 fw-bold text-dark">QUÁ TRÌNH HỌC TẬP</h4>
          </div>
          
          <Row className="g-4">
            <Col md={4}>
              <div className="stat-box">
                <div className="stat-label text-muted mb-2">Số khóa học đã tham gia: <strong>{totalCourses} khóa</strong></div>
                <div className="stat-label text-muted mb-2">Số khóa học đã hoàn thành: <strong>{completedCourses} khóa</strong></div>
                <div className="stat-label text-muted">Thời gian trung bình hoàn thành khóa học: <strong>{averageHoursPerCourse}h/khóa</strong></div>
              </div>
            </Col>
            <Col md={4}>
              <div className="stat-box">
                <div className="stat-label text-muted mb-2">Số bài kiểm tra đã hoàn thành: <strong>{testsCompleted}</strong></div>
                <div className="stat-label text-muted">Số chứng chỉ đã hoàn thành: <strong>{certificatesEarned} chứng chỉ</strong></div>
              </div>
            </Col>
            <Col md={4}>
              <div className="stat-box">
                {/* Replace simple buttons with the LearningResultsFilter dropdowns */}
                <LearningResultsFilter
                  selectedStatus={selectedStatus}
                  selectedYear={selectedYear}
                  onStatusChange={(value) => setSelectedStatus(value)}
                  onYearChange={(value) => setSelectedYear(value)}
                  className=""
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Learning Hours Statistics Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h4 className="mb-4 fw-bold text-center text-dark">
            THỐNG KÊ SỐ GIỜ HỌC CÁ NHÂN NĂM {currentYear}
          </h4>

          <div className="table-responsive">
            <table className="table table-bordered table-hover learning-hours-table mb-4">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{ width: '80px' }}>ID</th>
                  <th>Họ và tên</th>
                  <th className="text-center" style={{ width: '150px' }}>Số giờ (thực tế / cấu hình)</th>
                  <th className="text-center" style={{ width: '200px' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="text-center">{course.id}</td>
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
            <p className="text-muted mb-2" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
              Ghi chú: Số tiết 4/4 tương ứng số giờ đã học/tổng số giờ phải học
            </p>
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
