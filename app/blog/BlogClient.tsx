"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { useLanguage } from "@/context/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { createBlogPost, deleteBlogPost } from "./actions";
import { toast } from "sonner";

export interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
}

interface BlogClientProps {
  initialPosts: BlogPost[];
}

export function BlogClient({ initialPosts }: BlogClientProps) {
  const { t } = useLanguage();
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user && (session.user as any).role === "admin";

  const [blogSearch, setBlogSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Add Article Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [readTime, setReadTime] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const filteredPosts = initialPosts.filter(post =>
    post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(blogSearch.toLowerCase()) ||
    post.category.toLowerCase().includes(blogSearch.toLowerCase())
  );

  // Handle publishing a new post
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !readTime || !excerpt || !content) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsPublishing(true);
    const res = await createBlogPost({ title, category, readTime, excerpt, content });
    setIsPublishing(false);

    if (res.ok) {
      toast.success(t("blog_success_toast") === "blog_success_toast" ? "Artikel publicerad framgångsrikt!" : t("blog_success_toast"));
      setTitle("");
      setCategory("");
      setReadTime("");
      setExcerpt("");
      setContent("");
      setShowAddModal(false);
    } else {
      toast.error(res.error || "Failed to publish article.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-5xl text-left py-6 space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t("blog_journal_title")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            {t("blog_journal_subtitle")}
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder={t("blog_search_placeholder")}
            value={blogSearch}
            onChange={(e) => setBlogSearch(e.target.value)}
            className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 transition duration-300"
          />
          
          {/* Add Article Button (Visible to admins only) */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
            >
              {t("blog_add_article_btn")}
            </button>
          )}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="border-slate-200 hover:border-emerald-500/40 hover:shadow-emerald-500/5 transition-all duration-300 bg-white dark:bg-slate-950/60 p-8 rounded-2xl cursor-pointer flex flex-col justify-between min-h-64"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span>{post.category}</span>
                <span className="text-slate-400 font-mono">{post.readTime}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-500 transition">
                {post.title}
              </h3>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
                {post.excerpt}
              </p>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-900/60 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-3">
                <span>{post.date}</span>
                {isAdmin && typeof post.id === "number" && (
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm("Delete this blog post?")) {
                        const res = await deleteBlogPost(post.id);
                        if (res.ok) {
                          toast.success("Blog article deleted successfully!");
                          window.location.reload();
                        } else {
                          toast.error(res.error || "Failed to delete.");
                        }
                      }
                    }}
                    className="text-red-500 hover:text-red-600 font-bold cursor-pointer transition"
                    title="Delete blog post"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
              <span className="text-emerald-500 font-bold hover:underline">{t("blog_read_article")}</span>
            </div>
          </Card>
        ))}
        {filteredPosts.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 font-bold text-sm">
            {t("blog_no_articles", { search: blogSearch })}
          </div>
        )}
      </div>

      {/* Modal Overlay for Full Post */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 md:p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 space-y-6 text-left shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <span>{selectedPost.category}</span>
                  <span>•</span>
                  <span className="text-slate-400 font-mono">{selectedPost.readTime}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {selectedPost.title}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{selectedPost.date}</p>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-medium space-y-4 whitespace-pre-line border-t border-slate-100 dark:border-slate-800/80 pt-6">
                {selectedPost.content}
              </div>
              <div className="pt-6 flex justify-end">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {t("blog_close_btn")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Overlay for Writing New Article (Admin Only) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 md:p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-8 space-y-6 text-left shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
              
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {t("blog_add_modal_title")}
                </h3>
              </div>

              <form onSubmit={handlePublish} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">{t("blog_label_title")}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. My Next.js Journey"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 transition duration-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">{t("blog_label_category")}</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Frontend"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 transition duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">{t("blog_label_readtime")}</label>
                    <input
                      type="text"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="e.g. 5 min read"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 transition duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">{t("blog_label_excerpt")}</label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short introduction..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 transition duration-300"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">{t("blog_label_content")}</label>
                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Full article content (minimum 20 characters)..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 transition duration-300 resize-none"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {isPublishing ? t("blog_submitting") : t("blog_submit_btn")}
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
