import React, { useState } from 'react';
import { Nav } from '@openedx/paragon';

import { reduxHooks } from 'hooks';
import { RequestKeys } from 'data/constants/requests';
import SelectSessionModal from 'containers/SelectSessionModal';
import CoursesPanel from 'containers/CoursesPanel';
import PersonalizedLearning from 'containers/PersonalizedLearning';
import LearningHoursProgressBar from 'components/LearningHoursProgressBar';
import { useLearningHours } from 'data/hooks/useLearningHours';
import DashboardModalSlot from 'plugin-slots/DashboardModalSlot';

import LoadingView from './LoadingView';
import DashboardLayout from './DashboardLayout';
import DashboardHeader from './DashboardHeader';
import DashboardBreadcrumb from './DashboardBreadcrumb';
import hooks from './hooks';
import './index.scss';

// Map Vietnamese tab names to backend filter types
const TAB_FILTER_MAP = {
  'ai-suggested': null,        // AI suggested courses - no backend filter (separate logic)
  'internal': 'organization',  // Khóa học nội bộ cơ quan
  'elective': 'ministry',      // Khóa học của CC,VC Bộ
  'required': 'mandatory',     // Khóa học bắt buộc
  'teaching': 'teaching',      // Giảng dạy
  'personalized': null,        // Personalized learning - no filter
};

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('ai-suggested');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  
  // Get filter type for current tab
  const filterType = TAB_FILTER_MAP[activeTab];
  
  // Initialize dashboard with filter
  hooks.useInitializeDashboard(filterType);
  
  const { pageTitle } = hooks.useDashboardMessages();
  const hasCourses = reduxHooks.useHasCourses();
  const initIsPending = reduxHooks.useRequestIsPending(RequestKeys.initialize);
  const showSelectSessionModal = reduxHooks.useShowSelectSessionModal();
  
  // Use learning hours hook
  const { 
    learningHours, 
    loading: hoursLoading 
  } = useLearningHours();

  // Check URL parameters for course ID and tab
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');
    const tab = urlParams.get('tab');
    
    console.log('[Dashboard] URL params:', { courseId, tab });
    
    if (courseId) {
      console.log('[Dashboard] Setting course ID and personalized tab');
      setSelectedCourseId(courseId);
      setActiveTab('personalized');
    } else if (tab) {
      // Handle tab parameter without course_id
      console.log('[Dashboard] Setting active tab to:', tab);
      setActiveTab(tab);
    }
  }, []);
  
  // Log filter type when tab changes
  React.useEffect(() => {
    console.log('[Dashboard] Active tab changed:', activeTab);
    console.log('[Dashboard] Using filter type:', filterType);
  }, [activeTab, filterType]);

  const renderTabContent = () => {
    console.log('[Dashboard] Rendering tab content for:', activeTab);
    switch (activeTab) {
      case 'personalized':
        console.log('[Dashboard] Rendering PersonalizedLearning component');
        return <PersonalizedLearning courseId={selectedCourseId} />;
      case 'ai-suggested':
      case 'internal':
      case 'elective':
      case 'required':
      case 'teaching':
      default:
        console.log('[Dashboard] Rendering CoursesPanel');
        return (
          <DashboardLayout>
            <CoursesPanel activeCategory={activeTab} />
          </DashboardLayout>
        );
    }
  };

  return (
    <div id="dashboard-container" className="dashboard-main-container">
      <h1 className="sr-only">{pageTitle}</h1>
      
      {/* Header */}
      <DashboardHeader />
      
      {/* Breadcrumb Navigation */}
      <DashboardBreadcrumb />
      


      <div className="dashboard-body">
        {!initIsPending && (
          <>
            <DashboardModalSlot />
            {(hasCourses && showSelectSessionModal) && <SelectSessionModal />}
          </>
        )}
        
        {/* Course Category Tabs */}
        {!initIsPending && activeTab !== 'personalized' && (
          <div className="course-category-navigation">
            <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="course-tabs">
              <Nav.Item>
                <Nav.Link eventKey="ai-suggested" className={activeTab === 'ai-suggested' ? 'active-tab' : ''}>
                  Khóa học do AI gợi ý
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="internal" className={activeTab === 'internal' ? 'active-tab' : ''}>
                  Khóa học nội bộ cơ quan
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="elective" className={activeTab === 'elective' ? 'active-tab' : ''}>
                  Khóa học của CC,VC Bộ
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="required" className={activeTab === 'required' ? 'active-tab' : ''}>
                  Khóa học bắt buộc
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="teaching" className={activeTab === 'teaching' ? 'active-tab' : ''}>
                  Giảng dạy
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        )}
        
        {/* Learning Hours Progress - Moved inside dashboard-body */}
        {!initIsPending && activeTab !== 'personalized' && learningHours && !hoursLoading && (
          <div className="in-body-progress-container">
            <div className="progress-content">
              <div className="progress-stats">
                <span className="progress-label">Số giờ đã học: {learningHours.completed_hours || 0}</span>
                <span className="progress-total">Tổng số giờ phải hoàn thành: {learningHours.required_hours || 40}h</span>
              </div>
              <div className="progress-bar-wrapper">
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${learningHours.completion_percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div id="dashboard-content" className="dashboard-content" data-testid="dashboard-content">
          {initIsPending
            ? (<LoadingView />)
            : renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
