import { MetadataRoute } from 'next';
import { findAll } from '@/lib/db';
import type { BlogPost, Project, Service } from '@/lib/types';
import { cleanServiceTitle, getServiceSlug, COMPANY_INFO } from '@/lib/companyData';
import { buildProjectCanonicalUrl } from '@/lib/projectUrl';
import { CURATED_LANDMARKS } from '@/lib/curatedProjects';
import { DEFAULT_HBS_SERVICES, fetchHbsProjects } from '@/lib/hbsData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hindustanprojects.in';

  // Core static routes with search-intent weighted priorities
  const legalRoutes = new Set(['/privacy-policy', '/terms', '/cookie-policy']);
  const priorityMap: Record<string, number> = {
    '': 1.0,
    '/contact': 0.9,
    '/cost-estimator': 0.9,
    '/services': 0.8,
    '/projects': 0.8,
    '/about': 0.8,
    '/blogs': 0.8,
    '/why-us': 0.7,
    '/careers': 0.6,
    '/privacy-policy': 0.3,
    '/terms': 0.3,
    '/cookie-policy': 0.3,
  };

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
    '/terms',
    '/cookie-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: legalRoutes.has(route) ? ('monthly' as const) : ('weekly' as const),
    priority: priorityMap[route] ?? 0.7,
  }));

  try {
    // Fetch dynamic routes
    const [blogs, projects, services] = await Promise.all([
      findAll<BlogPost>("blogs"),
      findAll<Project>("projects"),
      findAll<Service>("services"),
    ]);

    const now = new Date();
    const blogRoutes = blogs
      .filter((b): b is BlogPost & { slug: string } => {
        if (!b || typeof b.slug !== "string" || !b.slug.trim()) return false;
        if (b.active === false) return false;
        const status = (b.status || "published").toLowerCase();
        if (status !== "published") return false;
        if (b.publishDate) {
          const pd = new Date(b.publishDate);
          if (!isNaN(pd.getTime()) && pd > now) return false;
        }
        return true;
      })
      .map((post) => {
        const cleanSlug = post.slug.trim().replace(/^\/+/, "");
        const rawDate = post.updatedAt || post.createdAt;
        const parsedDate = rawDate ? new Date(rawDate) : new Date();
        const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
        return {
          url: `${baseUrl}/blogs/${cleanSlug}`,
          lastModified: validDate,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        };
      });

    const seenProjectUrls = new Set<string>();
    const projectRoutes = projects
      .filter((p): p is Project & { slug: string } => {
        if (!p) return false;
        // Public indexing condition: must be published, not archived, and not noIndex
        if (p.publishStatus !== "published") return false;
        if (p.status === "archived") return false;
        if (p.noIndex === true) return false;
        if (!p.slug || typeof p.slug !== "string" || !p.slug.trim()) return false;
        return true;
      })
      .map((project) => {
        const projectUrl = buildProjectCanonicalUrl(project.slug);
        if (!projectUrl) return null;

        // Deduplication
        if (seenProjectUrls.has(projectUrl)) return null;
        seenProjectUrls.add(projectUrl);

        const rawDate = project.updatedAt || project.createdAt;
        const parsedDate = rawDate ? new Date(rawDate) : new Date();
        const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

        return {
          url: projectUrl,
          lastModified: validDate,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    // Fall back to authoritative curated landmarks when database has no published projects
    const effectiveProjectRoutes = projectRoutes.length > 0
      ? projectRoutes
      : CURATED_LANDMARKS
          .map((landmark) => {
            const projectUrl = buildProjectCanonicalUrl(landmark.slug);
            if (!projectUrl) return null;
            return {
              url: projectUrl,
              lastModified: new Date(),
              changeFrequency: 'monthly' as const,
              priority: 0.7,
            };
          })
          .filter((entry): entry is { url: string; lastModified: Date; changeFrequency: "monthly"; priority: number } => entry !== null);

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

    // Hind Building Solutions (HBS) Ecosystem Routes
    const hbsStaticRoutes = [
      '/hbs',
      '/hbs/about',
      '/hbs/services',
      '/hbs/projects',
      '/hbs/contact',
      '/hbs/why-choose-us',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const hbsServiceRoutes = DEFAULT_HBS_SERVICES
      .filter((s) => s.active !== false && s.slug)
      .map((service) => ({
        url: `${baseUrl}/hbs/services/${service.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    let hbsProjectRoutes: { url: string; lastModified: Date; changeFrequency: "monthly"; priority: number }[] = [];
    try {
      const hbsProjects = await fetchHbsProjects();
      hbsProjectRoutes = hbsProjects
        .filter((p) => Boolean(p.slug))
        .map((p) => ({
          url: `${baseUrl}/hbs/projects/${p.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }));
    } catch {
      // Fallback gracefully if backend unavailable during sitemap generation
    }

    return [
      ...staticRoutes,
      ...blogRoutes,
      ...effectiveProjectRoutes,
      ...serviceRoutes,
      ...hbsStaticRoutes,
      ...hbsServiceRoutes,
      ...hbsProjectRoutes,
    ];
  } catch (error) {
    console.error("Failed to generate sitemap for dynamic routes:", error);
    return staticRoutes;
  }
}
