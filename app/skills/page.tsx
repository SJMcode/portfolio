"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { useLanguage } from "@/context/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { addSkill, deleteSkill, addProjectCase, deleteProjectCase, getSkillsData } from "@/app/actions/skills";
import { toast } from "sonner";

// Static Competency fallbacks
const FALLBACK_COMPETENCIES = [
  "Node.js",
  "Next.js (App Router)",
  "Java Spring Boot",
  "RESTful APIs",
  "System Architecture",
  "Distributed Systems",
  "PostgreSQL (Query Tuning, Indexing, Transactions)",
  "MySQL",
  "Cloud Firestore",
  "TypeScript",
  "JavaScript (ES6+)",
  "React",
  "Tailwind CSS v4",
  "Technical SEO (Core Web Vitals)",
  "AWS (EC2, S3, CloudFront)",
  "Azure",
  "CI/CD (GitHub Actions, Jenkins)",
  "Git",
];

interface SkillItem {
  id: string;
  name: string;
}

interface ProjectCaseItem {
  id: string;
  title: string;
  category: string;
  image: string;
  url: string;
  techStack: string;
  linkText: string;
}

export default function SkillsPage() {
  const { t } = useLanguage();
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user && (session.user as any).role === "admin";

  const [search, setSearch] = useState("");
  const [time, setTime] = useState("");

  // Dynamic States
  const [dbSkills, setDbSkills] = useState<SkillItem[]>([]);
  const [dbCases, setDbCases] = useState<ProjectCaseItem[]>([]);

  // Admin Input States
  const [newSkillName, setNewSkillName] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Project input fields
  const [projTitle, setProjTitle] = useState("");
  const [projCategory, setProjCategory] = useState("CASE STUDY");
  const [projImage, setProjImage] = useState("/movie_portal_thumbnail.jpg");
  const [projUrl, setProjUrl] = useState("");
  const [projTechStack, setProjTechStack] = useState("");
  const [projLinkText, setProjLinkText] = useState("Visit live site");

  // Stockholm Clock
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("en-US", { timeZone: "Europe/Stockholm" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dynamic skills & cases
  const loadSkillsData = async () => {
    const res = await getSkillsData();
    setDbSkills(res.skills);
    setDbCases(res.cases);
  };

  useEffect(() => {
    loadSkillsData();
  }, []);

  // Determine current skills list (fallback to static list if db empty)
  const currentSkills = useMemo(() => {
    if (dbSkills.length > 0) {
      return dbSkills.map(s => s.name);
    }
    return FALLBACK_COMPETENCIES;
  }, [dbSkills]);

  const filteredSkills = useMemo(() => {
    return currentSkills.filter((skill) =>
      skill.toLowerCase().includes(search.toLowerCase())
    );
  }, [currentSkills, search]);

  // Determine current cases (fallback to static ones if empty)
  const currentCases = useMemo(() => {
    if (dbCases.length > 0) {
      return dbCases;
    }
    // Fallback static items
    return [
      {
        id: "static-1",
        title: t("skills_case_1_title"),
        category: "CASE STUDY",
        image: "/movie_portal_thumbnail.jpg",
        url: "https://ecommerce-movie-portal.vercel.app/",
        techStack: [
          t("skills_case_1_desc_1"),
          t("skills_case_1_desc_2"),
          t("skills_case_1_desc_3")
        ].join(", "),
        linkText: t("skills_click_visit")
      },
      {
        id: "static-2",
        title: t("skills_case_2_title"),
        category: "ACADEMIC THESIS",
        image: "/thesis_iot_thumbnail.jpg",
        url: "https://su.diva-portal.org/smash/record.jsf?pid=diva2%3A2002079&dswid=-3847",
        techStack: [
          t("skills_case_2_desc_1"),
          t("skills_case_2_desc_2")
        ].join(", "),
        linkText: t("skills_click_details")
      }
    ];
  }, [dbCases, t]);

  // Add a new skill competency
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsSaving(true);
    const res = await addSkill(newSkillName.trim());
    setIsSaving(false);

    if (res.ok) {
      toast.success("Skill added successfully!");
      setNewSkillName("");
      loadSkillsData();
    } else {
      toast.error(res.error || "Failed to add skill.");
    }
  };

  // Delete a skill competency
  const handleDeleteSkill = async (skillName: string) => {
    // Find skill ID
    const skillObj = dbSkills.find(s => s.name === skillName);
    if (!skillObj) {
      toast.error("Can only delete custom database-backed skills.");
      return;
    }

    const res = await deleteSkill(skillObj.id);
    if (res.ok) {
      toast.success("Skill deleted!");
      loadSkillsData();
    } else {
      toast.error(res.error || "Failed to delete skill.");
    }
  };

  // Add project case card
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projUrl || !projTechStack) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    const res = await addProjectCase({
      title: projTitle,
      category: projCategory,
      image: projImage,
      url: projUrl,
      techStack: projTechStack,
      linkText: projLinkText,
    });
    setIsSaving(false);

    if (res.ok) {
      toast.success("Project Case Study added!");
      setProjTitle("");
      setProjUrl("");
      setProjTechStack("");
      setShowProjectModal(false);
      loadSkillsData();
    } else {
      toast.error(res.error || "Failed to save project.");
    }
  };

  // Delete project case
  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (id.startsWith("static-")) {
      toast.error("Cannot delete default static templates.");
      return;
    }

    const res = await deleteProjectCase(id);
    if (res.ok) {
      toast.success("Project deleted!");
      loadSkillsData();
    } else {
      toast.error(res.error || "Failed to delete project.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start text-left py-6"
    >
      {/* Left Column: Time, Skills finder, Focus Ref info */}
      <div className="space-y-8">
        {/* Local Time Indicator */}
        <div className="text-sm font-mono text-slate-600 dark:text-slate-400">
          {t("skills_time")}: {time || "Loading..."}
        </div>

        {/* Skills Filtering & Administration Section */}
        <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
          <span className="text-xs uppercase font-extrabold text-sky-500 dark:text-sky-400 tracking-widest block mb-4">
            {t("skills_finder_title")}
          </span>
          <input
            type="text"
            placeholder={t("skills_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 transition duration-300 shadow-sm"
          />

          {/* Admin Add Skill Form */}
          {isAdmin && (
            <form onSubmit={handleAddSkill} className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-900/60">
              <input
                type="text"
                placeholder="Add skill (e.g. Docker)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                required
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-sky-550 bg-sky-500 hover:brightness-110 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Add
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-2 mt-6">
            {filteredSkills.map((skill, index) => {
              // Check if it is a deletable custom database skill
              const isCustom = dbSkills.some(s => s.name === skill);
              return (
                <span
                  key={index}
                  className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                >
                  {skill}
                  {isAdmin && isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(skill)}
                      className="text-red-500 hover:text-red-600 font-bold text-[9px] cursor-pointer ml-1"
                      title="Delete competency"
                    >
                      ✕
                    </button>
                  )}
                </span>
              );
            })}
            {filteredSkills.length === 0 && (
              <p className="text-xs text-slate-400 font-medium py-2">
                {t("skills_no_results")}
              </p>
            )}
          </div>
        </div>

        {/* Quick Auth Info */}
        <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm space-y-4">
          <span className="text-xs uppercase font-extrabold text-indigo-500 dark:text-indigo-400 tracking-wider block">
            {t("skills_verification_title")}
          </span>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
            {t("skills_verification_text")}
          </p>
        </div>
      </div>

      {/* Right Column: Case Studies Timeline List */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase font-extrabold text-pink-500 dark:text-pink-400 tracking-widest block">
            {t("skills_case_title")}
          </span>
          {isAdmin && (
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-3 py-1.5 bg-pink-500 hover:brightness-110 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
            >
              ➕ Add Project Case
            </button>
          )}
        </div>

        <div className="space-y-8">
          {currentCases.map((proj) => (
            <a
              key={proj.id}
              href={proj.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:no-underline tilt-container group"
            >
              <Card className="border-pink-500/20 hover:border-pink-500/40 hover:shadow-pink-500/5 transition-all duration-300 bg-white dark:bg-slate-950/60 overflow-hidden p-8 relative">
                
                {/* Delete button for admin cases */}
                {isAdmin && !proj.id.startsWith("static-") && (
                  <button
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="absolute top-4 right-4 z-10 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold rounded cursor-pointer"
                  >
                    🗑️ Delete
                  </button>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                    {proj.title}
                  </CardTitle>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">{proj.category}</span>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-44 overflow-hidden rounded-lg mb-4 border border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    <img
                      src={proj.image}
                      alt={proj.title}
                      className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <ul className="text-xs text-slate-650 dark:text-slate-400 space-y-2 mb-4 leading-relaxed font-medium">
                    {proj.techStack.split(",").map((point, idx) => (
                      <li key={idx}>• {point.trim()}</li>
                    ))}
                  </ul>
                  
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400">
                    {proj.linkText}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      {/* Project Case Insertion Dialog (Admin Only) */}
      <AnimatePresence>
        {showProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-8 space-y-6 text-left shadow-2xl relative"
            >
              <button
                onClick={() => setShowProjectModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
              <h3 className="text-sm font-extrabold text-pink-500 dark:text-pink-400 uppercase tracking-wider">
                Create Project Case Study
              </h3>
              
              <form onSubmit={handleAddProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Project Title</label>
                  <input
                    type="text"
                    placeholder="e.g. E-Commerce Server App"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-pink-500 transition duration-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Category Tag</label>
                    <select
                      value={projCategory}
                      onChange={(e) => setProjCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="CASE STUDY">CASE STUDY</option>
                      <option value="ACADEMIC THESIS">ACADEMIC THESIS</option>
                      <option value="SIDE PROJECT">SIDE PROJECT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Image Path / URL</label>
                    <input
                      type="text"
                      value={projImage}
                      onChange={(e) => setProjImage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Target Redirect Link</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projUrl}
                    onChange={(e) => setProjUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-pink-500 transition duration-300"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Tech Stack Points (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js App Router, Supabase PostgreSQL, Prisma ORM"
                    value={projTechStack}
                    onChange={(e) => setProjTechStack(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-pink-500 transition duration-300"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Link Anchor Text</label>
                  <input
                    type="text"
                    value={projLinkText}
                    onChange={(e) => setProjLinkText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-850 hover:brightness-110 text-slate-900 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-pink-500 hover:brightness-110 text-slate-950 font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Adding..." : "Add Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
