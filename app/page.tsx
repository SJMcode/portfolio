"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { useRouter } from "next/navigation";
import { getEndorsementCount, incrementEndorsement } from "@/app/actions/endorsements";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { updateProfileSummary, addWorkExperience, getProfileData } from "@/app/actions/profile";

interface WorkExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user && (session.user as any).role === "admin";

  const [likes, setLikes] = useState(148);
  const [hasEndorsed, setHasEndorsed] = useState(false);

  // Dynamic Profile States
  const [dbSummary, setDbSummary] = useState<string | null>(null);
  const [dbExperiences, setDbExperiences] = useState<WorkExperienceItem[]>([]);

  // Modal States
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);

  // Edit fields
  const [newSummaryText, setNewSummaryText] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expDuration, setExpDuration] = useState("");
  const [expDescription, setExpDescription] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial global likes and profile details
  useEffect(() => {
    async function loadData() {
      // 1. Fetch likes
      const count = await getEndorsementCount();
      setLikes(count);

      const endorsed = localStorage.getItem("hasEndorsedProfile");
      if (endorsed === "true") {
        setHasEndorsed(true);
      }

      // 2. Fetch Profile Info
      const profile = await getProfileData();
      if (profile.summary) {
        setDbSummary(profile.summary);
        setNewSummaryText(profile.summary);
      } else {
        setNewSummaryText(t("profile_summary_text"));
      }
      setDbExperiences(profile.experiences);
    }
    loadData();
  }, [t]);

  const handleLike = async () => {
    if (hasEndorsed) {
      toast.info(t("profile_already_endorsed", { default: "You have already endorsed Safir! Thank you." }) === "profile_already_endorsed" ? "Du har redan rekommenderat Safir! Tack." : t("profile_already_endorsed"));
      return;
    }

    const res = await incrementEndorsement();
    if (res.ok && res.count !== undefined) {
      setLikes(res.count);
      setHasEndorsed(true);
      localStorage.setItem("hasEndorsedProfile", "true");
      toast.success(t("profile_endorse_success", { default: "Thank you for endorsing Safir!" }) === "profile_endorse_success" ? "Tack för din rekommendation!" : t("profile_endorse_success"));
    } else {
      toast.error(res.error || "Failed to register endorsement.");
    }
  };

  // Submit Summary Update
  const handleSaveSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummaryText.trim()) return;

    setIsSaving(true);
    const res = await updateProfileSummary(newSummaryText.trim());
    setIsSaving(false);

    if (res.ok) {
      setDbSummary(newSummaryText.trim());
      toast.success("Summary updated successfully!");
      setShowSummaryModal(false);
    } else {
      toast.error(res.error || "Failed to update summary.");
    }
  };

  // Submit Work Experience
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany || !expRole || !expDuration || !expDescription) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSaving(true);
    const res = await addWorkExperience({
      company: expCompany,
      role: expRole,
      duration: expDuration,
      description: expDescription,
    });
    setIsSaving(false);

    if (res.ok) {
      toast.success("Experience added successfully!");
      // Reload profile data to fetch latest list
      const profile = await getProfileData();
      setDbExperiences(profile.experiences);
      
      // Clear inputs
      setExpCompany("");
      setExpRole("");
      setExpDuration("");
      setExpDescription("");
      setShowExpModal(false);
    } else {
      toast.error(res.error || "Failed to add experience.");
    }
  };

  // Determine current timeline list (fallback to static list if database list is empty)
  const currentExperiences = dbExperiences.length > 0 ? dbExperiences : [
    {
      id: "1",
      role: t("timeline_role_1"),
      company: "Acugence",
      duration: "Oct 2021 – Jun 2022",
      description: [
        t("timeline_desc_1_1"),
        t("timeline_desc_1_2"),
        t("timeline_desc_1_3")
      ].join("\n")
    },
    {
      id: "2",
      role: t("timeline_role_2"),
      company: "Entri.me",
      duration: "Jan 2020 – Dec 2020",
      description: [
        t("timeline_desc_2_1"),
        t("timeline_desc_2_2"),
        t("timeline_desc_2_3")
      ].join("\n")
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start text-left py-6"
    >
      {/* Left Column (Span 7/12): Bio details, Summary, CTAs */}
      <div className="md:col-span-7 space-y-8">
        {/* Bio Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-100 dark:bg-slate-955/40 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Profile Photo */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <img
                src="/profile_picture.jpg"
                alt="Safir Jameel Manghat Profile"
                className="relative w-20 h-20 rounded-full border-2 border-white dark:border-slate-900 shadow-md object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight leading-none text-slate-900 dark:text-slate-100">
                Safir Jameel Manghat
              </h2>
              <p className="text-sky-650 dark:text-sky-400 font-semibold text-sm uppercase tracking-wider">
                {t("role_subtitle")}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {t("profile_location")}
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-extrabold">
                <a href="https://linkedin.com/in/safir-jameel" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">LinkedIn</a>
                <a href="https://github.com/sjmcode" target="_blank" rel="noreferrer" className="text-pink-500 hover:underline">GitHub</a>
                <a href="https://wa.me/46707217399?text=Hej%20Safir!%20Jag%20bes%C3%B6kte%20din%20portfolio%20och%20skulle%20vilja%20komma%20i%20kontakt." target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">WhatsApp</a>
              </div>
            </div>
          </div>

          {/* Dynamic Counter & Button */}
          <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl min-w-32 self-stretch sm:self-auto shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("profile_endorsements")}</span>
            <span className="text-3xl font-black text-sky-500 dark:text-sky-400 my-1">{likes}</span>
            <button
              onClick={handleLike}
              className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:brightness-110 active:scale-95 text-slate-950 font-bold rounded-lg text-[10px] transition cursor-pointer"
            >
              {t("profile_endorse_btn")}
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs uppercase font-extrabold text-indigo-500 dark:text-indigo-400 tracking-widest">
              {t("profile_summary_title")}
            </h3>
            {isAdmin && (
              <button
                onClick={() => setShowSummaryModal(true)}
                className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-bold rounded text-[10px] transition cursor-pointer"
              >
                {t("profile_edit_summary")}
              </button>
            )}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
            {dbSummary || t("profile_summary_text")}
          </p>
        </Card>

        {/* Action CTA Panel */}
        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => router.push("/skills")}
            className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-slate-900 font-extrabold rounded-xl shadow-lg active:scale-98 transition cursor-pointer text-xs"
          >
            {t("profile_cta_skills")}
          </button>
          <button
            onClick={() => router.push("/guestbook")}
            className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-880 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl active:scale-98 transition cursor-pointer text-xs"
          >
            {t("profile_cta_guestbook")}
          </button>
        </div>
      </div>

      {/* Right Column (Span 5/12): Work History Timeline & Education */}
      <div className="md:col-span-5 space-y-6">
        {/* Experience Timeline Card */}
        <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-extrabold text-violet-500 dark:text-violet-400 tracking-widest">
              {t("timeline_title")}
            </h3>
            {isAdmin && (
              <button
                onClick={() => setShowExpModal(true)}
                className="px-2.5 py-1 bg-violet-500 hover:bg-violet-600 text-slate-950 font-bold rounded text-[10px] transition cursor-pointer"
              >
                {t("profile_add_exp")}
              </button>
            )}
          </div>
          
          <div className="space-y-8 border-l-2 border-slate-200 dark:border-slate-800 pl-6 ml-1 py-1">
            {currentExperiences.map((exp, idx) => (
              <div key={exp.id} className="relative">
                <div className={`absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full ${idx === 0 ? "bg-sky-500" : "bg-violet-500"}`}></div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">
                  {exp.role} <span className="text-slate-500 dark:text-slate-500 font-normal text-xs block sm:inline">| {exp.company}</span>
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono mb-3">{exp.duration}</p>
                <ul className="list-disc list-inside text-xs text-slate-650 dark:text-slate-300 space-y-2 leading-relaxed font-medium">
                  {exp.description.split("\n").filter(line => line.trim()).map((line, lineIdx) => (
                    <li key={lineIdx}>{line.replace(/^-\s*/, "")}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education Card */}
        <Card className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl">
          <h3 className="text-xs uppercase font-extrabold text-emerald-500 dark:text-emerald-400 tracking-widest mb-4">
            {t("education_title")}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">{t("education_degree_1")}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">{t("education_inst_1")}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-900">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">{t("education_degree_2")}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">{t("education_inst_2")}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Editing Modal (Admin Only) */}
      <AnimatePresence>
        {showSummaryModal && (
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
                onClick={() => setShowSummaryModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
              <h3 className="text-sm font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                {t("profile_modal_summary_title")}
              </h3>
              <form onSubmit={handleSaveSummary} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">{t("profile_label_summary")}</label>
                  <textarea
                    rows={8}
                    value={newSummaryText}
                    onChange={(e) => setNewSummaryText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 transition duration-300 resize-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSummaryModal(false)}
                    className="px-6 py-2.5 bg-slate-150 dark:bg-slate-850 hover:brightness-110 text-slate-900 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-indigo-500 hover:brightness-110 text-slate-950 font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : t("profile_save_btn")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Experience Addition Modal (Admin Only) */}
      <AnimatePresence>
        {showExpModal && (
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
                onClick={() => setShowExpModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
              <h3 className="text-sm font-extrabold text-violet-500 dark:text-violet-400 uppercase tracking-wider">
                {t("profile_modal_exp_title")}
              </h3>
              <form onSubmit={handleAddExperience} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">{t("profile_label_company")}</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500 transition duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">{t("profile_label_role")}</label>
                    <input
                      type="text"
                      placeholder="e.g. Backend Developer"
                      value={expRole}
                      onChange={(e) => setExpRole(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500 transition duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">{t("profile_label_duration")}</label>
                  <input
                    type="text"
                    placeholder="e.g. Oct 2021 – Jun 2022"
                    value={expDuration}
                    onChange={(e) => setExpDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500 transition duration-300"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">{t("profile_label_desc")}</label>
                  <textarea
                    rows={5}
                    placeholder="- Leveraged Next.js to increase load speeds by 40%&#10;- Optimized indexing for PostgreSQL tables"
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500 transition duration-300 resize-none font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExpModal(false)}
                    className="px-6 py-2.5 bg-slate-150 dark:bg-slate-850 hover:brightness-110 text-slate-900 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-violet-500 hover:brightness-110 text-slate-950 font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Adding..." : "Add Experience"}
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
