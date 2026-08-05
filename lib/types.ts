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
