import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import { reduxHooks } from 'hooks';
import {
  CourseFilterControls,
} from 'containers/CourseFilterControls';
import CourseListSlot from 'plugin-slots/CourseListSlot';
import NoCoursesViewSlot from 'plugin-slots/NoCoursesViewSlot';

import { useCourseListData } from './hooks';

import messages from './messages';

import './index.scss';

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
  
  // Note: Backend returns ALL visible courses for all tabs (via all_visible filter)
  // Frontend applies category-specific filtering to show correct courses per tab
  // This allows courses to appear in multiple tabs (e.g., Bo course in AI suggested + category tab)
  
  const getFilteredCourses = () => {
    if (!courseListData?.visibleList) return [];
    
    const allCourses = courseListData.visibleList;
    
    switch (activeCategory) {
      case 'ai-suggested':
        // AI suggested: Show ALL visible courses
        return allCourses;
      
      case 'elective':
        // Khoá học chung của CC, VC Bộ: Show ONLY elective courses
        return allCourses.filter(course => 
          course?.course?.courseCategory === 'elective' || course?.course?.publishType === 'elective'
        );
      
      case 'required':
        // Khoá học bắt buộc: Show ONLY mandatory courses
        return allCourses.filter(course => 
          course?.course?.courseCategory === 'mandatory' || course?.course?.publishType === 'mandatory'
        );
      
      case 'internal':
        // Khóa học nội bộ cơ quan: Show ONLY organization courses (is_public=False, created by org accounts)
        // Org courses are identified by:
        // 1. isPublic = false (private to organization)
        // 2. creatorRole = 'co_quan' (created by organization account)
        // 3. NO course_category (elective/mandatory are Bo-specific)
        return allCourses.filter(course => {
          const isPublic = course?.course?.isPublic;
          const creatorRole = course?.course?.creatorRole;
          const courseCategory = course?.course?.courseCategory;
          
          // Org courses: not public, created by org role, no Bo category
          return isPublic === false && creatorRole === 'co_quan' && !courseCategory;
        });
      
      case 'teaching':
        // Giảng dạy: Show courses where user is instructor/staff
        // This filtering is complex and should be done on backend
        // For now, show all courses (backend should have filtered already)
        return allCourses;
      
      default:
        return allCourses;
    }
  };
  
  const filteredCourses = getFilteredCourses();
  
  // Calculate course statistics
  const totalCourses = filteredCourses?.length || 0;
  const completedCourses = 0; // This would need to be calculated from actual course data
  
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
  
  // Create filtered course list data for rendering
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
