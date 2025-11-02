import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card,
  Badge,
  Button,
  ProgressBar,
} from '@openedx/paragon';
import {
  PlayCircle,
  CheckCircle,
  Star,
  ArrowRight,
} from '@openedx/paragon/icons';
import messages from '../messages';

const CourseCard = ({ course, type = 'current' }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body className="p-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="mb-1 fw-medium" style={{ fontSize: '14px' }}>
          {course.course_name}
        </h6>
        {type === 'current' && (
          <Badge variant="info" className="ms-2">
            <PlayCircle size="12" className="me-1" />
            Đang học
          </Badge>
        )}
        {type === 'completed' && (
          <Badge variant="success" className="ms-2">
            <CheckCircle size="12" className="me-1" />
            Hoàn thành
          </Badge>
        )}
        {type === 'recommended' && (
          <Badge variant="warning" className="ms-2">
            <Star size="12" className="me-1" />
            Gợi ý
          </Badge>
        )}
      </div>

      <p className="small text-muted mb-2" style={{ fontSize: '12px' }}>
        {course.course_org}
      </p>

      {(type === 'current' || type === 'recommended') && course.progress_percentage !== undefined && (
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Tiến độ</small>
            <small className="fw-medium">{Math.round(course.progress_percentage)}%</small>
          </div>
          <ProgressBar
            now={course.progress_percentage}
            variant={
              course.progress_percentage >= 80 ? 'success' :
              course.progress_percentage >= 50 ? 'info' :
              'warning'
            }
            style={{ height: '6px' }}
          />
        </div>
      )}

      {type === 'completed' && course.completion_date && (
        <small className="text-muted">
          Hoàn thành: {new Date(course.completion_date).toLocaleDateString('vi-VN')}
        </small>
      )}

      {type === 'recommended' && course.match_score && (
        <div className="mb-2">
          <small className="text-success">
            Phù hợp: {Math.round(course.match_score)}%
          </small>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-muted">
          {course.time_spent ? `${Math.round(course.time_spent / 60)}h học` : 'Chưa bắt đầu'}
        </small>
        <Button
          variant="outline-primary"
          size="sm"
          style={{ fontSize: '12px', padding: '4px 8px' }}
          onClick={() => {
            if (type === 'recommended') {
              window.open(`/courses/${course.course_id}/about`, '_blank');
            } else {
              window.open(`/course/${course.course_id}`, '_blank');
            }
          }}
        >
          {type === 'recommended' ? 'Xem' : 'Học'}
          <ArrowRight size="12" className="ms-1" />
        </Button>
      </div>
    </Card.Body>
  </Card>
);

CourseCard.propTypes = {
  course: PropTypes.shape({
    course_name: PropTypes.string,
    course_org: PropTypes.string,
    progress_percentage: PropTypes.number,
    completion_date: PropTypes.string,
    match_score: PropTypes.number,
    time_spent: PropTypes.number,
    course_id: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(['current', 'completed', 'recommended']).isRequired,
};

const CourseSidebar = ({ data }) => {
  const { formatMessage } = useIntl();

  // Extract course data - NO MOCK DATA
  const currentCourses = data?.courses?.filter(c => c.status === 'in_progress') || [];
  const completedCourses = data?.courses?.filter(c => c.status === 'completed') || [];
  const recommendedCourses = []; // Leave empty for now as requested

  return (
    <div className="course-sidebar">
      {/* Courses In Progress Section */}
      <div className="sidebar-section mb-4">
        <h5 className="sidebar-section-title mb-3">
          Khóa học đang thực hiện
        </h5>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            {currentCourses.length > 0 ? (
              <div className="course-progress-list">
                {currentCourses.map((course, index) => (
                  <div key={course.course_id || index} className="course-progress-item p-3 border-bottom">
                    {/* Course Logo/Image */}
                    <div className="d-flex align-items-start mb-3">
                      <div 
                        className="course-logo me-3"
                        style={{
                          width: '60px',
                          height: '60px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px',
                          fontWeight: 'bold',
                          flexShrink: 0,
                        }}
                      >
                        <i className="fas fa-book" />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold" style={{ fontSize: '0.9rem', lineHeight: '1.3' }}>
                          {course.course_name}
                        </h6>
                        <Badge bg="primary" className="mb-2" style={{ fontSize: '0.75rem' }}>
                          Khóa học An toàn
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="progress-section">
                      <div 
                        className="progress mb-1" 
                        style={{ 
                          height: '8px', 
                          backgroundColor: '#e9ecef',
                          borderRadius: '4px',
                        }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${course.progress_percentage || 0}%`,
                            backgroundColor: '#007bff',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                      <small className="text-muted">{Math.round(course.progress_percentage || 0)}% hoàn thành</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                  Chưa có khóa học nào đang thực hiện
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Recommended Courses Section - Empty for now */}
      <div className="sidebar-section mb-4">
        <h5 className="sidebar-section-title mb-3">
          Gợi ý khóa học
        </h5>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <div className="p-4 text-center">
              <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                Chưa có gợi ý khóa học nào
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Completed Courses Section */}
      <div className="sidebar-section">
        <h5 className="sidebar-section-title mb-3">
          Khóa học đã hoàn thành
        </h5>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            {completedCourses.length > 0 ? (
              <div className="p-3">
                {completedCourses.slice(0, 3).map((course, index) => (
                  <CourseCard key={course.course_id || index} course={course} type="completed" />
                ))}
                {completedCourses.length > 3 && (
                  <Button variant="link" size="sm" className="p-0 text-primary">
                    Xem tất cả ({completedCourses.length}) khóa học
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                  Chưa hoàn thành khóa học nào
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

CourseSidebar.propTypes = {
  data: PropTypes.shape({
    currentCourses: PropTypes.arrayOf(PropTypes.shape({
      course_name: PropTypes.string,
      course_org: PropTypes.string,
      progress_percentage: PropTypes.number,
      time_spent: PropTypes.number,
      course_id: PropTypes.string,
    })),
    recommendedCourses: PropTypes.arrayOf(PropTypes.shape({
      course_name: PropTypes.string,
      course_org: PropTypes.string,
      progress_percentage: PropTypes.number,
      match_score: PropTypes.number,
      time_spent: PropTypes.number,
      course_id: PropTypes.string,
    })),
    completedCourses: PropTypes.arrayOf(PropTypes.shape({
      course_name: PropTypes.string,
      course_org: PropTypes.string,
      completion_date: PropTypes.string,
      time_spent: PropTypes.number,
      course_id: PropTypes.string,
    })),
    achievements: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      icon: PropTypes.string,
      earned_date: PropTypes.string,
    })),
  }),
};

export default CourseSidebar;
