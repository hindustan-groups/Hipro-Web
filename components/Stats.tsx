import { Trophy, Users, CheckCircle, Star } from "lucide-react";

const stats = [
  { icon: Trophy, number: "150+", label: "Awards Won", gradient: "from-red-500 to-orange-500", bg: "from-red-50 to-orange-50" },
  { icon: Users, number: "1,000+", label: "Happy Clients", gradient: "from-blue-500 to-indigo-600", bg: "from-blue-50 to-indigo-50" },
  { icon: CheckCircle, number: "500+", label: "Projects Done", gradient: "from-red-500 to-rose-600", bg: "from-red-50 to-rose-50" },
  { icon: Star, number: "4.9/5", label: "Average Rating", gradient: "from-blue-600 to-purple-600", bg: "from-blue-50 to-purple-50" },
];

export default function Stats() {
  return (
    <section id="section-stats" className="py-16 bg-white relative overflow-hidden">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`relative p-7 rounded-3xl bg-gradient-to-br ${s.bg} border border-white shadow-3d-sm card-3d text-center group overflow-hidden`}
              >
                {/* Glow on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${s.bg} rounded-3xl`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4 shadow-3d-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-4xl font-bold mb-1 font-display bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                    {s.number}
                  </div>
                  <div className="text-[13px] text-gray-500 font-medium">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />
    </section>
  );
}
