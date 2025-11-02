import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Card, Badge, Button } from '@openedx/paragon';
import messages from '../messages';

const CourseDetails = ({ data }) => {
  const { formatMessage } = useIntl();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // Extract courses from API response
  const courses = data?.courses || [];

  useEffect(() => {
    // Apply filter when courses change
    handleFilterChange(filterStatus);
  }, [courses]);

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

  return (
    <div className="course-details">
      {/* Filter Controls */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <h5 className="mb-0">Chi tiết khóa học ({filteredCourses.length})</h5>
            <div className="btn-group" role="group">
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
      </Card>

      {/* Course List */}
      <Card>
        <Card.Body className="p-0">
          {filteredCourses.length > 0 ? (
            <div className="course-list">
              {filteredCourses.map((course, index) => (
                <div
                  key={course.course_id || index}
                  className="course-item p-3 border-bottom"
                  style={{
                    borderBottom: index === filteredCourses.length - 1 ? 'none' : '1px solid #dee2e6',
                  }}
                >
                  <div className="row align-items-center">
                    {/* Course Info */}
                    <div className="col-md-4">
                      <h6 className="mb-1 fw-semibold">{course.course_name}</h6>
                      <small className="text-muted">{course.course_org || 'Organization'}</small>
                    </div>

                    {/* Status */}
                    <div className="col-md-2">
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
                    <div className="col-md-2">
                      <div className="progress" style={{ height: '8px', marginBottom: '4px' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${course.progress_percentage || 0}%` }}
                          aria-valuenow={course.progress_percentage || 0}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                      <small className="text-muted">
                        {Math.round(course.progress_percentage || 0)}%
                      </small>
                    </div>

                    {/* Hours */}
                    <div className="col-md-2">
                      <small className="text-muted">
                        {course.hours || 0}h / {course.total || 0}h
                      </small>
                    </div>

                    {/* Actions */}
                    <div className="col-md-2 text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          window.open(`/courses/${course.course_id}`, '_blank');
                        }}
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
      <Card className="mt-4">
        <Card.Body>
          <h6 className="mb-3 fw-semibold">Thống kê tổng quan</h6>
          <div className="row text-center">
            <div className="col-md-3">
              <h4 className="text-primary mb-1">{courses.length}</h4>
              <small className="text-muted">Tổng khóa học</small>
            </div>
            <div className="col-md-3">
              <h4 className="text-success mb-1">
                {courses.filter(c => c.status === 'completed').length}
              </h4>
              <small className="text-muted">Đã hoàn thành</small>
            </div>
            <div className="col-md-3">
              <h4 className="text-info mb-1">
                {courses.filter(c => c.status === 'in_progress').length}
              </h4>
              <small className="text-muted">Đang học</small>
            </div>
            <div className="col-md-3">
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
};

export default CourseDetails;
