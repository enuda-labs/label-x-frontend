export interface ReviewTask {
  id: string;
  serial_no: string;
  text: string;
  ai_classification: string;
  confidence: number;
  human_reviewed: string;
  final_label: string;
  priority: string;
  created_at: string;
  processing_status: string;
  assigned_to: number;
}
