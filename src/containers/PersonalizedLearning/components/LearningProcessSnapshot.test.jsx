import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import LearningProcessSnapshot from './LearningProcessSnapshot';
import * as useStudentLearningProcessModule from '../../../data/hooks/useStudentLearningProcess';
import * as useAccountProfileModule from '../../../data/hooks/useAccountProfile';
import messages from '../messages';

jest.mock('../../../data/hooks/useStudentLearningProcess');
jest.mock('../../../data/hooks/useAccountProfile');

const defaultMessages = {
  snapshotTitle: { defaultMessage: 'Learning Process' },
  loading: { defaultMessage: 'Loading...' },
  errorMessage: { defaultMessage: 'Failed to load data' },
  noDataMessage: { defaultMessage: 'No data available' },
  finalScoreActualLabel: { defaultMessage: 'Actual Score' },
  finalScorePredictedLabel: { defaultMessage: 'Predicted Score' },
};

const renderWithIntl = (component) => {
  return render(
    <IntlProvider locale="en" messages={defaultMessages}>
      {component}
    </IntlProvider>,
  );
};

describe('LearningProcessSnapshot', () => {
  const mockSnapshot = {
    id: 1,
    student_id: 'STU001',
    username: 'testuser',
    position_code: 'EXPERT',
    position_text: 'Chuyên viên',
    gender_code: 'F',
    gender_text: 'Nữ',
    location_code: 'HN',
    location_text: 'Hà Nội',
    job_title_code: 'ENG',
    job_title_text: 'Kỹ sư',
    experience_code: 'MID',
    experience_text: 'Từ 3-5 năm',
    week_1: 8,
    week_2: 9,
    week_3: 8,
    vle_1: 45,
    vle_2: 52,
    vle_3: 48,
    final_score: 8,
    predicted_final_score: 8.25,
    score_type: 'actual',
    effective_final_score: 8,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAccountProfileModule.useAccountProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should display loading state initially', () => {
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(document.querySelector('.pgn__spinner')).toBeInTheDocument();
  });

  it('should display snapshot data when loaded', () => {
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: mockSnapshot,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    // Check personal information
    expect(screen.getByText('Chuyên viên')).toBeInTheDocument();
    expect(screen.getByText('Nữ')).toBeInTheDocument();
    expect(screen.getByText('Hà Nội')).toBeInTheDocument();

    // Check week scores
    expect(screen.getAllByText(/8\/10/).length).toBeGreaterThan(0);
    expect(screen.getByText(/9\/10/)).toBeInTheDocument();

    // Check final score
    expect(screen.getByText(/Xuất sắc!/)).toBeInTheDocument();
  });

  it('should display no data message when snapshot is null', () => {
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(screen.getByText(/dữ liệu quá trình học tập của bạn chưa có sẵn/i)).toBeInTheDocument();
  });

  it('should display error message when error occurs', () => {
    const mockError = new Error('API Error');
    mockError.response = { status: 500 };
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: null,
      loading: false,
      error: mockError,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should display correct badge color for high score', () => {
    const highScoreSnapshot = { ...mockSnapshot, final_score: 9 };
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: highScoreSnapshot,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(screen.getByText(/Xuất sắc!/)).toBeInTheDocument();
  });

  it('should display correct interpretation for medium score', () => {
    const mediumScoreSnapshot = {
      ...mockSnapshot,
      final_score: 6,
      effective_final_score: 6,
      predicted_final_score: null,
      score_type: 'actual',
    };
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: mediumScoreSnapshot,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(screen.getByText(/Tốt/)).toBeInTheDocument();
  });

  it('should display correct interpretation for low score', () => {
    const lowScoreSnapshot = {
      ...mockSnapshot,
      final_score: 3,
      effective_final_score: 3,
      predicted_final_score: null,
      score_type: 'actual',
    };
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: lowScoreSnapshot,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(screen.getByText(/Cần cải thiện/)).toBeInTheDocument();
  });

  it('should handle null categorical fields gracefully', () => {
    const snapshotWithNulls = {
      ...mockSnapshot,
      position_text: null,
      gender_text: null,
    };
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: snapshotWithNulls,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    // Should not crash and should display other data
    expect(screen.getByText('Hà Nội')).toBeInTheDocument();
  });

  it('should prefer live account profile fields over unknown snapshot values', () => {
    const unknownSnapshot = {
      ...mockSnapshot,
      position_text: 'Unknown',
      gender_text: 'Unknown',
      location_text: 'Unknown',
      job_title_text: 'Unknown',
    };

    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: unknownSnapshot,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    useAccountProfileModule.useAccountProfile.mockReturnValue({
      profile: {
        level_of_education: 'Chuyên viên chính',
        gender: 'Nữ',
        mailing_address: 'Đà Nẵng',
        job_title: 'Chuyên viên nghiệp vụ',
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(screen.getByText('Chuyên viên chính')).toBeInTheDocument();
    expect(screen.getByText('Đà Nẵng')).toBeInTheDocument();
    expect(screen.getByText('Chuyên viên nghiệp vụ')).toBeInTheDocument();
  });

  it('should render card header with title', () => {
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: mockSnapshot,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    // Check for card structure
    const card = document.querySelector('.learning-process-snapshot-card');
    expect(card).toBeInTheDocument();
  });

  it('should display actual score label when score is actual', () => {
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: mockSnapshot,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(screen.getByText('Điểm thực tế')).toBeInTheDocument();
  });

  it('should display predicted score label when score is predicted', () => {
    const predictedSnapshot = {
      ...mockSnapshot,
      final_score: null,
      predicted_final_score: 7.4,
      effective_final_score: 7.4,
      score_type: 'predicted',
    };

    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: predictedSnapshot,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(screen.getByText('Điểm dự đoán')).toBeInTheDocument();
    expect(screen.getAllByText(/7.4\/10/).length).toBeGreaterThan(0);
  });
});
