"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Form States
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push("/guestbook");
    }
  }, [session, router]);

  // Handle registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsAuthLoading(true);
    const { error } = await authClient.signUp.email({
      email: authEmail,
      password: authPassword,
      name: authName,
    });
    setIsAuthLoading(false);

    if (error) {
      toast.error(error.message || "Registration failed.");
    } else {
      toast.success(t("guestbook_reg_success", { default: "Account created successfully!" }) === "guestbook_reg_success" ? "Konto skapat framgångsrikt!" : t("guestbook_reg_success"));
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthMode("login"); // toggle to login
    }
  };

  // Handle email login
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      toast.error("Please enter your email and password.");
      return;
    }

    setIsAuthLoading(true);
    const { error } = await authClient.signIn.email({
      email: authEmail,
      password: authPassword,
    });
    setIsAuthLoading(false);

    if (error) {
      const isInvalidCreds = error.message?.toLowerCase().includes("invalid") || error.status === 403 || error.status === 401;
      if (isInvalidCreds) {
        const errorMsg = language === "sv"
          ? "Detta konto verkar inte finnas eller så angavs fel uppgifter. Registrera dig först om du är ny!"
          : "This account doesn't seem to exist or invalid credentials. Please Sign Up first if you are new!";
        toast.error(errorMsg);
      } else {
        toast.error(error.message || "Sign in failed.");
      }
    } else {
      toast.success(t("guestbook_login_success", { default: "Logged in successfully!" }) === "guestbook_login_success" ? "Inloggad framgångsrikt!" : t("guestbook_login_success"));
      router.push("/guestbook");
    }
  };

  // Handle GitHub Social Login
  const handleGitHubLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: window.location.origin + "/guestbook",
      });
    } catch (e) {
      toast.error("Failed to redirect to GitHub OAuth.");
    }
  };

  if (sessionLoading) {
    return <div className="text-center py-20 text-xs text-slate-400 font-medium">{t("guestbook_checking_session")}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md mx-auto py-12 text-left"
    >
      <Card className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl">
        <CardHeader className="p-0 pb-6 flex flex-row justify-between items-center border-b border-slate-100 dark:border-slate-900/60">
          <CardTitle className="text-sm font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
            {t("guestbook_auth_console")}
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthEmail("");
                setAuthPassword("");
                setAuthName("");
              }}
              className={`text-[10px] font-bold px-2.5 py-1 rounded transition duration-200 ${
                authMode === "login"
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-200 cursor-pointer"
              }`}
            >
              {t("guestbook_auth_login")}
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setAuthEmail("");
                setAuthPassword("");
                setAuthName("");
              }}
              className={`text-[10px] font-bold px-2.5 py-1 rounded transition duration-200 ${
                authMode === "signup"
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-200 cursor-pointer"
              }`}
            >
              {t("guestbook_auth_signup")}
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          {authMode === "login" ? (
            <form onSubmit={handleSignIn} className="space-y-4" key="login-form">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">{t("guestbook_label_email")}</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="e.g. partner@company.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-955 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">{t("guestbook_label_password")}</label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder={t("guestbook_placeholder_password")}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-955 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 font-bold rounded-xl transition text-xs disabled:opacity-50 active:scale-98 hover:brightness-110 cursor-pointer"
              >
                {isAuthLoading ? t("guestbook_submitting") : t("guestbook_auth_login")}
              </button>

              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800/80"></div>
                </div>
                <span className="relative px-3 bg-white dark:bg-slate-950/40 text-[9px] uppercase font-bold text-slate-400">
                  {t("guestbook_or_divider")}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGitHubLogin}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-850 dark:border-slate-800"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                </svg>
                {t("guestbook_github_btn")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4" key="signup-form">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">{t("guestbook_label_fullname")}</label>
                <input
                  type="text"
                  name="fullname"
                  autoComplete="name"
                  placeholder="e.g. Jane Recruiter"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-955 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">{t("guestbook_label_email")}</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="e.g. partner@company.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-955 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">{t("guestbook_label_password")}</label>
                <input
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  placeholder={t("guestbook_placeholder_password")}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-955 dark:text-slate-100 outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 font-bold rounded-xl transition text-xs disabled:opacity-50 active:scale-98 hover:brightness-110 cursor-pointer"
              >
                {isAuthLoading ? t("guestbook_submitting") : t("guestbook_register_btn")}
              </button>

              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800/80"></div>
                </div>
                <span className="relative px-3 bg-white dark:bg-slate-950/40 text-[9px] uppercase font-bold text-slate-400">
                  {t("guestbook_or_divider")}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGitHubLogin}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-850 dark:border-slate-800"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                </svg>
                {t("guestbook_github_btn")}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
