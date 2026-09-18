import { ArrowUpRight, Building, Megaphone, Laptop, FileCheck, Layers } from "lucide-react";

interface GroupCompanyItem {
  name: string;
  category?: string;
  description: string;
  website?: string;
  url?: string;
  status?: string;
  statusText?: string;
  isExternal?: boolean;
  active?: boolean;
  order?: number;
  icon?: any;
}

const defaultCompanies: GroupCompanyItem[] = [
  {
    name: "Hindustan Projects",
    category: "Architecture & Infrastructure",
    description: "Core Architecture, Turnkey Civil Construction & Infrastructure Execution.",
    url: "https://www.hindustanprojects.in/",
    website: "https://www.hindustanprojects.in/",
    isExternal: false,
    statusText: "Flagship",
    icon: Building,
  },
  {
    name: "HiPro Marketing",
    category: "Brand & Commercial Solutions",
    description: "Marketing and brand solutions under the Hindustan Group.",
    statusText: "Coming Soon",
    icon: Megaphone,
  },
  {
    name: "HiPro IT Services",
    category: "Digital & Technology",
    description: "Digital solutions and technology services under the Hindustan Group.",
    url: "https://www.itservices.hindustanprojects.in/",
    website: "https://www.itservices.hindustanprojects.in/",
    isExternal: true,
    statusText: "Live Portal",
    icon: Laptop,
  },
  {
    name: "Hindustan Empanelment",
    category: "Institutional Empanelment",
    description: "Contractor, Vendor & Institutional Empanelment Services.",
    url: "https://empanelment.hindustanprojects.in/",
    website: "https://empanelment.hindustanprojects.in/",
    isExternal: true,
    statusText: "Live Portal",
    icon: FileCheck,
  },
];

function getIconForCompany(name: string = "", category: string = "") {
  const text = `${name} ${category}`.toLowerCase();
  if (text.includes("marketing") || text.includes("brand")) return Megaphone;
  if (text.includes("it") || text.includes("tech") || text.includes("digital")) return Laptop;
  if (text.includes("empanel") || text.includes("vendor") || text.includes("contractor")) return FileCheck;
  return Building;
}

interface GroupEcosystemProps {
  pageContent?: {
    groupCompanies?: GroupCompanyItem[];
    [key: string]: any;
  } | string;
}

export default function GroupEcosystem({ pageContent }: GroupEcosystemProps = {}) {
  let displayCompanies: GroupCompanyItem[] = defaultCompanies;

  let resolvedContent: any = pageContent;
  if (typeof pageContent === "string") {
    try {
      resolvedContent = JSON.parse(pageContent);
    } catch {
      resolvedContent = {};
    }
  }

  const configuredCompanies = resolvedContent?.groupCompanies;
  const hasValidConfig = Array.isArray(configuredCompanies) && configuredCompanies.length > 0;

  if (hasValidConfig) {
    displayCompanies = configuredCompanies
      .filter((c) => c && c.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((c) => ({
        ...c,
        category:
          c.category ||
          (c.name?.includes("Marketing")
            ? "Brand & Commercial Solutions"
            : c.name?.includes("IT")
            ? "Digital & Technology"
            : c.name?.includes("Empanelment")
            ? "Institutional Empanelment"
            : "Architecture & Infrastructure"),
        url: c.website || c.url || "",
        website: c.website || c.url || "",
        isExternal: Boolean((c.website || c.url)?.startsWith("http")),
        statusText:
          c.status ||
          c.statusText ||
          (c.website || c.url ? "Live Portal" : "Coming Soon"),
        icon: c.icon || getIconForCompany(c.name, c.category),
      }));
  }

  if (displayCompanies.length === 0) {
    return null;
  }

  return (
    <section id="section-group" className="py-24 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 mb-3 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-construction-navy" />
              <span className="text-[11px] font-bold text-construction-navy uppercase tracking-wider">
                Our Companies
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-black font-display uppercase tracking-tight">
              Hindustan <span className="font-serif italic font-normal text-construction-red normal-case">Group</span>
            </h2>
          </div>
          <p className="text-slate-500 text-sm md:text-base font-light max-w-md leading-relaxed">
            A cohesive corporate ecosystem powering turnkey infrastructure, digital solutions, and institutional empanelment across Rajasthan and beyond.
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        <div className={`grid gap-6 ${
          displayCompanies.length === 1
            ? "max-w-md mx-auto"
            : displayCompanies.length === 2
            ? "sm:grid-cols-2 max-w-3xl mx-auto"
            : displayCompanies.length === 3
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "sm:grid-cols-2 lg:grid-cols-4"
        }`}>
          {displayCompanies.map((company, index) => {
            const Icon = company.icon || Building;
            const CardWrapper = company.url ? "a" : "div";
            const linkProps = company.url
              ? {
                  href: company.url,
                  ...(company.isExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {}),
                }
              : {};

            return (
              <CardWrapper
                key={index}
                {...linkProps}
                className={`group flex flex-col justify-between p-7 bg-slate-50 border border-slate-200/90 transition-all duration-300 relative ${
                  company.url
                    ? "hover:bg-white hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    : "opacity-90 cursor-default"
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Status */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-construction-navy group-hover:text-construction-red transition-colors shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border ${
                        company.statusText === "Coming Soon"
                          ? "bg-slate-200/70 border-slate-300 text-slate-600"
                          : "bg-white border-slate-200 text-construction-navy group-hover:border-construction-red group-hover:text-construction-red transition-colors"
                      }`}
                    >
                      {company.statusText}
                    </span>
                  </div>

                  {/* Category Tag */}
                  <p className="text-[11px] font-bold uppercase tracking-wider text-construction-red mb-2">
                    {company.category}
                  </p>

                  {/* Company Name */}
                  <h3 className="text-xl font-bold text-black font-display uppercase tracking-tight mb-3">
                    {company.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 font-light leading-relaxed mb-6">
                    {company.description}
                  </p>
                </div>

                {/* Footer Link / Indicator */}
                <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  {company.url ? (
                    <>
                      <span className="text-construction-navy group-hover:text-construction-red transition-colors">
                        Visit Portal
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-construction-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </>
                  ) : (
                    <span className="text-slate-400 text-[11px] font-semibold">
                      In Development
                    </span>
                  )}
                </div>
              </CardWrapper>
            );
          })}
        </div>

      </div>
    </section>
  );
}
