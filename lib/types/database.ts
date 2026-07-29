export type UserRole = "student" | "institution" | "company" | "admin";

export type DegreeType =
  | "Licenta"
  | "Master"
  | "Doctorat"
  | "Bacalaureat";

export type SkillLevel = "Începător" | "Avansat" | "Expert";

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string;
  role: UserRole;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  background_url: string | null;
  location: string | null;
  followers_count: number;
  qr_code_slug: string | null;
}

export interface Education {
  id: string;
  profile_id: string;
  institution_name: string;
  degree: DegreeType;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  gpa: number | null;
}

export interface Experience {
  id: string;
  profile_id: string;
  company_name: string;
  position_title: string;
  location: string | null;
  work_mode: string | null;
  job_type: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export interface Project {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  live_demo_url: string | null;
  technologies: string[];
  image_url: string | null;
}

export interface Skill {
  id: string;
  profile_id: string;
  name: string;
  level: SkillLevel;
}

export interface OnboardingData {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  avatarUrl: string | null;
  educations: Omit<Education, "id" | "profile_id">[];
  experiences: Omit<Experience, "id" | "profile_id">[];
  skills: Omit<Skill, "id" | "profile_id">[];
  projects: Omit<Project, "id" | "profile_id">[];
}
