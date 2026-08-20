import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FileCheck, ShieldAlert, CheckCircle2, Scale, AlertTriangle } from 'lucide-react';

const Terms = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="text-center space-y-3 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                        <FileCheck className="w-3.5 h-3.5" /> Legal & Terms of Use
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        ClipSync Terms of Service
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Effective Date: August 21, 2026 | FrankBase Ecosystem
                    </p>
                </div>

                <div className="theme-card rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Scale className="w-5 h-5 text-primary" /> 1. Acceptance of Terms
                        </h2>
                        <p className="text-xs sm:text-sm">
                            By accessing or using <strong>ClipSync</strong> (<code>clipboard.frankbase.com</code>), you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of this service immediately.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" /> 2. Purpose and Ephemeral Nature
                        </h2>
                        <p className="text-xs sm:text-sm">
                            ClipSync is provided as a free, ephemeral text synchronization utility intended for immediate, peer-to-peer productivity. It is not designed for permanent data archiving, persistent cloud backup, or long-term note storage.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-accent" /> 3. Acceptable Use Policy
                        </h2>
                        <p className="text-xs sm:text-sm">
                            Users agree NOT to use ClipSync to transmit, broadcast, or facilitate:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2 text-slate-600 dark:text-slate-400">
                            <li>Malicious software, trojans, exploits, or automated bot attacks.</li>
                            <li>Unlawful, defamatory, harassing, abusive, or infringing content.</li>
                            <li>Attempts to disrupt, overload, or perform Denial-of-Service (DoS) attacks on WebSocket servers.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> 4. Disclaimer of Warranties
                        </h2>
                        <p className="text-xs sm:text-sm">
                            ClipSync is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. While we strive for 99.9% uptime and low latency, FrankBase and its founder Master Manikant Yadav are not liable for accidental data loss caused by network interruptions or browser closures.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-primary" /> 5. Modifications and Contact
                        </h2>
                        <p className="text-xs sm:text-sm">
                            We reserve the right to modify these terms at any time. Inquiries regarding legal terms should be directed to <a href="mailto:legal@frankbase.com" className="text-primary hover:underline font-semibold">legal@frankbase.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Terms;
