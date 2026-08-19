import { MetadataRoute } from 'next';
import { findAll } from '@/lib/db';
import type { BlogPost, Project, Service } from '@/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hindustanprojects.in';

  // Core static routes
  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/projects',
    '/blogs',
    '/careers',
    '/contact',
    '/cost-estimator'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Fetch dynamic routes
    const [blogs, projects, services] = await Promise.all([
      findAll<BlogPost>("blogs"),
      findAll<Project>("projects"),
      findAll<Service>("services"),
    ]);

    const blogRoutes = blogs
      .filter(b => b.active !== false)
      .map((post) => ({
        url: `${baseUrl}/blogs/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    const projectRoutes = projects
      .filter(p => p.status !== "inactive")
      .map((project) => ({
        url: `${baseUrl}/projects/${project.id}`,
        lastModified: new Date(project.updatedAt || project.createdAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    const serviceRoutes = services
      .filter(s => s.active !== false)
      .map((service) => ({
        url: `${baseUrl}/services/${service.title?.toLowerCase().replace(/\s+/g, '-')}`, // assuming slug logic matches
        lastModified: new Date(service.updatedAt || service.createdAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...blogRoutes, ...projectRoutes, ...serviceRoutes];
  } catch (error) {
    console.error("Failed to generate sitemap for dynamic routes:", error);
    return staticRoutes;
  }
}
