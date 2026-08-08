import { findAll } from "@/lib/db";
import type { JobApplication } from "@/lib/types";
import { Download, FileText, CheckCircle, Clock } from "lucide-react";

export default async function AdminApplicationsPage() {
  const applications = await findAll<JobApplication>("applications");
  
  // Sort by newest first
  const sortedApps = applications.sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-none border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display uppercase tracking-tight">Job Applications</h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage candidates applying through the Careers page.</p>
        </div>
        <div className="bg-slate-50 px-4 py-2 border border-slate-200 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-construction-red">{applications.length}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Apps</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
        {sortedApps.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-lg">No applications yet.</p>
            <p className="text-sm mt-1">When candidates apply on the Careers page, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Date Applied</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sortedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{app.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{app.email}</div>
                      <div className="text-xs text-slate-500">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-construction-navy">
                      {app.role}
                    </td>
                    <td className="px-6 py-4">
                      {app.experience || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      {app.status === "new" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" /> New
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> {app.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.cvUrl ? (
                        <a 
                          href={app.cvUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-construction-red hover:border-construction-red/30 transition-all text-xs font-bold uppercase tracking-wider rounded-none shadow-sm hover:shadow"
                        >
                          <Download className="w-3.5 h-3.5" /> CV
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No File</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
