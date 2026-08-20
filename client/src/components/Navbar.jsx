import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Share2, BookOpen, Info, Mail, Menu, X, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'User Guide', path: '/#user-guide' },
        { name: 'Blog & Tips', path: '/blog' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <header className="sticky top-0 z-50 glass border-b border-white/10 dark:border-slate-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                            <Share2 className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                ClipSync
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1">
                                by FrankBase
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive(link.path)
                                        ? 'text-primary bg-primary/10 dark:bg-primary/20 font-semibold'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Action Items: Theme Toggle & Quick CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                        </button>
                        <Link
                            to="/#create-room"
                            className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95 shadow-md shadow-primary/25 transition-all"
                        >
                            Create Room
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-base font-medium ${
                                isActive(link.path)
                                    ? 'text-primary bg-primary/10 font-semibold'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-2">
                        <Link
                            to="/#create-room"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block w-full text-center px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow"
                        >
                            Create Live Room
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
