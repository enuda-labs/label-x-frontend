export interface RawTask {
    id: number | string
    serial_no: number | string
    data: string
    ai_output?: {
      classification: string
      confidence: number
    }
    human_review?: {
      correction?: string | null
      justification?: string | null
    }
    final_label?: string | null
    priority?: string
    created_at: string
    processing_status: string
    assigned_to: number
  }
  