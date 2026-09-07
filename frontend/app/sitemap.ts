import { MetadataRoute } from 'next';
import { findAll } from '@/lib/db';
import type { BlogPost, Project, Service } from '@/lib/types';
import { cleanServiceTitle, getServiceSlug, COMPANY_INFO } from '@/lib/companyData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hindustanprojects.in';

  // Core static routes
  const staticRoutes = [
    '',
    '/about',
    '/why-us',
    '/services',
    '/projects',
    '/blogs',
    '/careers',
    '/contact',
    '/cost-estimator',
    '/privacy-policy',
    '/terms'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/privacy-policy' || route === '/terms' ? ('monthly' as const) : ('weekly' as const),
    priority: route === '' ? 1 : (route === '/privacy-policy' || route === '/terms' ? 0.3 : 0.8),
  }));

  try {
    // Fetch dynamic routes
    const [blogs, projects, services] = await Promise.all([
      findAll<BlogPost>("blogs"),
      findAll<Project>("projects"),
      findAll<Service>("services"),
    ]);

    const blogRoutes = blogs
      .filter(b => b.active !== false && b.slug)
      .map((post) => ({
        url: `${baseUrl}/blogs/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    const projectRoutes = projects
      .filter(p => p.status !== "archived")
      .map((project) => ({
        url: `${baseUrl}/projects/${project.id}`,
        lastModified: new Date(project.updatedAt || project.createdAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    // Use active database services or fall back to verified company services
    const activeDbServices = services.filter(s => s.active !== false && s.title);
    const serviceList = activeDbServices.length > 0 
      ? activeDbServices 
      : COMPANY_INFO.services.map((title, idx) => ({ 
          id: String(idx + 1), 
          title, 
          updatedAt: new Date(), 
          createdAt: new Date() 
        } as unknown as Service));

    const serviceRoutes = serviceList.map((service) => {
      const cleanTitle = cleanServiceTitle(service.title);
      const slug = getServiceSlug(cleanTitle);
      return {
        url: `${baseUrl}/services/${slug}`,
        lastModified: new Date(service.updatedAt || service.createdAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });

    return [...staticRoutes, ...blogRoutes, ...projectRoutes, ...serviceRoutes];
  } catch (error) {
    console.error("Failed to generate sitemap for dynamic routes:", error);
    return staticRoutes;
  }
}
