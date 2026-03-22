export type Role = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  branch?: string;
  cgpa?: string;
  skills?: string[];
  resumeUrl?: string;
  createdAt?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  eligibility: string;
  createdBy: string;
  createdAt: string;
}

export type ApplicationStatus = 'Applied' | 'Selected' | 'Rejected';

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: ApplicationStatus;
  appliedAt: string;
  studentName?: string;
  jobTitle?: string;
}
