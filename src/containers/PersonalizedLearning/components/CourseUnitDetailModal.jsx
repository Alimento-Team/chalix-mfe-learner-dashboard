import React from 'react';
import PropTypes from 'prop-types';
import {
  StandardModal,
  ModalDialog,
  Button,
  Icon,
  Container,
  Row,
  Col,
  ProgressBar,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

const CourseUnitDetailModal = ({
  isOpen,
  onClose,
  courseUnit,
  onOpenMaterial,
}) => {
  if (!courseUnit) {
    return null;
  }

  // Sample timeline data - in real implementation, this would come from courseUnit
  const timelineData = [
    {
      label: 'BẮT ĐẦU HỌC TẬP',
      date: '21/10',
      status: 'completed',
      isFirst: true,
    },
    {
      label: 'KIỂM TRA GIỮA KỲ',
      date: '05/11',
      status: 'completed',
    },
    {
      label: 'KIỂM TRA CUỐI KỲ',
      date: '24/11',
      status: 'current',
    },
    {
      label: 'KẾT THÚC KHÓA HỌC',
      date: '28/11',
      status: 'upcoming',
      isLast: true,
    },
  ];

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      hasCloseButton={false}
    >
      <ModalDialog>
        <div className="course-unit-detail-modal">
          {/* Header */}
          <div className="modal-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
            <h4 className="mb-0 text-white">THÔNG TIN CHI TIẾT KHÓA HỌC</h4>
            <Button
              variant="inverse-primary"
              size="sm"
              onClick={onClose}
              className="text-white"
            >
              <Icon src={Close} />
            </Button>
          </div>

          {/* Content */}
          <div className="modal-content p-4">
            <Container fluid>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="course-info">
                    <div className="mb-3">
                      <strong>Khóa học:</strong> {courseUnit?.title || 'Lập trình Nodejs từ zero tới master dành cho người mới bắt đầu'}
                    </div>
                    <div className="mb-3">
                      <strong>Ngày bắt đầu:</strong> {courseUnit?.startDate || '20/10/2025'}
                    </div>
                    <div className="mb-3">
                      <strong>Kết quả kiểm tra:</strong> {courseUnit?.testScore || '68/100'}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="course-stats">
                    <div className="mb-3">
                      <strong>Số lượng tương tác:</strong> {courseUnit?.interactions || '20'}
                    </div>
                    <div className="mb-3">
                      <strong>Đánh giá môn học:</strong>{' '}
                      <span className={`badge ${courseUnit?.evaluation === 'ĐẠT' ? 'bg-success' : 'bg-warning'}`}>
                        {courseUnit?.evaluation || 'ĐẠT'}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Timeline Section */}
              <Row className="mb-4">
                <Col xs={12}>
                  <div className="timeline-section">
                    <h6 className="mb-3">Biểu đồ thời gian học tập</h6>
                    
                    {/* Timeline Container */}
                    <div className="timeline-container position-relative">
                      {/* Timeline Line */}
                      <div
                        className="timeline-line position-absolute"
                        style={{
                          top: '50%',
                          left: '0',
                          right: '0',
                          height: '3px',
                          background: 'linear-gradient(to right, #28a745 0%, #28a745 50%, #6c757d 50%, #6c757d 100%)',
                          zIndex: 1,
                        }}
                      />

                      {/* Timeline Items */}
                      <div
                        className="d-flex justify-content-between position-relative"
                        style={{ zIndex: 2 }}
                      >
                        {timelineData.map((item, index) => (
                          <div key={`${item.label}-${index}`} className="timeline-item text-center">
                            {/* Circle */}
                            <div
                              className={`timeline-circle mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center ${
                                item.status === 'completed' ? 'bg-success' :
                                item.status === 'current' ? 'bg-primary' :
                                'bg-secondary'
                              }`}
                              style={{
                                width: '16px',
                                height: '16px',
                                border: '3px solid white',
                                boxShadow: '0 0 0 2px #dee2e6',
                              }}
                            />
                            {/* Label */}
                            <div className="timeline-label">
                              <small className="text-primary fw-bold d-block mb-1">
                                {item.label}
                              </small>
                              <small className="text-muted">
                                {item.date}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Progress Bar */}
              <Row>
                <Col xs={12}>
                  <div className="course-progress">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Tiến độ học tập</span>
                      <span className="text-primary fw-bold">68%</span>
                    </div>
                    <ProgressBar
                      now={courseUnit?.progress || 68}
                      variant="success"
                      style={{ height: '8px' }}
                    />
                  </div>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col xs={12} className="text-end">
                  <Button
                    variant="primary"
                    onClick={() => onOpenMaterial && onOpenMaterial(courseUnit)}
                  >
                    Mở học liệu
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </ModalDialog>
    </StandardModal>
  );
};

CourseUnitDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpenMaterial: PropTypes.func,
  courseUnit: PropTypes.shape({
    title: PropTypes.string,
    startDate: PropTypes.string,
    testScore: PropTypes.string,
    interactions: PropTypes.string,
    evaluation: PropTypes.string,
    progress: PropTypes.number,
  }),
};

CourseUnitDetailModal.defaultProps = {
  onOpenMaterial: null,
};

export default CourseUnitDetailModal;
