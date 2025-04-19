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

export type fetchTaskResponse = {
  status: string;
  data: {
    task_id: number;
    serial_no: string;
    task_type: string;
    processing_status: string;
    human_reviewed: boolean;
    ai_output: {
      text: string;
      confidence: number;
      human_review: {
        correction: null;
        justification: null;
      };
      classification: string;
      requires_human_review: boolean;
    };
    submitted_by: string;
    assigned_to: string;
    created_at: string;
    updated_at: string;
  };
};
