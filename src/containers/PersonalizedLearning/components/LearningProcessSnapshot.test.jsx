import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import LearningProcessSnapshot from './LearningProcessSnapshot';
import * as useStudentLearningProcessModule from '../../../data/hooks/useStudentLearningProcess';
import messages from '../messages';

jest.mock('../../../data/hooks/useStudentLearningProcess');

const defaultMessages = {
  snapshotTitle: { defaultMessage: 'Learning Process' },
  loading: { defaultMessage: 'Loading...' },
  errorMessage: { defaultMessage: 'Failed to load data' },
  noDataMessage: { defaultMessage: 'No data available' },
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    expect(screen.getByRole('status')).toBeInTheDocument();
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
    expect(screen.getByText(/8\/10/)).toBeInTheDocument();
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
    const mediumScoreSnapshot = { ...mockSnapshot, final_score: 6 };
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
    const lowScoreSnapshot = { ...mockSnapshot, final_score: 3 };
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

  it('should render card header with title', () => {
    useStudentLearningProcessModule.useStudentLearningProcess.mockReturnValue({
      snapshot: mockSnapshot,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithIntl(<LearningProcessSnapshot />);

    // Check for card structure
    const card = screen.getByText('Learning Process').closest('.learning-process-snapshot-card');
    expect(card).toBeInTheDocument();
  });
});
