import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Row,
  Col,
  ProgressBar,
  Alert,
  Spinner,
} from '@openedx/paragon';
import {
  TrendingUp,
  Psychology,
  Insights,
} from '@openedx/paragon/icons';
import { useStudentLearningProcess } from '../../../data/hooks/useStudentLearningProcess';

const EmotionRecognition = ({ data, courseId }) => {
  const [emotionData, setEmotionData] = useState(null);

  useEffect(() => {
    // Extract emotion data from the learning analytics data
    setEmotionData(data?.emotion_analysis || null);
  }, [data]);

  const hasEmotionData = Boolean(emotionData);
  const { snapshot: processSnapshot, loading: snapshotLoading } = useStudentLearningProcess(courseId);
  const vleBreakdown = data?.vle_breakdown || {};
  const totalVle = Number(vleBreakdown.total_vle || 0);
  const materialsOpened = Number(vleBreakdown.materials_opened || 0);
  const videosOpened = Number(vleBreakdown.videos_opened || 0);
  const quizzesOpened = Number(vleBreakdown.quizzes_opened || 0);

  const normalizedEmotionData = emotionData || {};
  const dominantEmotion = normalizedEmotionData.dominantEmotion
    || normalizedEmotionData.dominant_emotion
    || 'neutral';
  const emotionDistribution = normalizedEmotionData.emotionDistribution
    || normalizedEmotionData.emotion_distribution
    || {};
  const learningMoodTrends = normalizedEmotionData.learningMoodTrends
    || normalizedEmotionData.learning_mood_trends
    || [];
  const recommendations = normalizedEmotionData.recommendations || [];
  const stressLevels = normalizedEmotionData.stressLevels
    || normalizedEmotionData.stress_levels
    || {};
  const engagementScore = Number(
    normalizedEmotionData.engagementScore
    || normalizedEmotionData.engagement_score
    || 0,
  );

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'focused': return '🤔';
      case 'confused': return '😕';
      case 'frustrated': return '😤';
      case 'bored': return '😴';
      default: return '😐';
    }
  };

  const getEmotionLabel = (emotion) => {
    const labels = {
      happy: 'Vui vẻ',
      excited: 'Hứng thú',
      focused: 'Tập trung',
      confused: 'Bối rối',
      frustrated: 'Thất vọng',
      bored: 'Chán nản',
      neutral: 'Bình thường'
    };
    return labels[emotion] || emotion;
  };

  const getStressLevel = (level) => {
    if (level < 30) {
      return { label: 'Thấp', variant: 'success' };
    }
    if (level < 70) {
      return { label: 'Trung bình', variant: 'warning' };
    }
    return { label: 'Cao', variant: 'danger' };
  };

  return (
    <div className="emotion-recognition">
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Chi tiết tương tác VLE theo loại học liệu</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={3} sm={6} xs={12}>
                  <div className="text-center border rounded p-3 h-100 bg-light">
                    <div className="text-muted small">Tổng VLE</div>
                    <div className="h3 mb-0 text-primary">{totalVle}</div>
                  </div>
                </Col>
                <Col md={3} sm={6} xs={12}>
                  <div className="text-center border rounded p-3 h-100">
                    <div className="text-muted small">Mở slides/tài liệu</div>
                    <div className="h4 mb-0">{materialsOpened}</div>
                  </div>
                </Col>
                <Col md={3} sm={6} xs={12}>
                  <div className="text-center border rounded p-3 h-100">
                    <div className="text-muted small">Mở video</div>
                    <div className="h4 mb-0">{videosOpened}</div>
                  </div>
                </Col>
                <Col md={3} sm={6} xs={12}>
                  <div className="text-center border rounded p-3 h-100">
                    <div className="text-muted small">Mở quiz</div>
                    <div className="h4 mb-0">{quizzesOpened}</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Đánh giá cảm xúc sub-section */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Đánh giá cảm xúc</h6>
            </Card.Header>
            <Card.Body>
              {snapshotLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" role="status" />
                  <span className="ms-2 text-muted small">Đang tải...</span>
                </div>
              ) : (processSnapshot?.eye_score != null
                    || processSnapshot?.nose_score != null
                    || processSnapshot?.mouth_score != null
                    || processSnapshot?.emotion_score != null) ? (
                <Row className="g-3">
                  <Col md={3} sm={6} xs={12}>
                    <div className="text-center border rounded p-3 h-100">
                      <div className="text-muted small">Mắt (Eye)</div>
                      <div className="h4 mb-0 text-info">
                        {processSnapshot?.eye_score != null ? Number(processSnapshot.eye_score).toFixed(2) : '--'}
                      </div>
                    </div>
                  </Col>
                  <Col md={3} sm={6} xs={12}>
                    <div className="text-center border rounded p-3 h-100">
                      <div className="text-muted small">Mũi (Nose)</div>
                      <div className="h4 mb-0 text-info">
                        {processSnapshot?.nose_score != null ? Number(processSnapshot.nose_score).toFixed(2) : '--'}
                      </div>
                    </div>
                  </Col>
                  <Col md={3} sm={6} xs={12}>
                    <div className="text-center border rounded p-3 h-100">
                      <div className="text-muted small">Miệng (Mouth)</div>
                      <div className="h4 mb-0 text-info">
                        {processSnapshot?.mouth_score != null ? Number(processSnapshot.mouth_score).toFixed(2) : '--'}
                      </div>
                    </div>
                  </Col>
                  <Col md={3} sm={6} xs={12}>
                    <div className="text-center border rounded p-3 h-100 bg-light">
                      <div className="text-muted small">Tổng cảm xúc</div>
                      <div className="h3 mb-0 text-primary">
                        {processSnapshot?.emotion_score != null ? Number(processSnapshot.emotion_score).toFixed(2) : '--'}
                      </div>
                    </div>
                  </Col>
                </Row>
              ) : (
                <p className="text-muted text-center mb-0 small">
                  Chưa có dữ liệu đánh giá cảm xúc. Dữ liệu sẽ xuất hiện sau khi mô hình dự đoán cảm xúc chạy.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {!hasEmotionData && (
        <div className="text-center py-4">
          <Alert variant="info">
            <p className="mb-0">
              Dữ liệu nhận diện cảm xúc sẽ được thu thập trong quá trình học tập.
              Hãy tiếp tục học để xem phân tích cảm xúc của bạn.
            </p>
          </Alert>
        </div>
      )}

      {hasEmotionData && (
        <>
      {/* Current Emotional State */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <div className="display-4 mb-2">
                  {getEmotionIcon(dominantEmotion)}
                </div>
                <h5 className="text-primary">
                  Trạng thái hiện tại: {getEmotionLabel(dominantEmotion)}
                </h5>
              </div>
              <p className="text-muted">
                Trạng thái cảm xúc chủ đạo trong quá trình học tập gần đây
              </p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <Insights className="me-2 text-info" size="24" />
                <h6 className="mb-0">Mức độ tương tác</h6>
              </div>
              <div className="text-center">
                <h3 className="text-info mb-2">{engagementScore}/100</h3>
                <ProgressBar
                  now={engagementScore}
                  variant={
                    engagementScore >= 80 ? 'success' :
                    engagementScore >= 60 ? 'info' :
                    'warning'
                  }
                />
                <small className="text-muted mt-1 d-block">
                  {
                    engagementScore >= 80 ? 'Rất tích cực' :
                    engagementScore >= 60 ? 'Tích cực' :
                    engagementScore >= 40 ? 'Bình thường' :
                    'Cần cải thiện'
                  }
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Emotion Distribution */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Phân bố cảm xúc trong học tập</h6>
            </Card.Header>
            <Card.Body>
              {Object.entries(emotionDistribution).length > 0 ? (
                <div>
                  {Object.entries(emotionDistribution).map(([emotion, percentage]) => (
                    <div key={emotion} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="d-flex align-items-center">
                          <span className="me-2">{getEmotionIcon(emotion)}</span>
                          {getEmotionLabel(emotion)}
                        </span>
                        <span className="fw-medium">{Math.round(percentage)}%</span>
                      </div>
                      <ProgressBar
                        now={percentage}
                        style={{
                          height: '8px',
                          backgroundColor: '#f8f9fa',
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">
                  Dữ liệu cảm xúc đang được thu thập...
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Stress Levels */}
        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Mức độ căng thẳng</h6>
            </Card.Header>
            <Card.Body>
              {Object.entries(stressLevels).length > 0 ? (
                <div>
                  {Object.entries(stressLevels).map(([timeframe, level]) => {
                    const stressInfo = getStressLevel(level);
                    return (
                      <div key={timeframe} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">
                            {timeframe === 'daily' ? 'Hôm nay' :
                             timeframe === 'weekly' ? 'Tuần này' :
                             'Tháng này'}
                          </small>
                          <small className={`text-${stressInfo.variant}`}>
                            {stressInfo.label}
                          </small>
                        </div>
                        <ProgressBar
                          now={level}
                          variant={stressInfo.variant}
                          style={{ height: '6px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted small">Chưa có dữ liệu</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Learning Mood Trends */}
      {learningMoodTrends.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Xu hướng tâm trạng học tập</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  {learningMoodTrends.slice(-7).map((trend, index) => {
                    const trendDate = trend?.date;
                    const trendEmotion = trend?.dominantEmotion || trend?.dominant_emotion || 'neutral';

                    return (
                    <div key={`${trendDate || index}-${index}`} className="text-center">
                      <div className="mb-1" style={{ fontSize: '24px' }}>
                        {getEmotionIcon(trendEmotion)}
                      </div>
                      <small className="text-muted">
                        {trendDate ? new Date(trendDate).toLocaleDateString('vi-VN', {
                          weekday: 'short',
                        }) : '--'}
                      </small>
                    </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Row>
          <Col md={12}>
            <Card>
              <Card.Header>
                <div className="d-flex align-items-center">
                  <Psychology className="me-2 text-warning" size="20" />
                  <h6 className="mb-0">Gợi ý cải thiện trạng thái học tập</h6>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  {recommendations.map((recommendation, index) => (
                    <div key={`${recommendation.title}-${index}`} className="col-md-6 mb-3">
                      <div className="d-flex">
                        <div className="me-3">
                          <div
                            className="rounded-circle bg-light p-2"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <TrendingUp size="20" className="text-success" />
                          </div>
                        </div>
                        <div>
                          <h6 className="mb-1">{recommendation.title}</h6>
                          <p className="small text-muted mb-0">
                            {recommendation.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
        </>
      )}
    </div>
  );
};

EmotionRecognition.defaultProps = {
  courseId: null,
};

EmotionRecognition.propTypes = {
  courseId: PropTypes.string,
  data: PropTypes.shape({
    vle_breakdown: PropTypes.shape({
      total_vle: PropTypes.number,
      materials_opened: PropTypes.number,
      videos_opened: PropTypes.number,
      quizzes_opened: PropTypes.number,
    }),
    emotion_analysis: PropTypes.shape({
      dominant_emotion: PropTypes.string,
      emotion_distribution: PropTypes.objectOf(PropTypes.number),
      learning_mood_trends: PropTypes.arrayOf(PropTypes.shape({
        dominant_emotion: PropTypes.string,
        date: PropTypes.string,
      })),
      recommendations: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
      })),
      stress_levels: PropTypes.objectOf(PropTypes.number),
      engagement_score: PropTypes.number,
    }),
  }),
};

export default EmotionRecognition;
