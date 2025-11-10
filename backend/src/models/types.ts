export interface User {
  id: number;
  name: string;
  email?: string;
  student_id: string;
  registration_number?: string;
  password_hash: string;
  password_reset_required: boolean;
  role: 'admin' | 'member';
  line_notify_token?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Practice {
  id: number;
  date: Date;
  start_time: string;
  end_time?: string;
  location: string;
  courts: number;
  capacity_per_court: number;
  deadline_datetime: Date;
  court_fee_per_court: number;
  status: 'open' | 'closed' | 'completed' | 'cancelled';
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface Participation {
  id: number;
  practice_id: number;
  user_id: number;
  status: 'attending' | 'late' | 'absent' | 'waitlist';
  created_at: Date;
  updated_at: Date;
}

export interface BallBag {
  id: number;
  name: string;
  current_holder_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface BallBagHistory {
  id: number;
  ball_bag_id: number;
  practice_id: number;
  user_id: number;
  taken_at: Date;
}

export interface CourtFee {
  id: number;
  practice_id: number;
  total_fee: number;
  participant_count: number;
  fee_per_person: number;
  created_at: Date;
  updated_at: Date;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  updated_at: Date;
}

export interface AuthRequest {
  student_id: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  student_id: string;
  password: string;
}
