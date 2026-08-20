import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    ArrowRight,
    Zap,
    Shield,
    Globe,
    QrCode,
    Smartphone,
    Laptop,
    CheckCircle2,
    Lock,
    Copy,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    Sparkles,
    Keyboard,
    Clock,
    FileText,
    BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const Landing = () => {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [openFaq, setOpenFaq] = useState(null);

    const createRoom = () => {
        // Generate friendly 6-char alphanumeric room code
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        navigate(`/room/${code}`);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        const cleaned = joinCode.trim().toUpperCase();
        if (cleaned) {
            navigate(`/room/${cleaned}`);
        } else {
            toast.error('Please enter a valid room code');
        }
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            q: "How does ClipSync work across different devices?",
            a: "ClipSync creates a temporary WebSocket room identified by a unique 6-character code or QR code. When you open the room on your PC and scan the QR code with your mobile phone camera, both devices connect to the same real-time channel. Any character typed on one device appears instantly on the other."
        },
        {
            q: "Do I need to install any app or register an account?",
            a: "No! ClipSync is 100% web-based and requires zero login, email, phone number, or app installation. It works on any modern browser (Chrome, Safari, Firefox, Edge, Brave) across iOS, Android, macOS, Windows, and Linux."
        },
        {
            q: "Is my clipboard text saved on your servers?",
            a: "No. ClipSync operates on an ephemeral RAM-only architecture. Your text is stored in server memory only while active devices are connected. As soon as you hit 'Clear' or close your tabs, the memory buffer is wiped permanently."
        },
        {
            q: "Can I share passwords, OTPs, or confidential code?",
            a: "Yes. All data is encrypted in transit via HTTPS and Secure WebSockets (TLS 1.3). Furthermore, because we do not persist data to disk or write database logs, it is substantially safer than messaging apps that store chat histories in unencrypted cloud backups."
        },
        {
            q: "How many devices can connect to a single room?",
            a: "Multiple devices can connect to the same room code simultaneously. You can use it across your laptop, tablet, phone, and secondary workstation at the same time."
        },
        {
            q: "Is there a limit on how much text I can paste?",
            a: "You can easily sync long articles, JSON payloads, and code snippets up to 50,000+ characters with instantaneous synchronization."
        }
    ];

    const useCases = [
        {
            icon: <Smartphone className="w-6 h-6 text-primary" />,
            title: "Phone ↔ Laptop Sync",
            desc: "Instantly copy addresses, links, WhatsApp messages, or long text from your smartphone to your laptop without emailing yourself."
        },
        {
            icon: <Laptop className="w-6 h-6 text-secondary" />,
            title: "Developer Snippets & JSON",
            desc: "Move OAuth tokens, API keys, JSON payloads, and terminal commands between dev machines and mobile test environments."
        },
        {
            icon: <QrCode className="w-6 h-6 text-accent" />,
            title: "Classrooms & Meetings",
            desc: "Presenters and teachers can project a QR code on a screen to let dozens of students instantly copy a live lesson link or reference notes."
        },
        {
            icon: <Shield className="w-6 h-6 text-emerald-500" />,
            title: "Zero-Log 2FA & OTP Handoff",
            desc: "Copy 2FA SMS codes or temporary banking passwords to your desktop without saving sensitive strings in chat history."
        }
    ];

    const guideSteps = [
        {
            step: "01",
            title: "Create a Room",
            desc: "Click 'Create New Room' on your computer or primary device to get a fresh 6-digit code and QR Code."
        },
        {
            step: "02",
            title: "Scan or Enter Code",
            desc: "Scan the on-screen QR Code using your phone camera, or enter the 6-character code on any secondary browser."
        },
        {
            step: "03",
            title: "Type & Live Sync",
            desc: "Type, paste text, or drop URLs. Real-time WebSockets sync characters bidirectionally with sub-50ms latency."
        },
        {
            step: "04",
            title: "Copy & Auto Purge",
            desc: "Click the 1-touch 'Copy' button to save to your local clipboard. Close the tab or click 'Clear' to wipe all RAM data."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />

            {/* Hero Section */}
            <section id="create-room" className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-slate-200 dark:border-slate-800">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[15%] w-96 h-96 bg-primary/15 dark:bg-primary/25 rounded-full blur-3xl animate-blob"></div>
                    <div className="absolute top-[20%] right-[15%] w-96 h-96 bg-secondary/15 dark:bg-secondary/25 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3.5 h-3.5" /> Fast • Ephemeral • Zero-Login
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                        Real-Time Clipboard <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            Across Any Device
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Instantly synchronize text, long URLs, OTPs, and code snippets between your phone, tablet, and PC. No registration required.
                    </p>

                    {/* Action Card: Create or Join */}
                    <div className="max-w-xl mx-auto theme-card rounded-2xl p-4 sm:p-6 shadow-xl border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={createRoom}
                                className="flex-1 py-4 px-6 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-95 shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Zap className="w-5 h-5" />
                                <span>Create New Room</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <form onSubmit={handleJoin} className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    maxLength={8}
                                    placeholder="Enter Room Code"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 uppercase tracking-wider font-semibold placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary transition"
                                />
                                <button
                                    type="submit"
                                    aria-label="Join Room"
                                    className="px-4 py-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </form>
                        </div>

                        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Free & No Ads
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-primary" /> TLS 1.3 Encrypted
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-accent" /> &lt;50ms Latency
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive User Guide Section */}
            <section id="user-guide" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-center space-y-3 mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" /> User Guide & Workflow
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        How ClipSync Works in 4 Easy Steps
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                        Get up and running in seconds without registering accounts or configuring local network ports.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {guideSteps.map((s, idx) => (
                        <div
                            key={s.step}
                            className="theme-card rounded-2xl p-6 relative group hover:-translate-y-1 transition-transform shadow-sm"
                        >
                            <div className="text-3xl font-black text-slate-200 dark:text-slate-800 mb-4 group-hover:text-primary transition-colors">
                                {s.step}
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                                {s.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {s.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Popular Use Cases Section */}
            <section className="py-16 bg-slate-100/60 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-3 mb-14">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Built For High-Speed Daily Scenarios
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                            Designed to replace clumsy workarounds like emailing yourself or creating single-member WhatsApp chats.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {useCases.map((uc, idx) => (
                            <div key={idx} className="theme-card rounded-2xl p-6 sm:p-8 flex items-start gap-4 shadow-sm">
                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                                    {uc.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1.5">
                                        {uc.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {uc.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Keyboard Shortcuts Cheatsheet */}
            <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="theme-card rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Keyboard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                Pro Productivity Keyboard Shortcuts
                            </h3>
                            <p className="text-xs text-slate-500">Accelerate your clipboard sharing workflow</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-300">Copy text to OS clipboard</span>
                            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[11px] shadow-sm">
                                Ctrl + Enter
                            </kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-300">Toggle Mobile QR Code</span>
                            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[11px] shadow-sm">
                                Alt + Q
                            </kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-300">Select All Text</span>
                            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[11px] shadow-sm">
                                Ctrl + A
                            </kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-300">Exit / Leave Room</span>
                            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[11px] shadow-sm">
                                Esc
                            </kbd>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive FAQ Accordion */}
            <section className="py-16 bg-slate-100/60 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-3 mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Got Questions? We Have Answers.
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="theme-card rounded-2xl overflow-hidden shadow-sm transition-colors"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full p-5 sm:p-6 text-left font-bold text-base sm:text-lg flex items-center justify-between gap-4 hover:text-primary transition"
                                >
                                    <span>{faq.q}</span>
                                    {openFaq === index ? (
                                        <ChevronUp className="w-5 h-5 shrink-0 text-primary" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 shrink-0 text-slate-400" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Bar */}
            <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-2xl space-y-6">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        Start Sharing Text In Seconds
                    </h2>
                    <p className="text-slate-100 max-w-xl mx-auto text-sm sm:text-base">
                        Experience the fastest, zero-login, ephemeral clipboard designed for phones and PCs.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={createRoom}
                            className="px-8 py-4 bg-white text-slate-900 font-extrabold rounded-2xl hover:bg-slate-100 shadow-xl transition-all inline-flex items-center gap-2"
                        >
                            <Zap className="w-5 h-5 text-primary" /> Create A Live Room Now
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landing;
