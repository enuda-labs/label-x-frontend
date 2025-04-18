import { Task } from '@/components/types/task';
import { RawTask } from '@/app/review/assign';
import { ReviewTask } from '@/components/types/review-task';
import { AxiosClient } from '@/utils/axios';

const axiosClient = new AxiosClient();

export const fetchAssignedTasks = async () => {
  const response = await axiosClient.get<RawTask[]>('/tasks/assigned-task');
  return response.data;
};

export const fetchReviewTasks = async () => {
  const response = await axiosClient.get<ReviewTask[]>('/tasks/review-needed/');
  return response.data;
};

export const assignTask = async (taskId: string) => {
  const response = await axiosClient.post<{ task_id: string }, { status: string; message: string }>(
    'tasks/assign-to-me/',
    {
      task_id: taskId,
    }
  );
  return response.data;
};

export const fetchPendingReviews = async () => {
  const response = await axiosClient.get<ReviewTask[]>('/tasks/my-pending-reviews/');
  return response.data;
};

export const fetchTasks = async () => {
  const response = await axiosClient.get<Task[]>('/tasks/my-tasks/');
  return response.data;
};

export const submitReview = async (payload: any) => {
  const response = await axiosClient.get<Task[]>('/tasks/submit-review', payload);
  return response.data;
};
