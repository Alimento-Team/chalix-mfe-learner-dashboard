import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card,
  Badge,
  Row,
  Col,
  Container,
  Spinner,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { useStudentLearningProcess } from '../../../data/hooks/useStudentLearningProcess';
import messages from '../messages';
import './LearningProcessSnapshot.scss';

/**
 * Component to display a student's learning process snapshot
 * Shows weekly scores, VLE engagement, and final score with categorical information
 */
const LearningProcessSnapshot = () => {
  const { formatMessage } = useIntl();
  const { snapshot, loading, error } = useStudentLearningProcess();

  /**
   * Get score badge color based on score value
   * @param {number} score - Score value (0-10)
   * @returns {string} Badge variant
   */
  const getScoreBadgeVariant = (score) => {
    if (score === null || score === undefined) return 'secondary';
    if (score >= 7) return 'success';
    if (score >= 5) return 'warning';
    return 'danger';
  };

  /**
   * Get categorical badge color based on field type
   * @param {string} fieldType - Type of categorical field
   * @returns {string} Badge variant
   */
  const getCategoricalBadgeVariant = (fieldType) => {
    const variants = {
      position: 'primary',
      gender: 'info',
      location: 'secondary',
      job_title: 'light',
      experience: 'dark',
    };
    return variants[fieldType] || 'light';
  };

  if (loading) {
    return (
      <Card className="learning-process-snapshot-card mb-4">
        <Card.Header className="border-0 bg-light">
          <Card.Header.Title>
            {formatMessage(messages.snapshotTitle) || 'Quá trình học tập'}
          </Card.Header.Title>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="sr-only">
              {formatMessage(messages.loading) || 'Đang tải...'}
            </span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  if (error && error.response?.status !== 404) {
    return (
      <Card className="learning-process-snapshot-card mb-4 border-danger">
        <Card.Header className="border-0 bg-light">
          <Card.Header.Title>
            {formatMessage(messages.snapshotTitle) || 'Quá trình học tập'}
          </Card.Header.Title>
        </Card.Header>
        <Card.Body>
          <div className="alert alert-danger" role="alert">
            <p>
              {formatMessage(messages.errorMessage) || 'Không thể tải dữ liệu học tập'}
            </p>
            <small className="text-muted">
              {error?.message}
            </small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card className="learning-process-snapshot-card mb-4">
        <Card.Header className="border-0 bg-light">
          <Card.Header.Title>
            {formatMessage(messages.snapshotTitle) || 'Quá trình học tập'}
          </Card.Header.Title>
        </Card.Header>
        <Card.Body>
          <div className="alert alert-info" role="alert">
            <i className="fas fa-info-circle mr-2" />
            {formatMessage(messages.noDataMessage) || 'Dữ liệu quá trình học tập của bạn chưa có sẵn'}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="learning-process-snapshot-card mb-4">
      <Card.Header className="border-0 bg-light">
        <Card.Header.Title>
          {formatMessage(messages.snapshotTitle) || 'Quá trình học tập'}
        </Card.Header.Title>
      </Card.Header>

      <Card.Body>
        {/* Personal Information Section */}
        <div className="section-divider mb-4">
          <h6 className="section-title mb-3">
            <i className="fas fa-user-circle mr-2 text-primary" />
            Thông tin cá nhân
          </h6>
          <Row className="g-3">
            {snapshot.position_text && (
              <Col xs={12} sm={6} md={4}>
                <div className="info-item">
                  <span className="info-label">Vị trí:</span>
                  <Badge variant={getCategoricalBadgeVariant('position')}>
                    {snapshot.position_text}
                  </Badge>
                </div>
              </Col>
            )}
            {snapshot.gender_text && (
              <Col xs={12} sm={6} md={4}>
                <div className="info-item">
                  <span className="info-label">Giới tính:</span>
                  <Badge variant={getCategoricalBadgeVariant('gender')}>
                    {snapshot.gender_text}
                  </Badge>
                </div>
              </Col>
            )}
            {snapshot.location_text && (
              <Col xs={12} sm={6} md={4}>
                <div className="info-item">
                  <span className="info-label">Địa điểm:</span>
                  <Badge variant={getCategoricalBadgeVariant('location')}>
                    {snapshot.location_text}
                  </Badge>
                </div>
              </Col>
            )}
            {snapshot.job_title_text && (
              <Col xs={12} sm={6} md={6}>
                <div className="info-item">
                  <span className="info-label">Chức danh công việc:</span>
                  <Badge variant={getCategoricalBadgeVariant('job_title')}>
                    {snapshot.job_title_text}
                  </Badge>
                </div>
              </Col>
            )}
            {snapshot.experience_text && (
              <Col xs={12} sm={6} md={6}>
                <div className="info-item">
                  <span className="info-label">Kinh nghiệm:</span>
                  <Badge variant={getCategoricalBadgeVariant('experience')}>
                    {snapshot.experience_text}
                  </Badge>
                </div>
              </Col>
            )}
          </Row>
        </div>

        {/* Weekly Scores Section */}
        <div className="section-divider mb-4">
          <h6 className="section-title mb-3">
            <i className="fas fa-chart-bar mr-2 text-info" />
            Điểm bằng cấp hàng tuần
          </h6>
          <Row className="g-3">
            {[1, 2, 3].map((week) => {
              const scoreKey = `week_${week}`;
              const score = snapshot[scoreKey];
              return (
                <Col xs={12} sm={6} md={4} key={scoreKey}>
                  <div className="score-card text-center p-3 border rounded">
                    <div className="week-label text-muted mb-2">Tuần {week}</div>
                    <div className="score-value mb-2">
                      {score !== null && score !== undefined ? (
                        <Badge variant={getScoreBadgeVariant(score)} className="score-badge">
                          {score}/10
                        </Badge>
                      ) : (
                        <Badge variant="secondary">N/A</Badge>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* VLE Engagement Section */}
        <div className="section-divider mb-4">
          <h6 className="section-title mb-3">
            <i className="fas fa-laptop mr-2 text-success" />
            Tương tác học phí ảo (VLE)
          </h6>
          <Row className="g-3">
            {[1, 2, 3].map((vle) => {
              const vleKey = `vle_${vle}`;
              const interactions = snapshot[vleKey];
              return (
                <Col xs={12} sm={6} md={4} key={vleKey}>
                  <div className="vle-card text-center p-3 border rounded">
                    <div className="vle-label text-muted mb-2">Tuần {vle}</div>
                    <div className="vle-value mb-2">
                      {interactions !== null && interactions !== undefined ? (
                        <Badge variant="primary">
                          {interactions} lần tương tác
                        </Badge>
                      ) : (
                        <Badge variant="secondary">N/A</Badge>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Final Score Section */}
        <div className="section-divider">
          <h6 className="section-title mb-3">
            <i className="fas fa-trophy mr-2 text-warning" />
            Điểm cuối cùng
          </h6>
          <div className="final-score-container p-4 bg-light rounded text-center">
            {snapshot.final_score !== null && snapshot.final_score !== undefined ? (
              <>
                <div className="final-score-label text-muted mb-3">Điểm cuối cùng</div>
                <div className="final-score-display mb-3">
                  <Badge variant={getScoreBadgeVariant(snapshot.final_score)} className="final-score-badge">
                    {snapshot.final_score}/10
                  </Badge>
                </div>
                <div className="final-score-interpretation">
                  {snapshot.final_score >= 8 && (
                    <p className="text-success mb-0">
                      <i className="fas fa-check-circle mr-2" />
                      Xuất sắc!
                    </p>
                  )}
                  {snapshot.final_score >= 5 && snapshot.final_score < 8 && (
                    <p className="text-warning mb-0">
                      <i className="fas fa-star mr-2" />
                      Tốt
                    </p>
                  )}
                  {snapshot.final_score < 5 && (
                    <p className="text-danger mb-0">
                      <i className="fas fa-exclamation-circle mr-2" />
                      Cần cải thiện
                    </p>
                  )}
                </div>
              </>
            ) : (
              <Badge variant="secondary">Chưa có dữ liệu</Badge>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

LearningProcessSnapshot.propTypes = {};

export default LearningProcessSnapshot;
