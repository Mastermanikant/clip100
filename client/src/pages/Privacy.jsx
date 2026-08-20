import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Lock, EyeOff, Trash2, Server, Globe, FileText } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="text-center space-y-3 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" /> Zero-Log Ephemeral Privacy
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        ClipSync Privacy Policy
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Effective Date: August 21, 2026 | Last Updated: August 2026
                    </p>
                </div>

                <div className="theme-card rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {/* Core Promise */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-200">
                        <h3 className="font-bold text-emerald-700 dark:text-emerald-300 text-base mb-1 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> The Zero-Data-Retention Commitment
                        </h3>
                        <p className="text-xs sm:text-sm">
                            ClipSync is built on an ephemeral in-memory architecture. We do not store your clipboard text on persistent hard drives, database tables, or log archives. The data you paste exists only in volatile server RAM while peers are connected, and is instantly purged upon disconnect.
                        </p>
                    </div>

                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <EyeOff className="w-5 h-5 text-primary" /> 1. Information We Do NOT Collect
                        </h2>
                        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
                            <li>We do <strong>not</strong> require user registration, emails, or phone numbers to use clipboard rooms.</li>
                            <li>We do <strong>not</strong> record or index the text, passwords, OTPs, URLs, or code snippets you transmit.</li>
                            <li>We do <strong>not</strong> maintain cross-site tracking cookies, behavioral ad pixels, or profile identifiers.</li>
                            <li>We do <strong>not</strong> log keystrokes or clipboard history beyond the active WebSocket room.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" /> 2. Technical Session Architecture
                        </h2>
                        <p className="text-xs sm:text-sm">
                            When a room code is generated (e.g. <code>/room/abc123</code>), a lightweight WebSocket socket channel is established over an encrypted HTTPS/WSS transport layer. Connected clients receive broadcasted delta events. Once all clients disconnect or the room expires, the server garbage collection immediately releases the memory buffer.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-primary" /> 3. Room Expiration & Manual Wipe
                        </h2>
                        <p className="text-xs sm:text-sm">
                            You have complete control over your room content. Any participant inside a room can hit the <strong>"Clear"</strong> button, which broadcasts a null state to all devices and clears the server buffer in real-time.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" /> 4. Transport Encryption (TLS/SSL)
                        </h2>
                        <p className="text-xs sm:text-sm">
                            All communications between your browser and our edge nodes are strictly protected using Modern Transport Layer Security (TLS 1.3 encryption). Eavesdropping on Wi-Fi routers or intermediate ISPs is cryptographically prevented.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" /> 5. Contact & Privacy Inquiries
                        </h2>
                        <p className="text-xs sm:text-sm">
                            If you have questions regarding this Privacy Policy or security practices, contact our Data Protection Officer at:
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-primary">
                            support@frankbase.com | legal@frankbase.com
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Privacy;
