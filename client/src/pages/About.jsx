import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Zap, Globe, Cpu, Heart, CheckCircle2, Lock, ArrowRight, UserCheck } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                {/* Header Badge & Title */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5" /> About ClipSync & FrankBase
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                        Frictionless, Private & Real-Time Text Sharing
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        ClipSync was engineered to eliminate the daily headache of emailing yourself notes, creating dummy WhatsApp groups, or plugging in USB cables just to copy a single OTP, URL, or code snippet.
                    </p>
                </div>

                {/* Mission & Philosophy */}
                <div className="theme-card rounded-2xl p-6 sm:p-8 mb-10 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-primary" /> Our Core Mission
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base mb-4">
                        In an era where modern cloud ecosystems demand account sign-ups, subscriptions, phone verification, and invasive cookies just to move clipboard text between a laptop and a smartphone, **ClipSync provides a breath of fresh air: Instant Zero-Login Ephemeral Utility**.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                        When you open a room, an ephemeral WebSocket bridge connects your devices. Your data lives exclusively in RAM while the session is active. The instant you close your browser or leave the room, the temporary session is permanently cleared.
                    </p>
                </div>

                {/* Key Technical Highlights */}
                <div className="grid sm:grid-cols-2 gap-6 mb-12">
                    <div className="theme-card rounded-2xl p-6 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-primary flex items-center justify-center mb-4">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                            Under 50ms Real-Time Latency
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Built with high-performance WebSocket listeners. Changes typed on your keyboard appear character-by-character on your connected mobile screen with near zero lag.
                        </p>
                    </div>

                    <div className="theme-card rounded-2xl p-6 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                            Zero Disk Database Storage
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            We do not maintain persistent SQL/NoSQL databases of your clipboard content. Your text is never indexed, stored, sold, or accessible to third-party data brokers.
                        </p>
                    </div>

                    <div className="theme-card rounded-2xl p-6 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                            Universal Device Agnostic
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Works seamlessly across Android, iOS (iPhone/iPad), macOS, Windows, Linux, ChromeOS, and Smart TVs without installing heavy native applications.
                        </p>
                    </div>

                    <div className="theme-card rounded-2xl p-6 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                            Instant Camera QR Pairing
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Point your default smartphone camera at the generated QR code, tap the prompt, and both devices are instantly synchronized into a private clipboard room.
                        </p>
                    </div>
                </div>

                {/* Founder & FrankBase Ecosystem Note */}
                <div className="theme-card rounded-2xl p-6 sm:p-8 mb-12 border-l-4 border-l-primary">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg shrink-0">
                            MY
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Founder & Architecture
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                <strong>ClipSync (`clipboard.frankbase.com`)</strong> is developed and maintained by <strong>Master Manikant Yadav</strong> as part of the <strong>FrankBase</strong> and <strong>MasterManikant.com</strong> digital ecosystems.
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                For inquiries, feedback, or enterprise partnerships, contact our central executive desk at <a href="mailto:support@frankbase.com" className="text-primary hover:underline font-semibold">support@frankbase.com</a>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                    >
                        Try ClipSync Now <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
