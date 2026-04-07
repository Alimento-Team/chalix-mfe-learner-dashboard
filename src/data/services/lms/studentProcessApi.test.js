import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import * as studentProcessApi from './studentProcessApi';

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform');

describe('studentProcessApi', () => {
  const mockBaseUrl = 'http://localhost:8000';
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
    experience_text: 'Trung bình',
    week_1: 8,
    week_2: 9,
    week_3: 8,
    vle_1: 45,
    vle_2: 52,
    vle_3: 48,
    final_score: 8,
    created_at: '2024-01-15T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({ LMS_BASE_URL: mockBaseUrl });
  });

  describe('getStudentLearningProcess', () => {
    it('should fetch student learning process for authenticated user', async () => {
      const mockClient = {
        get: jest.fn().mockResolvedValue({ data: mockSnapshot }),
      };
      getAuthenticatedHttpClient.mockReturnValue(mockClient);

      const result = await studentProcessApi.getStudentLearningProcess();

      expect(getAuthenticatedHttpClient).toHaveBeenCalled();
      expect(mockClient.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/learning_analytics/student-learning-process/me/`,
      );
      expect(result).toEqual(mockSnapshot);
    });

    it('should throw error if API call fails', async () => {
      const mockError = new Error('Network error');
      const mockClient = {
        get: jest.fn().mockRejectedValue(mockError),
      };
      getAuthenticatedHttpClient.mockReturnValue(mockClient);

      await expect(studentProcessApi.getStudentLearningProcess()).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('getStudentLearningProcessList', () => {
    it('should fetch list with no parameters', async () => {
      const mockList = { results: [mockSnapshot], count: 1 };
      const mockClient = {
        get: jest.fn().mockResolvedValue({ data: mockList }),
      };
      getAuthenticatedHttpClient.mockReturnValue(mockClient);

      const result = await studentProcessApi.getStudentLearningProcessList();

      expect(mockClient.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/learning_analytics/student-learning-process/`,
      );
      expect(result).toEqual(mockList);
    });

    it('should fetch list with filter parameters', async () => {
      const mockList = { results: [mockSnapshot], count: 1 };
      const mockClient = {
        get: jest.fn().mockResolvedValue({ data: mockList }),
      };
      getAuthenticatedHttpClient.mockReturnValue(mockClient);

      const params = {
        position_code: 'EXPERT',
        gender_code: 'F',
        offset: 0,
        limit: 10,
      };

      const result = await studentProcessApi.getStudentLearningProcessList(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/learning_analytics/student-learning-process/'),
      );
      expect(result).toEqual(mockList);
    });

    it('should include score range filters', async () => {
      const mockList = { results: [mockSnapshot], count: 1 };
      const mockClient = {
        get: jest.fn().mockResolvedValue({ data: mockList }),
      };
      getAuthenticatedHttpClient.mockReturnValue(mockClient);

      const params = {
        min_final_score: 7,
        max_final_score: 10,
      };

      await studentProcessApi.getStudentLearningProcessList(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('min_final_score=7'),
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('max_final_score=10'),
      );
    });
  });

  describe('getStudentLearningProcessAggregate', () => {
    it('should fetch aggregate data', async () => {
      const mockAggregate = {
        total_records: 100,
        avg_final_score: 7.5,
        avg_week_1: 7.2,
        avg_week_2: 7.8,
        avg_week_3: 7.5,
        position_distribution: { EXPERT: 45, JUNIOR: 55 },
        gender_distribution: { F: 60, M: 40 },
      };
      const mockClient = {
        get: jest.fn().mockResolvedValue({ data: mockAggregate }),
      };
      getAuthenticatedHttpClient.mockReturnValue(mockClient);

      const result = await studentProcessApi.getStudentLearningProcessAggregate();

      expect(mockClient.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/learning_analytics/student-learning-process/aggregate/`,
      );
      expect(result).toEqual(mockAggregate);
    });
  });
});
