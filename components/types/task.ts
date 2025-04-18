// src/types/task.ts

export type Task = {
  id: string;
  title: string;
  task_type: 'TEXT' | 'IMAGE' | 'VIDEO';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  human_reviewed: boolean;
  serial_no: string;
  submitted_by: string;
  task_id: number;
  data?: string;
};
