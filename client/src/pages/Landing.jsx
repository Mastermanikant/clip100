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
    BookOpen,
    Link as LinkIcon,
    User,
    Calendar,
    KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';

const Landing = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'custom' | 'diary'
    const [joinCode, setJoinCode] = useState('');
    const [customSlug, setCustomSlug] = useState('');
    const [diaryUser, setDiaryUser] = useState('');
    const [openFaq, setOpenFaq] = useState(null);

    // Create Ephemeral Room
    const createQuickRoom = () => {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        navigate(`/room/${code}`);
    };

    // Join Any Room by Code or Name
    const handleJoin = (e) => {
        e.preventDefault();
        const cleaned = joinCode.trim();
        if (cleaned) {
            navigate(`/room/${cleaned}`);
        } else {
            toast.error('Please enter a valid room code or link name');
        }
    };

    // Create 30-Day Custom Link
    const handleCreateCustomLink = (e) => {
        e.preventDefault();
        const cleaned = customSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (cleaned.length < 3) {
            toast.error('Custom link must be at least 3 characters (letters/numbers)');
            return;
        }
        navigate(`/link/${cleaned}`);
    };

    // Create/Open Personal Cloud Diary
    const handleOpenDiary = (e) => {
        e.preventDefault();
        const cleaned = diaryUser.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (cleaned.length < 3) {
            toast.error('Username must be at least 3 characters');
            return;
        }
        navigate(`/u/${cleaned}`);
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            q: "What is the difference between Quick Room and 30-Day Custom Link?",
            a: "A Quick Room generates a 6-digit random code and is completely ephemeral (RAM-only, clears when tabs close). A 30-Day Custom Link lets you pick a memorable name (like /link/mani100) that stays active and reserved for your devices for 30 days of inactivity, making reconnecting instant."
        },
        {
            q: "Can I paste screenshots and images directly into ClipSync?",
            a: "Yes! Simply press Ctrl+V anywhere in the room. ClipSync detects images from your clipboard, generates an instant preview, and streams it live to all connected devices with a 1-click Download button (up to 10MB per image)."
        },
        {
            q: "Can I lock my custom room with a secret PIN?",
            a: "Yes! Click the Key icon in the room header to set a 4-digit PIN. Only devices that enter the correct PIN can decrypt and view the room text and screenshots."
        },
        {
            q: "How many devices can connect to the same custom link?",
            a: "Unlimited! You can open your custom link on your laptop, mobile phone, tablet, and secondary PC at the same time. Any change made on any device updates all other screens in real time with <50ms delay."
        },
        {
            q: "Do I need to install any software or mobile apps?",
            a: "No. ClipSync is 100% web-based and works on all modern browsers (Chrome, Safari, Firefox, Edge, Brave) across Android, iOS, Windows, macOS, and Linux."
        },
        {
            q: "How does the 30-day auto-expiry work?",
            a: "Custom links remain active as long as you use them. If a link is not opened by any device for 30 consecutive days, the server automatically purges it to keep resources clean and prevent dead links."
        }
    ];

    const guideSteps = [
        {
            step: "01",
            title: "Pick Your Mode",
            desc: "Choose an instant 6-digit Quick Room, create a 30-Day Custom Link (/link/name), or open your Personal Diary."
        },
        {
            step: "02",
            title: "Pair Phone Instantly",
            desc: "Scan the on-screen QR Code using your phone camera, or open the link directly on your mobile browser."
        },
        {
            step: "03",
            title: "Live Text & Screenshot Sync",
            desc: "Type or press Ctrl+V to paste screenshots. Changes broadcast bi-directionally across all devices in <50ms."
        },
        {
            step: "04",
            title: "1-Click Copy & Optional PIN",
            desc: "Hit Copy to save to clipboard. Lock with an optional 4-digit PIN for private notes or let it auto-purge."
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
                        <Sparkles className="w-3.5 h-3.5" /> Real-Time Clipboard • 30-Day Custom Links • Screenshot Paste
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                        Instant Clipboard & <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            Cross-Device Text Sync
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Copy-paste text, long URLs, OTPs, and screenshots between your phone, tablet, and PC. No login required. 100% ad-free.
                    </p>

                    {/* Multi-Tab Creator Card */}
                    <div className="max-w-xl mx-auto theme-card rounded-3xl p-5 sm:p-7 shadow-2xl border-slate-200 dark:border-slate-800">
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6 text-xs sm:text-sm font-semibold">
                            <button
                                onClick={() => setActiveTab('quick')}
                                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                                    activeTab === 'quick'
                                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                <Zap className="w-4 h-4" /> Quick Room
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                                    activeTab === 'custom'
                                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                <LinkIcon className="w-4 h-4" /> 30-Day Link
                            </button>
                            <button
                                onClick={() => setActiveTab('diary')}
                                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                                    activeTab === 'diary'
                                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                <User className="w-4 h-4" /> Cloud Diary
                            </button>
                        </div>

                        {/* Tab 1: Quick Room */}
                        {activeTab === 'quick' && (
                            <div className="space-y-4">
                                <button
                                    onClick={createQuickRoom}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:opacity-95 shadow-lg shadow-primary/25 transition flex items-center justify-center gap-2 group text-base"
                                >
                                    <Zap className="w-5 h-5" />
                                    <span>Create Instant Quick Room</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="relative flex py-1 items-center">
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                    <span className="flex-shrink mx-4 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Or Enter Existing Code</span>
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                </div>

                                <form onSubmit={handleJoin} className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={10}
                                        placeholder="Enter 6-digit Code (e.g. K8F92A)"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 uppercase tracking-wider font-semibold placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary transition"
                                    />
                                    <button
                                        type="submit"
                                        aria-label="Join Room"
                                        className="px-5 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Tab 2: 30-Day Custom Link */}
                        {activeTab === 'custom' && (
                            <form onSubmit={handleCreateCustomLink} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Choose your custom memorable URL (Active for 30 days):
                                    </label>
                                    <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-primary transition">
                                        <span className="px-3 py-3 bg-slate-100 dark:bg-slate-800/80 text-xs font-mono text-slate-500 border-r border-slate-200 dark:border-slate-700 select-none">
                                            clip.frankbase.com/link/
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            maxLength={25}
                                            placeholder="mani100"
                                            value={customSlug}
                                            onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                            className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Use only lowercase letters, numbers, and hyphens (e.g. <code>mani100</code>, <code>room1</code>).
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-95 shadow-md shadow-primary/25 transition flex items-center justify-center gap-2"
                                >
                                    <LinkIcon className="w-4 h-4" /> Create / Open 30-Day Link
                                </button>
                            </form>
                        )}

                        {/* Tab 3: Personal Cloud Diary */}
                        {activeTab === 'diary' && (
                            <form onSubmit={handleOpenDiary} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        Enter your personal username (Password/PIN Protected):
                                    </label>
                                    <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-primary transition">
                                        <span className="px-3 py-3 bg-slate-100 dark:bg-slate-800/80 text-xs font-mono text-slate-500 border-r border-slate-200 dark:border-slate-700 select-none">
                                            clip.frankbase.com/u/
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            maxLength={25}
                                            placeholder="mastermanikant"
                                            value={diaryUser}
                                            onChange={(e) => setDiaryUser(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                            className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Access your saved clipboard notes from any cyber cafe or device with your PIN.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-95 shadow-md shadow-primary/25 transition flex items-center justify-center gap-2"
                                >
                                    <KeyRound className="w-4 h-4" /> Open Personal Diary Room
                                </button>
                            </form>
                        )}

                        <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Lifetime Free & Ad-Free
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-primary" /> Optional 4-Digit PIN
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-accent" /> &lt;50ms Real-Time Sync
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
                        Synchronize text and screenshots across unlimited devices without complex setup.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {guideSteps.map((s) => (
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

            <Footer />
        </div>
    );
};

export default Landing;
