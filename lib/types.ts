export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  status?: "new" | "read" | "replied";
  createdAt?: string;
  updatedAt?: string;
}

export interface QuoteRequest {
  id?: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  location: string;
  description: string;
  timeline: string;
  status?: "pending" | "reviewed" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id?: string;
  title: string;
  category: string;
  location: string;
  date: string;
  image: string;
  description: string;
  featured?: boolean;
  status?: "active" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id?: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  image: string;
  order?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  image?: string;
  rating: number;
  text: string;
  approved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  active?: boolean;
  createdAt?: string;
}

export interface Stats {
  id?: string;
  label: string;
  value: string;
  icon: string;
  order?: number;
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Settings {
  id?: string;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  navigationConfig?: string;
  
  // Phase 2: Contact Info
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  socialLinks?: string;
  
  // Phase 3: Page Content
  pageContent?: string;

  updatedAt?: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
  order?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  img: string;
  bio?: string;
  order?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Guarantee {
  id?: string;
  badge: string;
  title: string;
  description: string;
  bg: string;
  accent: string;
  image: string;
  hasShield?: boolean;
  order?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobApplication {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  cvUrl: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobPosting {
  id?: string;
  title: string;
  type: string;
  location: string;
  description?: string;
  active?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}
