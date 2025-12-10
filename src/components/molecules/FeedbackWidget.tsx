/**
 * Feedback Widget Component
 * Floating button and modal for user feedback
 */

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { logger } from '../../lib/logger';

type FeedbackType = 'bug' | 'feature' | 'general';

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error('Please enter your feedback');
            return;
        }

        setIsSubmitting(true);

        try {
            // In production, this would submit to a backend or service like Formspree
            // For now, we'll just log it and simulate submission
            const feedback = {
                type: feedbackType,
                message: message.trim(),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
            };

            logger.info('Feedback submitted', { feedback });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Thank you for your feedback!');
            setMessage('');
            setIsOpen(false);
        } catch (error) {
            logger.error('Failed to submit feedback', error as Error);
            toast.error('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                id="feedback-button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform group"
                aria-label="Give feedback"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Give Feedback
                </span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Send Feedback</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Feedback Type */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    What kind of feedback?
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFeedbackType('bug')}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${feedbackType === 'bug'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        🐛 Bug
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFeedbackType('feature')}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${feedbackType === 'feature'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        💡 Feature
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFeedbackType('general')}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${feedbackType === 'general'
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        💬 General
                                    </button>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Your feedback
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell us what you think..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 bg-white/10 text-white px-4 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
