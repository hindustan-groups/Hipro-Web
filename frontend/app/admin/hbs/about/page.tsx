"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, CheckCircle2, AlertCircle, Info, Plus, Trash2, Users, Target } from "lucide-react";
import type { HbsContent } from "@/lib/types";

interface TeamMember {
  name: string;
  role: string;
  desc: string;
}

export default function HbsAdminAbout() {
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/content", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setContent(json.data);

        try {
          if (json.data.team) {
            setTeam(JSON.parse(json.data.team));
          }
        } catch {
          setTeam([]);
        }
      }
    } catch {
      setMessage({ text: "Failed to connect to backend API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field: keyof HbsContent, value: any) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleTeamChange = (index: number, field: keyof TeamMember, val: string) => {
    setTeam((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addTeamMember = () => {
    setTeam((prev) => [
      ...prev,
      {
        name: "Technical Supervisor",
        role: "Certified Structural Specialist",
        desc: "Quality audits, on-site execution supervision, and warranty certification.",
      },
    ]);
  };

  const removeTeamMember = (index: number) => {
    setTeam((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    const payload = {
      ...content,
      team: JSON.stringify(team),
    };

    try {
      const res = await fetch("/api/hbs/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ text: "HBS About page CMS saved successfully!", type: "success" });
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/hbs/about"] }),
          });
        } catch {}
      } else {
        setMessage({ text: json.error || "Failed to save about content.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-xs uppercase tracking-wider font-mono">Loading About CMS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
            About Page Editor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display tracking-tight">
            HBS About Page CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage company philosophy, engineering heritage, corporate mission, vision, and team structure.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 text-xs flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Foundation & Story */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            <span>Story & Foundation Narrative</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              About HBS Story
            </label>
            <textarea
              rows={5}
              value={
                content.aboutStory ||
                "Hind Building Solutions (HBS) was founded under Hindustan Projects (HiPRO) to bridge the massive gap between informal local handymen and large civil contractors. Modern buildings represent substantial investments, yet minor moisture ingress, foundation settlements, and electrical wear frequently turn into catastrophic structural hazards. HBS brings certified engineering discipline, non-destructive diagnosis, and turnkey accountability to building maintenance across Rajasthan."
              }
              onChange={(e) => handleChange("aboutStory", e.target.value)}
              className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <span>Mission & Vision Statements</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Corporate Mission
              </label>
              <textarea
                rows={4}
                value={
                  content.mission ||
                  "To extend the functional life, aesthetic dignity, and structural safety of every residential, commercial, and industrial property through dependable, engineering-grade maintenance."
                }
                onChange={(e) => handleChange("mission", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Corporate Vision
              </label>
              <textarea
                rows={4}
                value={
                  content.vision ||
                  "To be Rajasthan's most trusted single-window building maintenance and protection brand, synonymous with integrity, speed, and lasting craftsmanship."
                }
                onChange={(e) => handleChange("vision", e.target.value)}
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Supervisory Structure / Team */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Supervisory / Operational Backbone</span>
            </h2>
            <button
              type="button"
              onClick={addTeamMember}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>

          <div className="space-y-3">
            {team.map((member, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 flex gap-3 items-start">
                <span className="font-mono text-xs font-bold text-slate-400 mt-2">
                  #{idx + 1}
                </span>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Division / Title
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleTeamChange(idx, "name", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Role / Certification
                    </label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleTeamChange(idx, "role", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Description / Responsibility
                    </label>
                    <input
                      type="text"
                      value={member.desc}
                      onChange={(e) => handleTeamChange(idx, "desc", e.target.value)}
                      className="w-full text-xs border border-slate-300 p-2 bg-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTeamMember(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors mt-4"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save About Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
