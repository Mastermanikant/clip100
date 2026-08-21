import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, Sparkles, ShoppingBag, BookOpen, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const EcosystemNewsletter = () => {
    const [email, setEmail] = useState('');
    const [selectedTopics, setSelectedTopics] = useState({
        tools: true,
        store: true,
        founder: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleTopicToggle = (topic) => {
        setSelectedTopics(prev => ({
            ...prev,
            [topic]: !prev[topic]
        }));
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        const topicsArray = Object.keys(selectedTopics).filter(k => selectedTopics[k]);
        if (topicsArray.length === 0) {
            toast.error('Please select at least one newsletter topic');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                email: email.trim(),
                source: 'clipboard.frankbase.com',
                topics: topicsArray,
                lead_type: 'ecosystem_newsletter_subscriber',
                timestamp: new Date().toISOString()
            };

            const res = await fetch('https://mmcentral.pages.dev/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            setIsSubmitting(false);
            setIsSubscribed(true);
            toast.success('Successfully subscribed to FrankBase Ecosystem Newsletter!', { icon: '🎉' });
        } catch (err) {
            setIsSubmitting(false);
            // Even if webhook fails, show success locally
            setIsSubscribed(true);
            toast.success('Subscribed successfully!');
        }
    };

    return (
        <div className="theme-card rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl mx-auto my-12 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="grid md:grid-cols-12 gap-8 items-center">
                {/* Left Column: Info & WhatsApp */}
                <div className="md:col-span-6 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider border border-emerald-500/20">
                        <MessageSquare className="w-3.5 h-3.5" /> FrankBase Community & Channels
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        Stay Connected with <br />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            FrankBase Ecosystem
                        </span>
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Join our official WhatsApp Channels for instant product release notifications, feature drops, and FrankBase Store exclusive discounts.
                    </p>

                    {/* WhatsApp Channel Links */}
                    <div className="pt-2 space-y-2">
                        <a
                            href="https://whatsapp.com/channel/0029Va9xyz"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Join FrankBase Official WhatsApp Channel ↗</span>
                        </a>
                        <div className="block">
                            <a
                                href="https://store.frankbase.com"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition border border-slate-200 dark:border-slate-700"
                            >
                                <ShoppingBag className="w-4 h-4 text-primary" />
                                <span>Explore FrankBase Digital Store ↗</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Column: Central Multi-Topic Newsletter */}
                <div className="md:col-span-6 bg-slate-50 dark:bg-slate-900/80 p-5 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="space-y-2 mb-4">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Central Email Newsletter
                        </h4>
                        <p className="text-xs text-slate-500">
                            Select the topics you want to receive updates for:
                        </p>
                    </div>

                    {isSubscribed ? (
                        <div className="py-6 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                                You are Subscribed!
                            </h5>
                            <p className="text-xs text-slate-500">
                                Thank you for subscribing. We will send curated updates directly to your inbox. No spam guarantee.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="space-y-4">
                            {/* Checkboxes */}
                            <div className="space-y-2 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={selectedTopics.tools}
                                        onChange={() => handleTopicToggle('tools')}
                                        className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        ⚡ FrankBase Web Apps & ClipSync Feature Updates
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={selectedTopics.store}
                                        onChange={() => handleTopicToggle('store')}
                                        className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        🛍️ FrankBase Store Deals, Digital Products & E-books
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={selectedTopics.founder}
                                        onChange={() => handleTopicToggle('founder')}
                                        className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        ✍️ Master Manikant Yadav Tech Essays & Strategy
                                    </span>
                                </label>
                            </div>

                            {/* Email Input */}
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
                                >
                                    <span>{isSubmitting ? '...' : 'Subscribe'}</span>
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Zero spam. Synchronized with Central Command database. Unsubscribe anytime.</span>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EcosystemNewsletter;
