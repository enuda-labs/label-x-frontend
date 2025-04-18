// src/types/review-task.ts
export type ReviewTask = {
  id: string;
  serial_no: string;
  data?: string | null | undefined;
  ai_classification: string;
  confidence: number;
  human_reviewed: string;
  final_label: string;
  text?: string;
  priority: string;
  created_at: string;
  processing_status: 'ASSIGNED_REVIEWER' | 'REVIEWED' | 'PENDING' | string;
  assigned_to: string | null; // Updated to handle string or null
  ai_output?: {
    // Updated to allow ai_output to be undefined or null
    classification: string;
    confidence: number | string;
  } | null;
  human_review?: {
    correction: string | null;
    justification: string | null;
  };
};
