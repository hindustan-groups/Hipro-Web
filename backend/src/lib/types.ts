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
  images?: string;
  description: string;
  featured?: boolean;
  status?: "active" | "archived" | "completed" | "ongoing";
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceFeatureDetail {
  title: string;
  description: string;
  points?: string[];
}

export interface ServiceApplication {
  title: string;
  description: string;
}

export interface ServiceStage {
  step: string;
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceIndicativeRates {
  heading: string;
  description: string;
  tiers: { name: string; rate: string; highlight: string }[];
}

export interface Service {
  id?: string;
  title: string;
  description: string;
  category?: string;
  icon: string;
  features: string | string[]; // Can be stringified JSON in DB
  image: string;
  order?: number;
  active?: boolean;

  // Rich Content & Detail Sections
  badge?: string | null;
  tagline?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  overviewHeading?: string | null;
  overviewParagraphs?: string | string[] | null;
  detailedCapabilities?: string | ServiceFeatureDetail[] | null;
  applicationsHeading?: string | null;
  applications?: string | ServiceApplication[] | null;
  stagesHeading?: string | null;
  stages?: string | ServiceStage[] | null;
  deliverablesHeading?: string | null;
  deliverables?: string | string[] | null;
  whyChooseHeading?: string | null;
  whyChoosePoints?: string | { title: string; description: string }[] | null;
  faqs?: string | ServiceFaq[] | null;
  indicativeRatesNotice?: string | ServiceIndicativeRates | null;

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
  isFounder?: boolean;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
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

export type BlogStatus = "draft" | "published" | "unpublished";
export type SearchIntent = "informational" | "commercial" | "transactional" | "navigational";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InternalLink {
  label: string;
  url: string;
}

export interface BlogCtaConfig {
  title: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
}

export interface BlogPost {
  id?: string;
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
  active?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;

  // Media
  imageAlt?: string;
  imageTitle?: string;
  imageCaption?: string;

  // Publishing
  status?: BlogStatus;
  publishDate?: string | Date | null;

  // SEO & GEO metadata
  primaryKeyword?: string;
  secondaryKeywords?: string;
  geoKeywords?: string;
  targetLocation?: string;
  searchIntent?: SearchIntent;

  // Structured Content & Linking (JSON strings)
  faqs?: string;
  internalLinks?: string;
  relatedPostIds?: string;
  customCta?: string;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: string;
  createdAt?: Date;
}
