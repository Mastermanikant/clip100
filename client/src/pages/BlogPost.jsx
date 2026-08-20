import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BLOG_POSTS } from '../data/blogData';
import { Clock, Calendar, ArrowLeft, Share2, Tag, ArrowRight, Zap, CheckCircle2, User } from 'lucide-react';
import toast from 'react-hot-toast';

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const post = BLOG_POSTS.find((p) => p.slug === slug);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
                    <p className="text-slate-500 mb-6">The article you are looking for does not exist or has been relocated.</p>
                    <Link to="/blog" className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium">
                        Back to All Articles
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const copyArticleLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Article link copied to clipboard!');
    };

    // Simple markdown-style rendering for paragraphs, headers, and tables
    const renderContent = (contentStr) => {
        const sections = contentStr.trim().split('\n\n');

        return sections.map((sec, idx) => {
            const trimmed = sec.trim();

            if (trimmed.startsWith('### ')) {
                return (
                    <h3 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
                        {trimmed.replace('### ', '')}
                    </h3>
                );
            }
            if (trimmed.startsWith('## ')) {
                return (
                    <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-10 mb-4">
                        {trimmed.replace('## ', '')}
                    </h2>
                );
            }
            if (trimmed.startsWith('---')) {
                return <hr key={idx} className="my-8 border-slate-200 dark:border-slate-800" />;
            }
            if (trimmed.startsWith('```')) {
                const codeContent = trimmed.replace(/```[a-z]*/g, '').trim();
                return (
                    <pre key={idx} className="my-6 p-4 sm:p-5 rounded-xl bg-slate-900 text-slate-100 text-xs sm:text-sm font-mono overflow-x-auto border border-slate-800">
                        <code>{codeContent}</code>
                    </pre>
                );
            }
            if (trimmed.startsWith('|')) {
                // Table
                const rows = trimmed.split('\n').filter(r => !r.includes(':---'));
                const headers = rows[0].split('|').filter(c => c.trim().length > 0).map(c => c.trim());
                const bodyRows = rows.slice(1);

                return (
                    <div key={idx} className="my-6 overflow-x-auto">
                        <table className="min-w-full text-xs sm:text-sm text-left border-collapse theme-card rounded-xl overflow-hidden">
                            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold">
                                <tr>
                                    {headers.map((h, hIdx) => (
                                        <th key={hIdx} className="p-3 border-b border-slate-200 dark:border-slate-700">
                                            {h.replace(/\*\*/g, '')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {bodyRows.map((row, rIdx) => {
                                    const cells = row.split('|').filter(c => c.trim().length > 0).map(c => c.trim());
                                    return (
                                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                            {cells.map((cell, cIdx) => (
                                                <td key={cIdx} className="p-3">
                                                    {cell.replace(/\*\*/g, '')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
                const lines = trimmed.split('\n');
                return (
                    <ul key={idx} className="my-4 space-y-2 text-sm sm:text-base leading-relaxed pl-5 list-disc text-slate-700 dark:text-slate-300">
                        {lines.map((l, lIdx) => (
                            <li key={lIdx}>
                                {l.replace(/^[-*]\s+|\d+\.\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                            </li>
                        ))}
                    </ul>
                );
            }

            return (
                <p key={idx} className="my-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
            );
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 w-full">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/blog')}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Knowledge Hub
                </button>

                {/* Article Header */}
                <header className="space-y-4 mb-8">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {post.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {post.publishDate}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                        {post.title}
                    </h1>

                    {/* Author & Share Bar */}
                    <div className="flex items-center justify-between py-4 border-y border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                MY
                            </div>
                            <div>
                                <span className="font-semibold text-slate-900 dark:text-white block">
                                    {post.author}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    Founder, FrankBase Ecosystem
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={copyArticleLink}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                    </div>
                </header>

                {/* Article Body */}
                <article className="theme-card rounded-2xl p-6 sm:p-10 shadow-sm mb-10">
                    {renderContent(post.content)}
                </article>

                {/* Embedded CTA */}
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/15 via-secondary/15 to-accent/15 border border-primary/20 text-center space-y-4 mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        Ready To Try Instant Text Sharing?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                        No login required. Create a temporary room in 1 second and sync your text between any phone, tablet, and PC.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-95 shadow-md shadow-primary/25 transition"
                    >
                        Launch ClipSync Tool <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPost;
