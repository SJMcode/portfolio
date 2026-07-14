"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { authClient } from "@/lib/auth-client";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { data: session } = authClient.useSession();
  
  // Initialize state with a default to avoid server-side hydration mismatches
  const [darkMode, setDarkMode] = useState(true);

  // Load user settings on mount (runs only on the browser)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("darkModeKey");
      if (savedTheme !== null) {
        setDarkMode(JSON.parse(savedTheme));
      }
    } catch (e) {
      console.warn("Could not read localStorage", e);
    }
  }, []);

  // Update theme setting
  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem("darkModeKey", JSON.stringify(nextMode));
  };

  // Sign out user session
  const handleSignOut = async () => {
    await authClient.signOut();
    toast.info(t("guestbook_logout_info", { default: "Logged out successfully." }) === "guestbook_logout_info" ? "Utloggad framgångsrikt." : t("guestbook_logout_info"));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-start py-10 px-6 sm:px-12 md:px-16 lg:px-24 ${
      darkMode ? "dark bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Sonner Toast alerts */}
      <Toaster position="top-right" richColors />

      {/* Header and Branding - Stretched container */}
      <div className="w-full max-w-5xl text-left mt-4 mb-2">
        <Link href="/" className="hover:no-underline">
          <h1
            className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent cursor-pointer select-none inline-block animate-pulse"
            style={{ animationDuration: '4s' }}
          >
            {t("profile_title")}
          </h1>
        </Link>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mt-1">
          {t("role_subtitle")}
        </p>
      </div>

      {/* Navigation Header Tabs + Language / Dark Mode Toggle */}
      <div className="flex items-center justify-between mt-10 mb-12 border-b border-slate-200 dark:border-slate-800 w-full max-w-5xl pb-2">
        <nav className="flex gap-8">
          {[
            { name: t("nav_profile"), path: "/" },
            { name: t("nav_skills"), path: "/skills" },
            { name: t("nav_guestbook"), path: "/guestbook" },
            { name: t("nav_blog"), path: "/blog" }
          ].map((tab) => {
            const isActive = pathname === tab.path;
            let activeColor = "text-sky-500 border-sky-500";
            if (pathname === "/skills") activeColor = "text-indigo-500 border-indigo-500";
            if (pathname === "/guestbook") activeColor = "text-violet-500 border-violet-500";
            if (pathname === "/blog") activeColor = "text-emerald-500 border-emerald-500";

            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`text-sm font-semibold tracking-wide pb-1 transition duration-200 hover:no-underline ${
                  isActive
                    ? `${activeColor} border-b-2`
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>

        {/* Custom Language, Theme and Auth Toggles */}
        <div className="flex items-center gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={() => setLanguage(language === "sv" ? "en" : "sv")}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
            title="Ändra språk / Change language"
          >
            {language === "sv" ? "🇸🇪 SV" : "🇬🇧 EN"}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm transition duration-200 cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Sign In / Sign Out Button */}
          {session ? (
            <div className="flex items-center gap-3 border-l border-slate-300 dark:border-slate-800 pl-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-800 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer font-bold"
              >
                {t("guestbook_sign_out")}
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 font-bold rounded-lg text-xs hover:brightness-110 active:scale-95 transition hover:no-underline border border-transparent"
            >
              {t("guestbook_auth_login")}
            </Link>
          )}
        </div>
      </div>

      {/* Dynamic View Router Content */}
      <div className="flex-grow w-full max-w-5xl flex flex-col items-center justify-start">
        {children}
      </div>

      {/* Footer Section */}
      <footer className="w-full max-w-5xl mt-auto pt-8 pb-4 border-t border-slate-200 dark:border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-350">
            {t("footer_rights")}
          </p>
        </div>
        
        <div className="flex gap-4 font-semibold">
          <a
            href="https://linkedin.com/in/safir-jameel"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-500 dark:hover:text-indigo-400 transition"
          >
            LinkedIn
          </a>
          <span>•</span>
          <a
            href="https://github.com/sjmcode"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 dark:hover:text-pink-400 transition"
          >
            GitHub
          </a>
          <span>•</span>
          <span className="text-slate-400">{t("footer_location")}</span>
        </div>
      </footer>

      {/* Floating WhatsApp Chat Button */}
      <a
        href="https://wa.me/46707217399?text=Hej%20Safir!%20Jag%20bes%C3%B6kte%20din%20portfolio%20och%20skulle%20vilja%20komma%20i%20kontakt."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none"
        title="Chat with Safir on WhatsApp"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping group-hover:opacity-40"></span>
        <svg
          className="w-7 h-7 relative"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.806-9.8.001-2.617-1.01-5.079-2.846-6.917C16.398 2.05 13.93 1.04 11.314 1.04c-5.411 0-9.815 4.397-9.819 9.8-.001 1.562.43 3.09 1.258 4.471L1.81 21.162l6.082-1.593c-.015.008-.015.008 0 0zm11.45-6.643c-.3-.149-1.772-.875-2.046-.975-.276-.1-.476-.149-.675.15-.2.299-.772.975-.947 1.173-.174.198-.349.224-.649.075-.3-.15-1.264-.467-2.408-1.486-.89-.794-1.49-1.775-1.665-2.073-.175-.299-.019-.461.13-.609.135-.133.3-.349.45-.523.149-.174.199-.299.299-.498.1-.2.05-.374-.025-.524-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.507-.675-.516-.174-.008-.374-.01-.574-.01-.2 0-.526.075-.801.374-.275.299-1.05 1.026-1.05 2.502 0 1.478 1.074 2.906 1.223 3.105.15.199 2.113 3.227 5.12 4.524.714.308 1.272.493 1.706.63.717.228 1.368.196 1.883.119.574-.085 1.772-.724 2.022-1.42.25-.697.25-1.296.174-1.42-.075-.124-.275-.199-.575-.349z" />
        </svg>
      </a>
    </div>
  );
}
