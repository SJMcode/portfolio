"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { authClient } from "@/lib/auth-client";
import { addMessage, deleteGuestbookEntry } from "./actions";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export interface GuestbookEntry {
  id: number;
  name: string;
  text: string;
  createdAt: string;
  userImage?: string | null;
  replies?: GuestbookEntry[];
}

interface GuestbookClientProps {
  initialMessages: GuestbookEntry[];
}

export function GuestbookClient({ initialMessages }: GuestbookClientProps) {
  const { t } = useLanguage();
  
  // Session Hooks from Better-Auth Client library
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const isAdmin = session?.user && (session.user as any).role === "admin";

  // Form States
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply States
  const [activeReplyToId, setActiveReplyToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Handle message submission
  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = session ? session.user.name : name.trim();
    
    if (!finalName) {
      toast.error(t("guestbook_error_name", { default: "Please enter your name or log in." }) === "guestbook_error_name" ? "Vänligen fyll i ditt namn eller logga in." : t("guestbook_error_name"));
      return;
    }
    if (!text.trim()) {
      toast.error(t("guestbook_error_msg", { default: "Please enter a message." }) === "guestbook_error_msg" ? "Vänligen fyll i ett meddelande." : t("guestbook_error_msg"));
      return;
    }

    setIsSubmitting(true);
    const res = await addMessage({ name: finalName, text: text.trim() });
    setIsSubmitting(false);

    if (res.ok) {
      toast.success(t("guestbook_success", { default: "Guestbook signed successfully!" }) === "guestbook_success" ? "Gästboken har signerats!" : t("guestbook_success"));
      setName("");
      setText("");
    } else {
      toast.error(res.error || "Failed to submit message.");
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!session) {
      toast.error(t("guestbook_reply_auth_prompt", { default: "Log in to reply" }) === "guestbook_reply_auth_prompt" ? "Logga in för att svara." : t("guestbook_reply_auth_prompt"));
      return;
    }
    if (!replyText.trim()) {
      toast.error(t("guestbook_error_msg", { default: "Please enter a message." }) === "guestbook_error_msg" ? "Vänligen fyll i ett meddelande." : t("guestbook_error_msg"));
      return;
    }

    setIsSubmittingReply(true);
    const res = await addMessage({
      name: session.user.name,
      text: replyText.trim(),
      parentId
    });
    setIsSubmittingReply(false);

    if (res.ok) {
      toast.success(t("guestbook_success", { default: "Reply submitted successfully!" }) === "guestbook_success" ? "Gästboken har signerats!" : "Svaret skickades!");
      setReplyText("");
      setActiveReplyToId(null);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to submit reply.");
    }
  };

  // Handle logout
  const handleSignOut = async () => {
    await authClient.signOut();
    toast.info(t("guestbook_logout_info", { default: "Logged out successfully." }) === "guestbook_logout_info" ? "Utloggad framgångsrikt." : t("guestbook_logout_info"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start text-left py-6"
    >
      {/* Left Column: Sign Form & Better Auth Dialog (Span 6/12) */}
      <div className="md:col-span-6 space-y-8">
        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold text-violet-500 dark:text-violet-400 tracking-widest block">
            {t("nav_guestbook")}
          </span>
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-medium">
            {t("guestbook_subtitle")}
          </p>
        </div>

        {/* Dynamic Signature Form */}
        <Card className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {session ? t("guestbook_sign_as", { name: session.user.name }) : t("guestbook_write_msg")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <form onSubmit={handleSubmitMessage} className="space-y-4">
              {!session && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">{t("guestbook_label_name")}</label>
                  <input
                    type="text"
                    placeholder={t("guestbook_placeholder_name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500 transition duration-300"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">{t("guestbook_label_msg")}</label>
                <textarea
                  rows={4}
                  placeholder={t("guestbook_placeholder_msg")}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500 transition duration-300 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-slate-950 font-bold rounded-xl active:scale-98 hover:brightness-110 transition cursor-pointer text-xs disabled:opacity-50"
              >
                {isSubmitting ? t("guestbook_submitting") : t("guestbook_submit_btn")}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Better Auth Section */}
        {sessionLoading ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">{t("guestbook_checking_session")}</div>
        ) : session ? (
          /* User is Logged In - Show User Profile Card */
          <Card className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 uppercase text-sm">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  session.user.name.charAt(0)
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  {session.user.name} <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold ml-2">{t("guestbook_verified_recruiter")}</span>
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="py-1.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {t("guestbook_sign_out")}
            </button>
          </Card>
        ) : (
          /* User is Logged Out - Show CTA to Auth Page */
          <Card className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center space-y-4 shadow-sm">
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">
              {t("guestbook_auth_prompt")}
            </p>
            <div className="pt-2">
              <Link
                href="/auth"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 active:scale-95 transition hover:no-underline"
              >
                {t("guestbook_auth_login")}
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Right Column: Signature Board List (Span 6/12) */}
      <div className="md:col-span-6 space-y-6">
        <h3 className="text-xs uppercase font-extrabold text-violet-500 dark:text-violet-400 tracking-widest">
          {t("guestbook_board_title", { count: initialMessages.length })}
        </h3>

        <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2">
          <AnimatePresence initial={false}>
            {initialMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-6 rounded-xl space-y-3"
              >
                <div className="flex justify-between items-center gap-2 w-full">
                  <div className="flex items-center gap-3">
                    {/* User Profile Avatar if exists */}
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-800">
                      {msg.userImage ? (
                        <img src={msg.userImage} alt={msg.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        msg.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                        {msg.name}
                        {msg.userImage && (
                          <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold ml-2">{t("guestbook_verified_badge")}</span>
                        )}
                      </h4>
                      <p className="text-[8px] text-slate-400 font-mono mt-0.5">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        if (confirm("Delete this signature?")) {
                          const res = await deleteGuestbookEntry(msg.id);
                          if (res.ok) {
                            toast.success("Signature deleted successfully!");
                            window.location.reload();
                          } else {
                            toast.error(res.error || "Failed to delete.");
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-600 font-bold text-xs cursor-pointer p-1"
                      title="Delete signature"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
                  {msg.text}
                </p>

                {/* Nested Replies List */}
                {msg.replies && msg.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l border-slate-200 dark:border-slate-800 space-y-4">
                    {msg.replies.map((reply) => (
                      <div key={reply.id} className="space-y-1">
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-[9px] text-slate-500 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-800 shrink-0">
                              {reply.userImage ? (
                                <img src={reply.userImage} alt={reply.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                reply.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <h5 className="text-[10px] font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1">
                                {reply.name}
                                {reply.userImage && (
                                  <span className="text-[7px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 px-1 py-0.2 rounded-full font-bold ml-1">{t("guestbook_verified_badge")}</span>
                                )}
                              </h5>
                              <p className="text-[7px] text-slate-400 font-mono">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={async () => {
                                if (confirm("Delete this reply?")) {
                                  const res = await deleteGuestbookEntry(reply.id);
                                  if (res.ok) {
                                    toast.success("Reply deleted successfully!");
                                    window.location.reload();
                                  } else {
                                    toast.error(res.error || "Failed to delete.");
                                  }
                                }
                              }}
                              className="text-red-500 hover:text-red-600 font-bold text-[9px] cursor-pointer p-0.5 shrink-0"
                              title="Delete reply"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium pl-8">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Action / Form (Option B: Requires session to display active input form) */}
                <div className="pt-1.5 flex flex-col gap-2">
                  {activeReplyToId !== msg.id ? (
                    <button
                      onClick={() => {
                        if (!session) {
                          toast.error(t("guestbook_reply_auth_prompt", { default: "Log in to reply" }) === "guestbook_reply_auth_prompt" ? "Logga in för att svara." : t("guestbook_reply_auth_prompt"));
                          return;
                        }
                        setActiveReplyToId(msg.id);
                        setReplyText("");
                      }}
                      className="text-[10px] self-start text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 font-bold cursor-pointer transition"
                    >
                      {t("guestbook_reply_btn", { default: "Reply" }) === "guestbook_reply_btn" ? "Svara" : t("guestbook_reply_btn")}
                    </button>
                  ) : (
                    session && (
                      <div className="w-full mt-1.5 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
                        <form onSubmit={(e) => handleSubmitReply(e, msg.id)} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-400">
                              {t("guestbook_sign_as", { name: session.user.name })}
                            </label>
                            <textarea
                              rows={2}
                              placeholder={t("guestbook_reply_placeholder", { default: "Write a reply..." }) === "guestbook_reply_placeholder" ? "Skriv ett svar..." : t("guestbook_reply_placeholder")}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500 transition duration-300 resize-none"
                              required
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setActiveReplyToId(null)}
                              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-850 dark:text-slate-200 cursor-pointer"
                            >
                              {t("guestbook_cancel", { default: "Cancel" }) === "guestbook_cancel" ? "Avbryt" : t("guestbook_cancel")}
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingReply}
                              className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-slate-950 font-bold rounded-lg hover:brightness-110 transition cursor-pointer text-[10px] disabled:opacity-50"
                            >
                              {isSubmittingReply ? t("guestbook_submitting") : (t("guestbook_reply_submit", { default: "Submit Reply" }) === "guestbook_reply_submit" ? "Skicka svar" : t("guestbook_reply_submit"))}
                            </button>
                          </div>
                        </form>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {initialMessages.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">
              {t("guestbook_no_signatures")}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
