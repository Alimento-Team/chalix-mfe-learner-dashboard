import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  personalizedLearningTitle: {
    id: 'personalized.learning.title',
    defaultMessage: 'Học tập cá nhân hóa',
    description: 'Title for personalized learning page',
  },
  overviewTab: {
    id: 'personalized.learning.tab.overview',
    defaultMessage: 'Tổng Quan',
    description: 'Overview tab title',
  },
  courseDetailsTab: {
    id: 'personalized.learning.tab.courseDetails',
    defaultMessage: 'Chi Tiết Khóa Học',
    description: 'Course details tab title',
  },
  courseUnitsList: {
    id: 'personalized.learning.courseUnits.list',
    defaultMessage: 'Danh sách lớp học',
    description: 'Course units list title',
  },
  searchCourses: {
    id: 'personalized.learning.courseUnits.search',
    defaultMessage: 'Tìm kiếm khóa học',
    description: 'Search courses placeholder',
  },
  viewDetails: {
    id: 'personalized.learning.courseUnits.viewDetails',
    defaultMessage: 'Xem chi tiết',
    description: 'View details button text',
  },
  courseStatus: {
    id: 'personalized.learning.courseUnits.status',
    defaultMessage: 'Trạng thái',
    description: 'Course status label',
  },
  startDate: {
    id: 'personalized.learning.courseUnits.startDate',
    defaultMessage: 'Ngày bắt đầu',
    description: 'Start date label',
  },
  enrollmentCount: {
    id: 'personalized.learning.courseUnits.enrollmentCount',
    defaultMessage: 'Số học viên',
    description: 'Enrollment count label',
  },
  completionRate: {
    id: 'personalized.learning.courseUnits.completionRate',
    defaultMessage: 'Tỷ lệ hoàn thành',
    description: 'Completion rate label',
  },
  errorTitle: {
    id: 'personalized.learning.error.title',
    defaultMessage: 'Lỗi',
    description: 'Error title',
  },
  errorMessage: {
    id: 'personalized.learning.error.message',
    defaultMessage: 'Không thể tải dữ liệu học tập. Vui lòng thử lại sau.',
    description: 'Error message',
  },
  snapshotTitle: {
    id: 'personalized.learning.snapshot.title',
    defaultMessage: 'Quá trình học tập',
    description: 'Title for learner process snapshot card',
  },
  loading: {
    id: 'personalized.learning.snapshot.loading',
    defaultMessage: 'Đang tải...',
    description: 'Loading text for learner process snapshot',
  },
  noDataMessage: {
    id: 'personalized.learning.snapshot.noData',
    defaultMessage: 'Dữ liệu quá trình học tập của bạn chưa có sẵn',
    description: 'No data text for learner process snapshot',
  },
  finalScoreActualLabel: {
    id: 'personalized.learning.snapshot.finalScoreActualLabel',
    defaultMessage: 'Điểm thực tế',
    description: 'Label shown when the displayed final score is actual',
  },
  finalScorePredictedLabel: {
    id: 'personalized.learning.snapshot.finalScorePredictedLabel',
    defaultMessage: 'Điểm dự đoán',
    description: 'Label shown when the displayed final score is predicted',
  },
});

export default messages;
