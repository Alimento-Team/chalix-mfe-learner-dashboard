import React, { useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import {
  Container,
  Row,
  Col,
  Card,
  Tab,
  Tabs,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import LearningOverview from './components/LearningOverview';
import CourseDetails from './components/CourseDetails';
import CourseUnits from './components/CourseUnits';
import EmotionRecognition from './components/EmotionRecognition';
import CourseSidebar from './components/CourseSidebar';
import LearningHoursProgressBar from '../../components/LearningHoursProgressBar';
import { useLearningHours } from '../../data/hooks/useLearningHours';
import messages from './messages';
import './index.scss';

const PersonalizedLearning = ({ courseId = null }) => {
  const { formatMessage } = useIntl();
  const { authenticatedUser } = React.useContext(AppContext);
  const [learningData, setLearningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  // Use learning hours hook
  const {
    learningHours,
    loading: hoursLoading,
  } = useLearningHours();

  useEffect(() => {
    const fetchLearningAnalytics = async () => {
      try {
        console.log('[PersonalizedLearning] Fetching learning analytics...');
        const client = getAuthenticatedHttpClient();
        const baseUrl = getConfig().LMS_BASE_URL;
        // Fetch learning analytics data
        const response = await client.get(`${baseUrl}/api/learning_analytics/dashboard/`);
        console.log('[PersonalizedLearning] Data received:', response.data);
        setLearningData(response.data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[PersonalizedLearning] Failed to fetch learning analytics:', err);
        setError(err);
      } finally {
        console.log('[PersonalizedLearning] Loading complete');
        setLoading(false);
      }
    };

    console.log('[PersonalizedLearning] Component mounted, authenticated user:', authenticatedUser?.username);
    if (authenticatedUser) {
      fetchLearningAnalytics();
    } else {
      console.log('[PersonalizedLearning] No authenticated user');
      setLoading(false);
    }
  }, [authenticatedUser]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">{formatMessage(messages.errorTitle)}</h4>
          <p>{formatMessage(messages.errorMessage)}</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="personalized-learning-container">
      <Container fluid className="py-4">
        <Row className="g-4">
          {/* Main Content Area - Full Width */}
          <Col lg={8} md={12}>
            <div className="main-tabs-container">
              {/* Custom Tab Navigation */}
              <div className="custom-tabs-header">
                <button
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Tổng Quan
                </button>
                <button
                  className={`tab-button ${activeTab === 'courseDetails' ? 'active' : ''}`}
                  onClick={() => setActiveTab('courseDetails')}
                >
                  Chi Tiết Khóa Học
                </button>
                <button
                  className={`tab-button ${activeTab === 'emotionRecognition' ? 'active' : ''}`}
                  onClick={() => setActiveTab('emotionRecognition')}
                >
                  Nhận Diện Cảm Xúc
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content-container">
                {activeTab === 'overview' && (
                  <LearningOverview data={learningData} />
                )}
                {activeTab === 'courseDetails' && (
                  <CourseDetails data={learningData} />
                )}
                {activeTab === 'emotionRecognition' && (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      Tính năng nhận diện cảm xúc sẽ sớm được kích hoạt
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Right Sidebar - Course Lists */}
          <Col lg={4} md={12}>
            <CourseSidebar data={learningData} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

PersonalizedLearning.propTypes = {
  courseId: PropTypes.string,
};

PersonalizedLearning.defaultProps = {
  courseId: null,
};

export default PersonalizedLearning;
