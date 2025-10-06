export interface Member {
  id: number;
  first_name: string;
  last_attended_at: string;
  membership_status: 'active' | 'frozen' | 'canceled';
  is_recurring: boolean;
  phone: string;
  email: string;
}

export interface EligibleMember extends Member {
  days_since_attendance: number;
  message: string;
}

export interface SkippedMember extends Member {
  days_since_attendance: number;
  skip_reason: string;
}

export interface LogEntry {
  timestamp: string;
  eligible_count: number;
  skipped_count: number;
  eligible_members: Array<{ id: number; name: string }>;
  skipped_members: Array<{ id: number; name: string; reason: string }>;
}

export interface SimulationResult {
  eligible: EligibleMember[];
  skipped: SkippedMember[];
  log: LogEntry;
}
