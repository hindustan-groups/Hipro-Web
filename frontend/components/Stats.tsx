import AnimatedCounter from "./AnimatedCounter";
import DynamicIcon from "./DynamicIcon";
import type { Stats as StatType } from "@/lib/types";

export default function Stats({ stats }: { stats: StatType[] }) {
  return (
    <section id="section-stats" className="py-16 bg-white relative border-y border-slate-200">
      {/* Subtle background glow for premium feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-50/50 via-transparent to-transparent opacity-80"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-12">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`group flex flex-col items-center justify-center text-center px-4 ${
                i !== 0 && i !== 3 ? 'md:border-l md:border-slate-200' : ''
              } ${
                i !== 0 ? 'border-slate-200 max-md:border-t max-md:pt-8' : ''
              } ${
                i > 0 && i % 2 !== 0 ? 'max-md:border-l max-md:border-t-0 max-md:pt-0' : ''
              } lg:border-l lg:border-t-0 lg:pt-0 ${
                i === 0 ? 'lg:border-l-0' : ''
              }`}
            >
              <div className="w-14 h-14 mb-5 rounded-none bg-slate-50 border border-slate-200 text-construction-red flex items-center justify-center group-hover:bg-construction-red group-hover:text-white group-hover:border-construction-red transition-all duration-500 shadow-sm">
                <DynamicIcon name={s.icon} className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2 font-display text-black tracking-tight">
                <AnimatedCounter value={s.value} />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 group-hover:text-construction-navy transition-colors duration-300">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
