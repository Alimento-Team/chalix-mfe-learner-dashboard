import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import { reduxHooks } from 'hooks';
import track from 'tracking';
import CourseCardBanners from '../CourseCardBanners';
import CourseCardImage from '../CourseCardImage';
import CourseCardMenu from '../CourseCardMenu';
import CourseCardActions from '../CourseCardActions';
import CourseCardDetails from '../CourseCardDetails';
import CourseCardTitle from '../CourseCardTitle';
import './index.scss';

export const ChalixCourseCard = ({ cardId }) => {
  const { courseRun, homeUrl, resumeUrl } = reduxHooks.useCardCourseRunData(cardId);
  const { enrollmentData, hasStarted } = reduxHooks.useCardEnrollmentData(cardId);
  const { courseNumber } = reduxHooks.useCardCourseData(cardId);
  const execEdTrackingParam = reduxHooks.useCardExecEdTrackingParam(cardId);
  
  // Compute progress data from redux-provided selectors when available.
  // Prefer an explicit progress percentage (if provided by backend),
  // otherwise fall back to grade-based or course completion heuristics.
  const cardProgress = reduxHooks.useCardGradeData(cardId) || {};
  // Some backend payloads/other modules (e.g., personalized learning) use progress_percentage.
  // Try to read from courseRun or enrollment objects where available.
  const { progress_percentage: runProgress } = reduxHooks.useCardCourseData(cardId) || {};
  const { progress_percentage: enrollmentProgress } = reduxHooks.useCardEnrollmentData(cardId) || {};

  let percentage = null;
  if (typeof runProgress === 'number') {
    percentage = Math.round(runProgress);
  } else if (typeof enrollmentProgress === 'number') {
    percentage = Math.round(enrollmentProgress);
  } else if (typeof cardProgress?.progressPercentage === 'number') {
    percentage = Math.round(cardProgress.progressPercentage);
  } else if (typeof cardProgress?.isPassing === 'boolean') {
    // If only grade/pass info exists, show 100 for passing, 0 for not passing, else null.
    percentage = cardProgress.isPassing ? 100 : 0;
  }

  const progressData = {
    percentage: percentage != null ? Math.min(Math.max(percentage, 0), 100) : 0,
    // completed/totalUnits not currently provided in this MFE's course-card selectors;
    // keep them undefined so UI can hide or ignore if not needed.
    completedUnits: undefined,
    totalUnits: undefined,
  };

  // Check if user is instructor (simplified - in real implementation, this would come from API)
  const isInstructor = enrollmentData?.mode === 'instructor' || enrollmentData?.role === 'instructor';

  // Determine the course URL based on enrollment status
  const courseUrl = hasStarted ? (resumeUrl + execEdTrackingParam) : (homeUrl + execEdTrackingParam);

  // Handle click on the entire card
  const handleCardClick = reduxHooks.useTrackCourseEvent(
    track.course.enterCourseClicked,
    cardId,
    courseUrl,
  );

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  return (
    <div 
      className="chalix-course-card" 
      data-testid="ChalixCourseCard"
      onClick={(e) => {
        // Don't trigger if clicking on a button or link
        if (e.target.closest('button') || e.target.closest('a[href]')) {
          return;
        }
        handleCardClick(e);
      }}
      onKeyDown={handleCardKeyDown}
      tabIndex="0"
      role="button"
      aria-label={`Open course: ${courseRun?.name || 'Course'}`}
      style={{ cursor: 'pointer' }}
    >
      <Card className="chalix-course-container">
        <div className="chalix-course-image-container">
          <CourseCardImage cardId={cardId} orientation="vertical" className="chalix-course-image" />
          {isInstructor && (
            <div className="chalix-instructor-tag">
              <span className="chalix-instructor-label">Giảng dạy</span>
            </div>
          )}
        </div>
        
        <Card.Body className="chalix-course-content">
          <div className="chalix-course-header">
            <div className="chalix-course-title">
              <CourseCardTitle cardId={cardId} />
            </div>
          </div>
          
          <div className="chalix-course-body">
            <div className="chalix-progress-section">
            <div className="chalix-progress-header">
              <div className="chalix-progress-percentage">
                {progressData.percentage}% hoàn thành
              </div>
              {progressData.completedUnits && progressData.totalUnits && (
                <div className="chalix-unit-count">
                  {progressData.completedUnits}/{progressData.totalUnits} bài học
                </div>
              )}
            </div>
            <div className="chalix-progress-bar-container">
              <div className="chalix-progress-bar-track">
                <div 
                  className="chalix-progress-bar-fill"
                  style={{ width: `${progressData.percentage}%` }}
                  aria-label={`Tiến độ: ${progressData.percentage}%`}
                />
              </div>
            </div>
            
            <Card.Footer className="chalix-course-actions">
              <CourseCardActions cardId={cardId} />
            </Card.Footer>
          </div>
        </div>
        </Card.Body>
        
        <CourseCardBanners cardId={cardId} />
      </Card>
    </div>
  );
};

ChalixCourseCard.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default ChalixCourseCard;
