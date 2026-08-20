import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Shield, Heart, ExternalLink, Mail, ArrowUpRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand Column */}
                    <div className="md:col-span-1 space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-sm">
                                <Share2 className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-lg text-slate-900 dark:text-white">
                                ClipSync
                            </span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Instant, zero-login, ephemeral real-time clipboard sharing across mobile, tablet, and PC.
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                            <Shield className="w-3 h-3" /> Zero Data Retention
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
                            Platform
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="hover:text-primary dark:hover:text-white transition">
                                    Instant Room Creation
                                </Link>
                            </li>
                            <li>
                                <Link to="/#user-guide" className="hover:text-primary dark:hover:text-white transition">
                                    Step-by-Step User Guide
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="hover:text-primary dark:hover:text-white transition">
                                    Blog & Knowledge Hub
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-primary dark:hover:text-white transition">
                                    About ClipSync
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Suite */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
                            Privacy & Trust
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/privacy" className="hover:text-primary dark:hover:text-white transition">
                                    Privacy Policy (Zero Log)
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-primary dark:hover:text-white transition">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-primary dark:hover:text-white transition">
                                    Contact & Support Desk
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="/llms.txt"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 hover:text-primary dark:hover:text-white transition"
                                >
                                    AI Manifest (llms.txt) <ArrowUpRight className="w-3 h-3" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Ecosystem & Founder */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
                            FrankBase Ecosystem
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://frankbase.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 hover:text-primary dark:hover:text-white transition"
                                >
                                    FrankBase Hub <ArrowUpRight className="w-3 h-3 text-slate-400" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://mastermanikant.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 hover:text-primary dark:hover:text-white transition"
                                >
                                    Master Manikant Yadav <ArrowUpRight className="w-3 h-3 text-slate-400" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:support@frankbase.com"
                                    className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline mt-1"
                                >
                                    <Mail className="w-3.5 h-3.5" /> support@frankbase.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <p className="text-slate-500 dark:text-slate-500 text-center sm:text-left">
                        © {new Date().getFullYear()} ClipSync (clipboard.frankbase.com). Part of the FrankBase Digital Ecosystem. Founded by{' '}
                        <strong className="text-slate-700 dark:text-slate-300 font-semibold">Master Manikant Yadav</strong>.
                    </p>
                    <div className="flex items-center gap-4 text-slate-500">
                        <span>All text streams are RAM-only & encrypted in transit.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
