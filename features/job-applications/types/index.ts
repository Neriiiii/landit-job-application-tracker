export const JOB_STATUSES = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const INTERVIEW_TYPES_DB = ["Phone", "Video", "Onsite"] as const;
export type InterviewTypeDb = (typeof INTERVIEW_TYPES_DB)[number];

export const INTERVIEW_STATUSES = ["Scheduled", "Completed", "Missed", "Cancelled"] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const JOB_STATUS_DISPLAY: Record<JobStatus, string> = {
  Wishlist: "Wishlist",
  Applied: "Applied",
  Interview: "Interview",
  Offer: "Offer",
  Rejected: "Rejected",
  Ghosted: "Ghosted",
};

export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  job_link: string | null;
  job_description: string | null;
  current_status: JobStatus;
  archived: boolean;
  resume_file_id: string | null;
  cover_letter_file_id: string | null;
  notes: string | null;
  is_fake: boolean;
  created_at: string;
  updated_at: string;
  resume_url?: string | null;
  cover_letter_url?: string | null;
}

export type JobApplicationInsert = Omit<
  JobApplication,
  "id" | "created_at" | "updated_at" | "resume_url" | "cover_letter_url"
> & {
  resume_url?: string | null;
  cover_letter_url?: string | null;
};

export type JobApplicationUpdate = Partial<
  Omit<JobApplication, "id" | "user_id" | "created_at" | "resume_url" | "cover_letter_url">
>;

export interface ApplicationStatusHistoryEntry {
  id: string;
  application_id: string;
  user_id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
}

export interface JobOffer {
  id: string;
  application_id: string;
  expected_salary: string | null;
  salary_offer: string | null;
  benefits: string | null;
  start_date: string | null;
  work_days: string | null;
  work_time_start: string | null;
  work_time_end: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  application_id: string;
  user_id: string;
  round_number: number;
  round_label: string | null;
  date: string | null;
  time: string | null;
  interview_type: InterviewTypeDb | null;
  meeting_link: string | null;
  status: InterviewStatus | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpcomingInterviewRow {
  id: string;
  application_id: string;
  date: string | null;
  time: string | null;
  meeting_link: string | null;
  interview_type: InterviewTypeDb | null;
  company_name: string;
  role_title: string;
}

export type StatusHistoryEntry = { status: JobStatus; timestamp: string };
