import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MessageSquare, Send, CheckCircle, HelpCircle, Shield, Bug, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.email || !formData.message) {
            toast.error('Please enter your email and message');
            return;
        }
        setSubmitted(true);
        toast.success('Your message has been received! Our support team will respond shortly.');
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                {/* Header */}
                <div className="text-center space-y-3 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                        <Mail className="w-3.5 h-3.5" /> Support & Grievance Desk
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Get In Touch With The ClipSync Team
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                        Have a feature request, spotted a bug, or need help integrating cross-device text sharing? We are here to help.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* Left Channels Column */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="theme-card rounded-2xl p-6 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                Direct Official Email
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 leading-relaxed">
                                For support, security inquiries, or feedback:
                            </p>
                            <a
                                href="mailto:support@frankbase.com"
                                className="text-sm font-semibold text-primary hover:underline break-all"
                            >
                                support@frankbase.com
                            </a>
                        </div>

                        <div className="theme-card rounded-2xl p-6 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                Founder & Executive Desk
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 leading-relaxed">
                                Strategic collaborations & ecosystem requests:
                            </p>
                            <a
                                href="mailto:connect@mastermanikant.com"
                                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline break-all"
                            >
                                connect@mastermanikant.com
                            </a>
                        </div>

                        <div className="theme-card rounded-2xl p-6 shadow-sm border-dashed">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                <Bug className="w-4 h-4 text-accent" /> Bug Bounty & Feedback
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Found an issue with real-time socket updates or QR code scanning on specific browser versions? Let us know with your browser name and device model.
                            </p>
                        </div>
                    </div>

                    {/* Right Form Column */}
                    <div className="md:col-span-2 theme-card rounded-2xl p-6 sm:p-8 shadow-sm">
                        {submitted ? (
                            <div className="py-12 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Thank You For Reaching Out!
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                    We have received your message. Our engineering and support team will review your query and respond via email within 24-48 business hours.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="px-6 py-2.5 text-sm font-medium rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                                >
                                    Send Another Note
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Send Us A Note
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Rahul Sharma"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@domain.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Category / Topic
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary transition"
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Bug Report">Bug Report</option>
                                        <option value="Feature Request">Feature Request</option>
                                        <option value="Privacy / Security Inquiry">Privacy / Security Inquiry</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Your Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        rows={5}
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Describe your query, suggestion, or reproduction steps..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-primary transition"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 px-6 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-95 shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition"
                                >
                                    <Send className="w-4 h-4" /> Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
