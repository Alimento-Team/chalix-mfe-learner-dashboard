import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Card, Badge, Button } from '@openedx/paragon';
import LearningProcessSnapshot from './LearningProcessSnapshot';
import messages from '../messages';

const CourseDetails = ({ data, selectedCourseId }) => {
  const { formatMessage } = useIntl();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeCourseId, setActiveCourseId] = useState(selectedCourseId || '');

  // Extract courses from API response
  const courses = data?.courses || [];

  useEffect(() => {
    // Apply filter when courses change
    handleFilterChange(filterStatus);
  }, [courses]);

  useEffect(() => {
    if (selectedCourseId) {
      setActiveCourseId(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (!activeCourseId && courses.length > 0) {
      setActiveCourseId(courses[0].course_id);
    }
  }, [courses, activeCourseId]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    if (status === 'all') {
      setFilteredCourses(courses);
    } else if (status === 'completed') {
      setFilteredCourses(courses.filter(course => course.status === 'completed'));
    } else if (status === 'in_progress') {
      setFilteredCourses(courses.filter(course => course.status === 'in_progress'));
    } else if (status === 'not_started') {
      setFilteredCourses(courses.filter(course => course.status === 'not_started'));
    }
  };

  const openCourseDetail = (courseId) => {
    const learningBaseUrl = (getConfig().LEARNING_BASE_URL || 'http://apps.local.openedx.io:2000').replace(/\/$/, '');
    window.open(`${learningBaseUrl}/learning/course/${courseId}/home`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="course-details">
      <Card className="mb-4 course-details-card course-details-selector-card">
        <Card.Body className="course-details-card-body">
          <div className="course-details-header d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <h5 className="mb-0 course-details-title">Thống kê quá trình học tập theo khóa học</h5>
            <select
              className="form-control course-details-select"
              value={activeCourseId}
              onChange={(event) => setActiveCourseId(event.target.value)}
            >
              <option value="">Chọn khóa học</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name || course.course_id}
                </option>
              ))}
            </select>
          </div>
        </Card.Body>
      </Card>

      {activeCourseId ? (
        <LearningProcessSnapshot courseId={activeCourseId} />
      ) : (
        <Card className="mb-4 course-details-card">
          <Card.Body className="course-details-card-body">
            <div className="alert alert-info mb-0" role="alert">
              Vui lòng chọn một khóa học để xem thống kê quá trình học tập.
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Filter Controls And Course List */}
      <Card className="mb-4 course-details-card course-details-filter-card course-details-list-card">
        <Card.Body className="course-details-card-body course-details-filter-body">
          <div className="course-details-header d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <h5 className="mb-0 course-details-title">Chi tiết khóa học ({filteredCourses.length})</h5>
            <div className="btn-group course-details-filter-group" role="group">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleFilterChange('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === 'in_progress' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleFilterChange('in_progress')}
              >
                Đang học
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleFilterChange('completed')}
              >
                Hoàn thành
              </Button>
              <Button
                variant={filterStatus === 'not_started' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleFilterChange('not_started')}
              >
                Chưa bắt đầu
              </Button>
            </div>
          </div>
        </Card.Body>
        <Card.Body className="p-0">
          {filteredCourses.length > 0 ? (
            <div className="course-list course-details-list">
              {filteredCourses.map((course, index) => (
                <div
                  key={course.course_id || index}
                  className="course-item course-details-item border-bottom"
                  style={{
                    borderBottom: index === filteredCourses.length - 1 ? 'none' : '1px solid #dee2e6',
                  }}
                >
                  <div className="row align-items-center g-3">
                    {/* Course Info */}
                    <div className="col-md-4 course-details-info">
                      <h6 className="mb-1 fw-semibold course-details-course-name">{course.course_name}</h6>
                      <small className="text-muted course-details-course-meta">{course.course_org || 'Organization'}</small>
                    </div>

                    {/* Status */}
                    <div className="col-md-2 course-details-status">
                      {course.status === 'completed' && (
                        <Badge bg="success">Hoàn thành</Badge>
                      )}
                      {course.status === 'in_progress' && (
                        <Badge bg="info">Đang học</Badge>
                      )}
                      {course.status === 'not_started' && (
                        <Badge bg="secondary">Chưa bắt đầu</Badge>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="col-md-2 course-details-progress">
                      <div className="progress course-details-progress-bar">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${course.progress_percentage || 0}%` }}
                          aria-valuenow={course.progress_percentage || 0}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                      <small className="text-muted course-details-progress-label">
                        {Math.round(course.progress_percentage || 0)}%
                      </small>
                    </div>

                    {/* Hours */}
                    <div className="col-md-2 course-details-hours">
                      <small className="text-muted course-details-hours-label">
                        {course.hours || 0}h / {course.total || 0}h
                      </small>
                    </div>

                    {/* Actions */}
                    <div className="col-md-2 text-end course-details-action">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="course-details-action-button"
                        onClick={() => openCourseDetail(course.course_id)}
                      >
                        Xem
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-0">Không có khóa học nào phù hợp với bộ lọc.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Statistics Summary */}
      <Card className="mt-4 course-details-card course-details-summary-card">
        <Card.Body className="course-details-card-body">
          <h5 className="mb-3 course-details-title course-details-summary-title">Thống kê tổng quan</h5>
          <div className="row text-center g-3">
            <div className="col-md-3 course-details-summary-metric">
              <h4 className="text-primary mb-1">{courses.length}</h4>
              <small className="text-muted">Tổng khóa học</small>
            </div>
            <div className="col-md-3 course-details-summary-metric">
              <h4 className="text-success mb-1">
                {courses.filter(c => c.status === 'completed').length}
              </h4>
              <small className="text-muted">Đã hoàn thành</small>
            </div>
            <div className="col-md-3 course-details-summary-metric">
              <h4 className="text-info mb-1">
                {courses.filter(c => c.status === 'in_progress').length}
              </h4>
              <small className="text-muted">Đang học</small>
            </div>
            <div className="col-md-3 course-details-summary-metric">
              <h4 className="text-warning mb-1">
                {Math.round(courses.reduce((acc, c) => acc + (c.hours || 0), 0))}h
              </h4>
              <small className="text-muted">Tổng giờ học</small>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

CourseDetails.propTypes = {
  data: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.shape({
      course_name: PropTypes.string,
      course_id: PropTypes.string,
      status: PropTypes.string,
      progress_percentage: PropTypes.number,
      hours: PropTypes.number,
      total: PropTypes.number,
    })),
  }),
  selectedCourseId: PropTypes.string,
};

CourseDetails.defaultProps = {
  selectedCourseId: null,
};

export default CourseDetails;
