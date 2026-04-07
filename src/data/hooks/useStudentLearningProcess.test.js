import { renderHook, act, waitFor } from '@testing-library/react';
import * as studentProcessApi from '../services/lms/studentProcessApi';
import { useStudentLearningProcess } from './useStudentLearningProcess';

jest.mock('../services/lms/studentProcessApi');

describe('useStudentLearningProcess', () => {
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

  it('should fetch snapshot on mount', async () => {
    studentProcessApi.getStudentLearningProcess.mockResolvedValue(mockSnapshot);

    const { result } = renderHook(() => useStudentLearningProcess());

    expect(result.current.loading).toBe(true);
    expect(result.current.snapshot).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.snapshot).toEqual(mockSnapshot);
    expect(result.current.error).toBeNull();
  });

  it('should handle API error gracefully', async () => {
    const mockError = new Error('API Error');
    studentProcessApi.getStudentLearningProcess.mockRejectedValue(mockError);

    const { result } = renderHook(() => useStudentLearningProcess());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.snapshot).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('should handle 404 (no data) gracefully', async () => {
    const mockNotFoundError = new Error('Not Found');
    mockNotFoundError.response = { status: 404 };
    studentProcessApi.getStudentLearningProcess.mockRejectedValue(mockNotFoundError);

    const { result } = renderHook(() => useStudentLearningProcess());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.snapshot).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should provide refetch function', async () => {
    studentProcessApi.getStudentLearningProcess.mockResolvedValue(mockSnapshot);

    const { result } = renderHook(() => useStudentLearningProcess());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');

    jest.clearAllMocks();
    studentProcessApi.getStudentLearningProcess.mockResolvedValue({ ...mockSnapshot, final_score: 9 });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.snapshot.final_score).toBe(9);
    });
  });

  it('should return object with correct properties', async () => {
    studentProcessApi.getStudentLearningProcess.mockResolvedValue(mockSnapshot);

    const { result } = renderHook(() => useStudentLearningProcess());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toHaveProperty('snapshot');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');
  });
});
