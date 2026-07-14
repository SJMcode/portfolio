"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "sv" | "en";

interface TranslationDictionary {
  [key: string]: {
    sv: string;
    en: string;
  };
}

const DICTIONARY: TranslationDictionary = {
  // Navigation Tabs
  nav_profile: { sv: "Profil", en: "Profile" },
  nav_skills: { sv: "Färdigheter & Case", en: "Skills & Cases" },
  nav_guestbook: { sv: "Gästbok", en: "Guestbook" },
  nav_blog: { sv: "Blogg", en: "Blog" },

  // Footer & Layout
  role_subtitle: { sv: "Fullstack- & Backend-utvecklare", en: "Full-Stack & Backend Developer" },
  footer_rights: { sv: "© 2026 Safir Jameel Manghat. Alla rättigheter förbehållna.", en: "© 2026 Safir Jameel Manghat. All rights reserved." },
  footer_location: { sv: "Stockholm, Sverige", en: "Stockholm, SE" },

  // Profile Page (Home)
  profile_title: { sv: "Safir Jameel Manghat", en: "Safir Jameel Manghat" },
  profile_location: { sv: "📍 Stockholm, Sverige | safir.jameel@gmail.com", en: "📍 Stockholm, Sweden | safir.jameel@gmail.com" },
  profile_endorsements: { sv: "Rekommendationer", en: "Endorsements" },
  profile_endorse_btn: { sv: "👍 Rekommendera Safir", en: "👍 Endorse Safir" },
  profile_summary_title: { sv: "Professionell Sammanfattning", en: "Professional Summary" },
  profile_summary_text: {
    sv: "Målinriktad Fullstack- och Backend-utvecklare med 3+ års erfarenhet av att designa, bygga och skala webbapplikationer i produktionsmiljö. Specialiserad på PostgreSQL-databasoptimering, Next.js (App Router) och högpresterande systemarkitektur. Bevisad erfarenhet av att leverera änd-till-änd-system och minska databaslatens med 45%.",
    en: "Results-driven Full-Stack & Backend Developer with 3+ years of experience designing, building, and scaling production-grade web applications from scratch. Specialized in PostgreSQL database optimization, Next.js (App Router), and high-performance system architecture. Proven track record of delivering end-to-end systems and reducing database latency by 45%."
  },
  profile_cta_skills: { sv: "Utforska Färdigheter", en: "Explore Skills Index" },
  profile_cta_guestbook: { sv: "Skriv i Gästboken", en: "Sign Safir's Guestbook" },

  // Profile Page Timeline (Experience)
  timeline_title: { sv: "Arbetserfarenhet", en: "Professional Experience" },
  timeline_role_1: { sv: "Mjukvaruutvecklare", en: "Software Developer" },
  timeline_role_2: { sv: "Backend-utvecklare", en: "Backend Developer" },
  timeline_loc_1: { sv: "Doha, Qatar", en: "Doha, Qatar" },
  timeline_loc_2: { sv: "Kochi, Indien", en: "Kochi, India" },
  timeline_desc_1_1: { sv: "Byggde React SPAs med hög prestanda och Spring Boot backends", en: "High-speed React SPAs + Spring Boot backends" },
  timeline_desc_1_2: { sv: "Uppnådde 30% prestandaförbättringar på frontenden", en: "30% frontend performance improvements" },
  timeline_desc_1_3: { sv: "Automatiserade Jenkins CI/CD på AWS EC2-servrar", en: "Automated Jenkins CI/CD on AWS EC2" },
  timeline_desc_2_1: { sv: "Utvecklade händelsestyrd arkitektur med Apache Kafka", en: "Event-driven Apache Kafka message queues" },
  timeline_desc_2_2: { sv: "Migrerade till Cloud Firestore (-45% sökfördröjning)", en: "Cloud Firestore migration (-45% query latency)" },
  timeline_desc_2_3: { sv: "Byggde säkra RESTful API-arkitekturer i Node.js", en: "Secure RESTful API node architectures" },

  // Profile Page Education
  education_title: { sv: "Utbildning", en: "Education" },
  education_degree_1: { sv: "Masterexamen i data- och systemvetenskap", en: "MSc, Computer and Systems Sciences" },
  education_degree_2: { sv: "Fullstack-utvecklare (Yrkesutbildning)", en: "Full Stack Development Course" },
  education_inst_1: { sv: "Stockholms universitet, Sverige", en: "Stockholm University, Sweden" },
  education_inst_2: { sv: "Lexicon, Linköping (Pågående)", en: "Lexicon, Linköping (Ongoing)" },

  // Skills & Cases Page
  skills_time: { sv: "📍 Stockholms tid", en: "📍 Stockholm Time" },
  skills_finder_title: { sv: "Sök Kompetenser (useMemo)", en: "Dynamic Competencies Finder (useMemo)" },
  skills_placeholder: { sv: "Skriv för att filtrera (t.ex. Postgres, Next, React)...", en: "Type to filter skills (e.g. Postgres, Next, React)..." },
  skills_no_results: { sv: "Hittade inga matchande färdigheter.", en: "No matching skills found." },
  skills_verification_title: { sv: "Verifieringsstack", en: "Verification Stack" },
  skills_verification_text: {
    sv: "Denna portfolio använder ett relationellt PostgreSQL-schema som hanteras via Prisma ORM. När du rekommenderar profilen synkroniseras statusen säkert. När du loggar in på Gästbok-fliken krypteras din session säkert via Better-Auth med hjälp av OAuth-protokoll.",
    en: "This portfolio leverages a relational PostgreSQL schema managed via Prisma ORM. When you endorse the profile, it syncs state safely. When you log in on the Guestbook tab, your session is securely encrypted via Better-Auth using OAuth protocols."
  },
  skills_case_title: { sv: "Utvalt Case", en: "Featured Case Study" },
  skills_academic_title: { sv: "Akademisk Forskning", en: "Academic Research" },
  skills_case_1_title: { sv: "Fullstack E-Handel & Filmportal", en: "Full-Stack E-Commerce & Movie Portal" },
  skills_case_1_desc_1: { sv: "Strukturerad Next.js App Router som separerar serverrendering.", en: "Structured Next.js App Router separating server-rendering." },
  skills_case_1_desc_2: { sv: "Optimerad PostgreSQL-databasåtkomst med Prisma ORM.", en: "Optimized PostgreSQL database access using Prisma ORM." },
  skills_case_1_desc_3: { sv: "Stripe Checkout transaktionsflöden (prisma.$transaction).", en: "Stripe Checkout transaction workflows (prisma.$transaction)." },
  skills_case_2_title: { sv: "ML-uppgiftsavlastning i Industriell IoT", en: "ML Task Offloading in Industrial IoT" },
  skills_case_2_desc_1: { sv: "Designade Edge-Cloud resursbalansering med hjälp av molnbaserade beräkningar.", en: "Designed Edge-Cloud resource balancing configurations using cloud computing." },
  skills_case_2_desc_2: { sv: "Byggde optimeringsmodeller för industriella IoT-sensorer.", en: "Built optimization models for industrial IoT sensor tasks." },
  skills_click_visit: { sv: "Klicka på kortet för att besöka ↗", en: "Click card to visit ↗" },
  skills_click_details: { sv: "Klicka på kortet för att läsa detaljer ↗", en: "Click card to view details ↗" },

  // Guestbook Page
  guestbook_subtitle: {
    sv: "Lämna feedback, en rekommendation eller bara en hälsning. Du kan skriva anonymt, eller logga in med Better-Auth för att lämna en verifierad signatur med din profilbild!",
    en: "Leave an endorsement, feedback, or a friendly hello. You can sign anonymously, or log in with Better-Auth to leave a verified signature containing your account badge!"
  },
  guestbook_sign_as: { sv: "Signera som {name} ✍️", en: "Sign as {name} ✍️" },
  guestbook_write_msg: { sv: "Skriv ett meddelande", en: "Leave a Message" },
  guestbook_placeholder_name: { sv: "Ange ditt namn (t.ex. Johan Svensson)", en: "Enter name (e.g. John Doe)" },
  guestbook_label_name: { sv: "Ditt namn", en: "Your Name" },
  guestbook_label_msg: { sv: "Ditt meddelande", en: "Your message" },
  guestbook_placeholder_msg: { sv: "Skriv meddelande (minst 5 tecken)...", en: "Write message (minimum 5 characters)..." },
  guestbook_submit_btn: { sv: "Signera Gästboken", en: "Sign Guestbook" },
  guestbook_submitting: { sv: "Skickar...", en: "Submitting..." },
  guestbook_verified_recruiter: { sv: "Verifierad Rekryterare", en: "Verified Recruiter" },
  guestbook_sign_out: { sv: "Logga ut", en: "Sign Out" },
  guestbook_auth_console: { sv: "Better Auth Panel", en: "Better Auth Console" },
  guestbook_auth_login: { sv: "Logga in", en: "Log In" },
  guestbook_auth_signup: { sv: "Registrera", en: "Sign Up" },
  guestbook_label_fullname: { sv: "Fullständigt Namn", en: "Full Name" },
  guestbook_label_email: { sv: "E-postadress", en: "Email Address" },
  guestbook_label_password: { sv: "Lösenord", en: "Password" },
  guestbook_placeholder_password: { sv: "Minst 6 tecken", en: "Minimum 6 characters" },
  guestbook_register_btn: { sv: "Registrera Rekryterare", en: "Register Recruiter" },
  guestbook_checking_session: { sv: "Kontrollerar session...", en: "Checking auth session..." },
  guestbook_board_title: { sv: "Rekommendationer i Gästboken ({count})", en: "Recruiter Endorsements Board ({count})" },
  guestbook_no_signatures: { sv: "Inga signaturer än. Bli den första att skriva!", en: "No signatures yet. Be the first to sign!" },
  guestbook_verified_badge: { sv: "Verifierad", en: "Verified" },

  // Blog Page
  blog_journal_title: { sv: "Safirs Teknikjournal", en: "Safir's Tech Journal" },
  blog_journal_subtitle: {
    sv: "Insikter om fullstack-utveckling, databasoptimering och akademisk forskning",
    en: "Insights on fullstack engineering, database tuning, and academic research"
  },
  blog_search_placeholder: { sv: "Sök artiklar...", en: "Search articles..." },
  blog_read_article: { sv: "Läs artikel ↗", en: "Read Article ↗" },
  blog_close_btn: { sv: "Stäng artikel", en: "Close Article" },
  blog_no_articles: { sv: "Hittade inga artiklar som matchar \"{search}\"", en: "No articles found matching \"{search}\"" },
  blog_add_article_btn: { sv: "📝 Skriv artikel", en: "📝 Write Article" },
  blog_add_modal_title: { sv: "Skapa ny artikel", en: "Create New Article" },
  blog_label_title: { sv: "Titel", en: "Title" },
  blog_label_category: { sv: "Kategori", en: "Category" },
  blog_label_readtime: { sv: "Lästid (t.ex. 5 min read)", en: "Read Time (e.g. 5 min read)" },
  blog_label_excerpt: { sv: "Kort sammanfattning", en: "Short Excerpt" },
  blog_label_content: { sv: "Innehåll", en: "Content" },
  blog_submit_btn: { sv: "Publicera artikel", en: "Publish Article" },
  blog_submitting: { sv: "Publicerar...", en: "Publishing..." },
  guestbook_github_btn: { sv: "Logga in med GitHub", en: "Sign In with GitHub" },
  guestbook_or_divider: { sv: "eller", en: "or" },
  guestbook_auth_prompt: { sv: "Logga in för att lämna en verifierad signatur med din rekryterar-badge.", en: "Log in to leave a verified signature containing your recruiter badge." },
  profile_edit_summary: { sv: "✏️ Redigera bio", en: "✏️ Edit Summary" },
  profile_add_exp: { sv: "➕ Lägg till erfarenhet", en: "➕ Add Experience" },
  profile_modal_summary_title: { sv: "Redigera din bio", en: "Edit your summary description" },
  profile_modal_exp_title: { sv: "Lägg till ny arbetserfarenhet", en: "Add new work experience" },
  profile_label_summary: { sv: "Sammanfattning", en: "Summary text" },
  profile_label_company: { sv: "Företagsnamn", en: "Company Name" },
  profile_label_role: { sv: "Roll / Befattning", en: "Role / Title" },
  profile_label_duration: { sv: "Period (t.ex. Okt 2021 – Jun 2022)", en: "Duration (e.g. Oct 2021 – Jun 2022)" },
  profile_label_desc: { sv: "Beskrivning (en punkt per rad)", en: "Description (one bullet point per line)" },
  profile_save_btn: { sv: "Spara ändringar", en: "Save Changes" },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to Swedish ("sv")
  const [language, setLanguageState] = useState<Language>("sv");

  // Load language settings on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("preferredLanguage") as Language;
      if (savedLang === "sv" || savedLang === "en") {
        setLanguageState(savedLang);
      }
    } catch (e) {
      console.warn("Could not read language from localStorage", e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("preferredLanguage", lang);
    } catch (e) {
      console.warn("Could not save language to localStorage", e);
    }
  };

  // Translation helper
  const t = (key: string, variables?: { [key: string]: string | number }): string => {
    const entry = DICTIONARY[key];
    if (!entry) return key;

    let text = entry[language] || entry["en"] || key;

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
