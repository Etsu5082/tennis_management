export interface User {
  id: number;
  name: string;
  student_id: string;
  registration_number?: string;
  email?: string;
  role: 'admin' | 'member';
  password_reset_required?: boolean;
  line_notify_token?: string;
  is_active: boolean;
  created_at: string;
}

export interface Practice {
  id: number;
  date: string;
  start_time: string;
  end_time?: string;
  location: string;
  courts: number;
  capacity_per_court: number;
  deadline_datetime: string;
  court_fee_per_court: number;
  status: 'open' | 'closed' | 'completed' | 'cancelled';
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Participation {
  id: number;
  practice_id: number;
  user_id: number;
  status: 'attending' | 'late' | 'absent' | 'waitlist';
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  date?: string;
  start_time?: string;
  location?: string;
  practice_status?: string;
}

export interface BallBag {
  id: number;
  name: string;
  current_holder_id?: number;
  current_holder_name?: string;
  created_at: string;
  updated_at: string;
}

export interface BallBagHistory {
  id: number;
  ball_bag_id: number;
  practice_id: number;
  user_id: number;
  user_name: string;
  practice_date: string;
  taken_at: string;
}

export interface CourtFee {
  id: number;
  practice_id: number;
  total_fee: number;
  participant_count: number;
  fee_per_person: number;
  created_at: string;
  updated_at: string;
}

export interface CourtFeeStats {
  id: number;
  name: string;
  total_paid: number;
  practice_count: number;
  annual_fee?: number;
  difference?: number;
}

export interface ParticipationStats {
  attending: number;
  late: number;
  absent: number;
  waitlist: number;
}

export interface Settings {
  [key: string]: {
    value: string;
    description: string;
  };
}

export interface LoginRequest {
  student_id: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  student_id: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
