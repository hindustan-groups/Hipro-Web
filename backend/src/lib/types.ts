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

export interface ProjectGalleryItem {
  url: string;
  alt?: string;
  caption?: string;
  order?: number;
  isCover?: boolean;
}

export interface ProjectHighlight {
  label: string;
  value: string;
}

export interface ProjectFaq {
  question: string;
  answer: string;
}

export interface Project {
  id?: string;
  slug?: string | null;
  title: string;
  shortDescription?: string | null;
  description: string;
  category: string;
  subCategories?: string | string[] | null;

  // Specifications
  client?: string | null;
  owner?: string | null;
  area?: string | null;
  services?: string | string[] | null;
  location: string;
  date: string;
  completionDate?: string | null;
  highlights?: string | ProjectHighlight[] | null;

  // Geographic (Zero defaults, strictly optional)
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  targetLocation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;

  // Media
  image: string;
  imageAlt?: string | null;
  imageCaption?: string | null;
  images?: string | null;
  galleryDetails?: string | ProjectGalleryItem[] | null;
  videoUrl?: string | null;
  videoType?: "youtube" | "vimeo" | "direct" | "none" | null;
  videoTitle?: string | null;
  videoDescription?: string | null;
  videoPoster?: string | null;

  // Q&A
  faqs?: string | ProjectFaq[] | null;

  // Status & Publishing
  status?: "active" | "archived" | "completed" | "ongoing";
  publishStatus?: "draft" | "published" | "archived";
  publishedAt?: string | Date | null;
  featured?: boolean;
  order?: number;

  // SEO & Directives
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeywords?: string | null;
  secondaryKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  noIndex?: boolean;
  noFollow?: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
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

export interface ProjectsHeroContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  enabled?: boolean;
}

export interface BlogsHeroContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  enabled?: boolean;
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

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface ServiceProcessStep {
  step: string;
  title: string;
  desc: string;
}

export interface ProjectScope {
  title: string;
  desc?: string;
}

export interface HbsHeroHighlight {
  label: string;
  icon?: string;
}

export interface HbsGuarantee {
  title?: string;
  description?: string;
  badge?: string;
  partners?: string[];
}

export interface HbsInternalNote {
  id: string;
  author: string;
  note: string;
  createdAt: string;
}

export interface HbsContent {
  id?: string;
  brandName: string;
  logo?: string | null;
  logoPrimary?: string | null;
  logoDark?: string | null;
  logoMark?: string | null;
  logoMobile?: string | null;
  favicon?: string | null;
  ogDefaultImage?: string | null;
  gaMeasurementId?: string | null;
  emergencyNotice?: string | null;
  privacyPolicyUrl?: string | null;
  termsUrl?: string | null;
  tagline?: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  businessHours?: string | null;
  socialLinks?: string | null;
  ctaSettings?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImage?: string | null;
  heroCtas?: string | null;
  heroHighlights?: string | HbsHeroHighlight[] | null;
  whyChooseUs?: string | null;
  stats?: string | null;
  processSteps?: string | ServiceProcessStep[] | null;
  guaranteeSection?: string | HbsGuarantee | null;
  homeFinalCta?: string | null;
  aboutStory?: string | null;
  mission?: string | null;
  vision?: string | null;
  team?: string | null;
  whyChoosePoints?: string | null;
  aboutImages?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  twitterImage?: string | null;
  jsonLd?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface HbsService {
  id?: string;
  serviceNumber?: string | null;
  title: string;
  hindiTitle?: string | null;
  slug: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  image?: string | null;
  icon?: string | null;
  features?: string | string[] | null;
  benefits?: string | string[] | null;
  processSteps?: string | ServiceProcessStep[] | null;
  warrantyDetails?: string | null;
  pricingEstimate?: string | null;
  faqs?: string | ServiceFAQ[] | null;
  galleryImages?: string | string[] | null;
  ogImage?: string | null;
  whatsappCtaText?: string | null;
  active?: boolean;
  order?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface HbsProject {
  id?: string;
  slug?: string | null;
  title: string;
  location?: string | null;
  serviceCategory?: string | null;
  clientType?: string | null;
  description?: string | null;
  scopeOfWork?: string | string[] | ProjectScope[] | null;
  problemStatement?: string | null;
  solutionStatement?: string | null;
  resultStatement?: string | null;
  areaTreated?: string | null;
  durationDays?: number | null;
  images?: string | string[] | null;
  beforeAfterImages?: string | any[] | null;
  date?: string | null;
  status?: string;
  featured?: boolean;
  active?: boolean;
  order?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface HbsTestimonial {
  id?: string;
  name: string;
  designation?: string | null;
  content: string;
  image?: string | null;
  avatar?: string | null;
  rating?: number;
  service?: string | null;
  serviceSlug?: string | null;
  serviceCategory?: string | null;
  location?: string | null;
  projectType?: string | null;
  projectDate?: string | null;
  featured?: boolean;
  active?: boolean;
  order?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface HbsLead {
  id?: string;
  name: string;
  phone: string;
  email?: string | null;
  selectedService?: string | null;
  message?: string | null;
  source?: string;
  status?: string;
  assignedTo?: string | null;
  quotationAmount?: number | null;
  priority?: string;
  internalNotes?: string | HbsInternalNote[] | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}


