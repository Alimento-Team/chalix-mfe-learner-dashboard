import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Pagination,
  Badge,
  Alert,
  Spinner,
} from '@openedx/paragon';
import { Search, Visibility, ArrowLeft } from '@openedx/paragon/icons';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import CourseUnitDetailModal from './CourseUnitDetailModal';
import { useFacialExpressionRecording } from '../../../data/hooks/useFacialExpressionRecording';
import { trackMaterialOpened } from '../../../data/services/lms/studentProcessApi';

const CourseUnits = ({ courseId, onEmotionRecorded }) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isRecording,
    recordingError,
    startTenSecondRecording,
  } = useFacialExpressionRecording();
  const itemsPerPage = 4;

  const fetchCourseUnits = useCallback(async () => {
    try {
      setLoading(true);
      const client = getAuthenticatedHttpClient();

      // API call to get course units/sections
      const response = await client.get(
        `${getConfig().LMS_BASE_URL}/api/courses/v2/course_units/`,
        {
          params: {
            course_id: courseId,
            page: currentPage,
            page_size: itemsPerPage,
            search: searchTerm,
          },
        },
      );

      if (response.data) {
        setUnits(response.data.results || []);
        setTotalPages(Math.ceil((response.data.count || 0) / itemsPerPage));
      }
    } catch (err) {
      setError('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [courseId, currentPage, searchTerm, itemsPerPage]);

  useEffect(() => {
    if (courseId) {
      fetchCourseUnits();
    }
  }, [courseId, currentPage, fetchCourseUnits]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourseUnits();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'upcoming':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleViewDetails = (unit) => {
    // Open modal with unit details
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleMaterialOpen = async (unit) => {
    const unitId = unit?.unit_id || unit?.id;
    if (!courseId || !unitId) {
      return;
    }

    try {
      await trackMaterialOpened({
        course_id: courseId,
        module_type: unit?.module_type || 'html',
      });
    } catch (err) {
      // Non-blocking: learner should still open material even if tracking fails.
      // eslint-disable-next-line no-console
      console.warn('Failed to track material-open event', err);
    }

    const uploadResult = await startTenSecondRecording({
      courseId,
      unitId: String(unitId),
      topicId: unit?.topic_id,
    });

    if (uploadResult && onEmotionRecorded) {
      onEmotionRecorded(uploadResult);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUnit(null);
  };

  const handleBackToCourses = () => {
    // Remove course_id parameter and reload
    const url = new URL(window.location);
    url.searchParams.delete('course_id');
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="course-units-loading text-center py-5">
        <Spinner animation="border" variant="primary" />
        <div className="mt-3">Đang tải danh sách lớp học...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchCourseUnits}>
          Thử lại
        </Button>
      </Alert>
    );
  }

  return (
    <div className="course-units-container">
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center">
                    <Button
                      variant="link"
                      className="p-0 me-3"
                      onClick={handleBackToCourses}
                      style={{ textDecoration: 'none' }}
                    >
                      <ArrowLeft size="20" className="me-1" />
                      Quay lại
                    </Button>
                    <h3 className="mb-0 fw-bold text-dark">
                      DANH SÁCH LỚP HỌC
                    </h3>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="search-container" style={{ width: '385px' }}>
                    <Form onSubmit={handleSearch} className="d-flex">
                      <Form.Control
                        type="search"
                        placeholder="Tìm kiếm khóa học"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-pill"
                        style={{
                          border: '2px solid #b2b2b2',
                          paddingRight: '50px',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '16px',
                          letterSpacing: '0.5px',
                        }}
                      />
                      <Button
                        type="submit"
                        variant="link"
                        className="position-absolute"
                        style={{
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 10,
                          border: 'none',
                          background: 'transparent',
                        }}
                      >
                        <Search size="20" />
                      </Button>
                    </Form>
                  </div>
                </div>

                {/* Course Units List */}
                {isRecording && (
                  <Alert variant="info" className="mb-3">
                    Đang ghi hình 10 giây để phân tích cảm xúc cho tài liệu học tập...
                  </Alert>
                )}

                {recordingError && (
                  <Alert variant="warning" className="mb-3">
                    Không thể ghi hình từ camera. Bạn vẫn có thể tiếp tục học bình thường.
                  </Alert>
                )}

                <div className="course-units-list">
                  {units.length > 0 ? (
                    units.map((unit) => (
                      <Card 
                        key={unit.id} 
                        className="mb-3 course-unit-item"
                        style={{
                          backgroundColor: 'rgba(178,178,178,0.3)',
                          border: '1px solid #9b9595',
                          borderRadius: '5px',
                          minHeight: '111px',
                        }}
                      >
                        <Card.Body className="py-3">
                          <Row className="align-items-center">
                            <Col lg={8}>
                              <div>
                                <h5 className="mb-2 fw-medium text-dark">
                                  {unit.title}
                                </h5>
                                
                                <div className="mb-2">
                                  <span className="text-dark fw-medium">Trạng thái: </span>
                                  <Badge 
                                    variant={getStatusVariant(unit.status)}
                                    className="ms-1"
                                  >
                                    {unit.status_display}
                                  </Badge>
                                </div>
                                
                                <div className="text-muted">
                                  <small>
                                    Ngày bắt đầu: {formatDate(unit.start_date)}
                                  </small>
                                </div>
                                
                                {unit.enrollment_count > 0 && (
                                  <div className="text-muted">
                                    <small>
                                      Số học viên: {unit.enrollment_count} |
                                      Tỷ lệ hoàn thành: {unit.completion_rate}%
                                    </small>
                                  </div>
                                )}
                              </div>
                            </Col>
                            
                            <Col lg={4} className="text-end">
                              <Button
                                variant="primary"
                                onClick={() => handleViewDetails(unit)}
                                className="d-flex align-items-center justify-content-center ms-auto"
                                style={{
                                  backgroundColor: '#00aaed',
                                  borderColor: '#00aaed',
                                  borderRadius: '8px',
                                  padding: '12px 16px',
                                  fontSize: '16px',
                                }}
                              >
                                Xem chi tiết
                                <Visibility size="16" className="ms-2" />
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">Không có lớp học nào được tìm thấy.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Previous
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        
                        if (
                          page === 1
                          || page === totalPages
                          || (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === currentPage}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        }
                        if (
                          page === currentPage - 2
                          || page === currentPage + 2
                        ) {
                          return <Pagination.Ellipsis key={page} />;
                        }
                        return null;
                      })}
                      
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    </Pagination>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Course Unit Detail Modal */}
      <CourseUnitDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        courseUnit={selectedUnit}
        onOpenMaterial={handleMaterialOpen}
      />
    </div>
  );
};

CourseUnits.propTypes = {
  courseId: PropTypes.string.isRequired,
  onEmotionRecorded: PropTypes.func,
};

CourseUnits.defaultProps = {
  onEmotionRecorded: null,
};

export default CourseUnits;
