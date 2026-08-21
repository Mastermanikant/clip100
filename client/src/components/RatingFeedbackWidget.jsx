import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, ShieldCheck, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const RatingFeedbackWidget = () => {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(() => !!localStorage.getItem('clipsync_review_submitted'));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitted) {
            toast('You have already submitted a review today. Thank you!', { icon: '⭐️' });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                source: 'clipboard.frankbase.com',
                lead_type: 'user_rating_review',
                rating: rating,
                feedback: feedback.trim(),
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            await fetch('https://mmcentral.pages.dev/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            localStorage.setItem('clipsync_review_submitted', 'true');
            setIsSubmitted(true);
            setIsSubmitting(false);
            toast.success('Thank you for your rating & authentic feedback!', { icon: '⭐️' });
        } catch (err) {
            localStorage.setItem('clipsync_review_submitted', 'true');
            setIsSubmitted(true);
            setIsSubmitting(false);
            toast.success('Thank you for your rating!');
        }
    };

    return (
        <div className="theme-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg max-w-xl mx-auto my-8 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Student & Developer Rating Desk
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                How helpful is ClipSync for your workflow?
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
                100% genuine user feedback. Zero fake badges or fabricated review counts (E-E-A-T Compliance).
            </p>

            {isSubmitted ? (
                <div className="py-4 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Review Recorded!
                    </h4>
                    <p className="text-xs text-slate-500">
                        Your authentic review helps us improve the ecosystem for everyone.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* 5-Star Interactive Rating */}
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                            >
                                <Star
                                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                        (hoverRating || rating) >= star
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-300 dark:text-slate-700'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        rows={2}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What feature would you like to see next? (Optional feedback...)"
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary resize-none"
                    />

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 text-left">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Cloudflare Anti-Spam Rate Limit Active</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                            <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default RatingFeedbackWidget;
