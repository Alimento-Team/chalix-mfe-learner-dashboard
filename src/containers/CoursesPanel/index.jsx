import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  Card,
  Badge,
  Button,
} from '@openedx/paragon';
import {
  Star,
  ArrowRight,
} from '@openedx/paragon/icons';

import { reduxHooks } from 'hooks';
import {
  CourseFilterControls,
} from 'containers/CourseFilterControls';
import CourseListSlot from 'plugin-slots/CourseListSlot';
import NoCoursesViewSlot from 'plugin-slots/NoCoursesViewSlot';

import { useCourseListData } from './hooks';

import messages from './messages';

import './index.scss';

const AIRecommendedCourseCard = ({ course }) => {
  const handleView = () => {
    const learningBaseUrl = (getConfig().LEARNING_BASE_URL || window.location.origin).replace(/\/$/, '');
    window.open(`${learningBaseUrl}/learning/course/${course.course_id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-1 fw-medium" style={{ fontSize: '14px', flex: 1, marginRight: '8px' }}>
            {course.course_name}
          </h6>
          <Badge variant="warning" className="ms-2 flex-shrink-0">
            <Star size="12" className="me-1" />
            Gợi ý
          </Badge>
        </div>

        {course.course_org && (
          <p className="small text-muted mb-2" style={{ fontSize: '12px' }}>{course.course_org}</p>
        )}

        {course.short_description && (
          <p className="small text-muted mb-2" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course.short_description}
          </p>
        )}

        {course.match_score > 0 && (
          <div className="mb-2">
            <small className="text-success">
              Phù hợp: {Math.round(course.match_score)}%
            </small>
          </div>
        )}

        <div className="d-flex justify-content-end mt-2">
          <Button
            variant="outline-primary"
            size="sm"
            style={{ fontSize: '12px', padding: '4px 8px' }}
            onClick={handleView}
          >
            Xem
            <ArrowRight size="12" className="ms-1" />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

AIRecommendedCourseCard.propTypes = {
  course: PropTypes.shape({
    course_id: PropTypes.string,
    course_name: PropTypes.string,
    course_org: PropTypes.string,
    short_description: PropTypes.string,
    match_score: PropTypes.number,
  }).isRequired,
};

const AIRecommendedCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const client = getAuthenticatedHttpClient();
        const baseUrl = getConfig().LMS_BASE_URL;
        const response = await client.get(`${baseUrl}/api/learning_analytics/recommendations/?limit=20`);
        const data = response.data || [];
        const mapped = data.map(course => ({
          ...course,
          course_org: course.instructor_name || course.course_org || '',
          match_score: (course.confidence_score || 0) * 100,
        }));
        setCourses(mapped);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning" role="alert">
        Không thể tải gợi ý khóa học. Vui lòng thử lại sau.
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        Chưa có gợi ý khóa học nào cho bạn.
      </div>
    );
  }

  return (
    <div className="ai-recommended-course-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {courses.map((course, index) => (
        <AIRecommendedCourseCard key={course.course_id || index} course={course} />
      ))}
    </div>
  );
};

/**
 * Renders the list of CourseCards, as well as the controls (CourseFilterControls) for modifying the list.
 * Also houses the NoCoursesView to display if the user hasn't enrolled in any courses.
 * @param {string} activeCategory - The active course category
 * @returns List of courses as CourseCards or empty state
*/
export const CoursesPanel = ({ activeCategory = 'ai-suggested' }) => {
  const { formatMessage } = useIntl();
  const hasCourses = reduxHooks.useHasCourses();
  const courseListData = useCourseListData();
  
  // Get title based on active category
  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'ai-suggested':
        return 'Khoá học do AI gợi ý';
      case 'internal':
        return 'Khoá học nội bộ cơ quan';
      case 'elective':
        return 'Khoá học chung của CC, VC Bộ';
      case 'required':
        return 'Khoá học bắt buộc';
      case 'teaching':
        return 'Giảng dạy';
      default:
        return formatMessage(messages.myCourses);
    }
  };

  // For ai-suggested tab, render the AI recommendations view
  if (activeCategory === 'ai-suggested') {
    return (
      <div className="chalix-course-list-container">
        <div className="course-list-heading-container">
          <div className="heading-content">
            <h2 className="course-list-title">{getCategoryTitle()}</h2>
          </div>
        </div>
        <div className="course-content-area">
          <AIRecommendedCourseList />
        </div>
      </div>
    );
  }

  // Note: Other tabs receive all_visible data and apply category-specific frontend filtering.
  const getFilteredCourses = () => {
    if (!courseListData?.visibleList) return [];
    
    const allCourses = courseListData.visibleList;
    
    switch (activeCategory) {
      case 'elective':
        return allCourses.filter(course => 
          course?.course?.courseCategory === 'elective' || course?.course?.publishType === 'elective'
        );
      
      case 'required':
        return allCourses.filter(course => 
          course?.course?.courseCategory === 'mandatory' || course?.course?.publishType === 'mandatory'
        );
      
      case 'internal':
        return allCourses.filter(course => {
          const isPublic = course?.course?.isPublic;
          const creatorRole = course?.course?.creatorRole;
          const courseCategory = course?.course?.courseCategory;
          return isPublic === false && creatorRole === 'co_quan' && !courseCategory;
        });
      
      case 'teaching':
        return allCourses;
      
      default:
        return allCourses;
    }
  };
  
  const filteredCourses = getFilteredCourses();
  const completedCourses = 0;
  
  const filteredCourseListData = {
    ...courseListData,
    visibleList: filteredCourses,
  };
  
  return (
    <div className="chalix-course-list-container">
      <div className="course-list-heading-container">
        <div className="heading-content">
          <h2 className="course-list-title">{getCategoryTitle()}</h2>
          <div className="course-stats">
            <div className="stat-item">
              <span className="stat-label">Số giờ đã học:</span>
              <span className="stat-value">{completedCourses}</span>
            </div>
            <div className="stat-separator">|</div>
            <div className="stat-item">
              <span className="stat-label">Tổng số giờ phải hoàn thành:</span>
              <span className="stat-value">40h</span>
            </div>
          </div>
        </div>
        <div className="course-filter-controls-container">
          <CourseFilterControls {...courseListData.filterOptions} />
        </div>
      </div>
      <div className="course-content-area">
        {hasCourses ? <CourseListSlot courseListData={filteredCourseListData} /> : <NoCoursesViewSlot />}
      </div>
    </div>
  );
};

CoursesPanel.propTypes = {
  activeCategory: PropTypes.string,
};

export default CoursesPanel;
