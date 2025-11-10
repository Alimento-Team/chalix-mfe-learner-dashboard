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
  
  // Calculate course statistics
  const totalCourses = courseListData?.visibleList?.length || 0;
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
        {hasCourses ? <CourseListSlot courseListData={courseListData} /> : <NoCoursesViewSlot />}
      </div>
    </div>
  );
};

CoursesPanel.propTypes = {
  activeCategory: PropTypes.string,
};

export default CoursesPanel;
