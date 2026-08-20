import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BLOG_POSTS } from '../data/blogData';
import { BookOpen, Clock, Calendar, ArrowRight, Search, Tag, Sparkles } from 'lucide-react';

const BlogList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Productivity & Workflows', 'Tech Comparisons', 'Security & Privacy', 'Developer Workflows'];

    const filteredPosts = BLOG_POSTS.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />

            <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
                {/* Hero Header */}
                <div className="text-center space-y-3 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" /> ClipSync Knowledge Hub
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                        Articles, Guides & Productivity Tips
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        Learn how to master cross-device workflows, eliminate digital clutter, and maximize your productivity with real-time text synchronization.
                    </p>
                </div>

                {/* Search & Category Filter Bar */}
                <div className="theme-card rounded-2xl p-4 sm:p-6 mb-10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search articles, topics, or keywords..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary transition"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
                                    selectedCategory === cat
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Blog Grid */}
                {filteredPosts.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {filteredPosts.map((post) => (
                            <article
                                key={post.id}
                                className="theme-card rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                                            {post.category}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" /> {post.readTime}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" /> {post.publishDate}
                                            </span>
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug mb-3">
                                        <Link to={`/blog/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h2>

                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                                        {post.excerpt}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <Link
                                        to={`/blog/${post.slug}`}
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:underline"
                                    >
                                        Read Full Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 theme-card rounded-2xl">
                        <p className="text-slate-500 dark:text-slate-400 text-base">
                            No articles found matching "{searchTerm}". Try another keyword or filter.
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogList;
