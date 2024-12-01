import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { z } from 'zod';

// Zod schema for feedback validation
const feedbackSchema = z.object({
  feedback_text: z
    .string()
    .min(20, 'Feedback muss mindestens 10 Zeichen lang sein')
    .max(150, 'Feedback darf maximal 150 Zeichen lang sein')
});

const FeedbackModal = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    const value = e.target.value;
    setFeedback(value);
    setCharCount(value.length);
    setError(null);
  };

  const validateFeedback = () => {
    try {
      feedbackSchema.parse({ feedback_text: feedback });
      return true;
    } catch (err) {
      setError(err.errors[0].message);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateFeedback()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://app.saincube.com/app1/save-feedback/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback_text: feedback }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const data = await response.json();
      setSuccess(data);
      setFeedback(''); // Reset form after successful submission
    } catch (err) {
      setError('Fehler beim Senden des Feedbacks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state when modal is closed
    setFeedback('');
    setError(null);
    setSuccess(null);
    setCharCount(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 text-black backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full shadow-lg relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Ihr Feedback</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Vielen Dank für Ihr Feedback!</h3>
                <p className="text-gray-500">Ihr Gutscheincode:</p>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-lg text-center">
                  {success.voucher_code}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Sie können das Fenster jetzt schließen.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Teilen Sie uns Ihre Erfahrungen mit und erhalten Sie einen Gutscheincode für Ihre nächste Überprüfung.
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={feedback}
                    onChange={handleChange}
                    className={`w-full h-32 p-3 border rounded-lg resize-none transition-colors
                      ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
                      focus:ring-2 ${error ? 'focus:ring-red-100' : 'focus:ring-blue-100'}
                      outline-none`}
                    placeholder="Beschreiben Sie Ihre Erfahrungen..."
                    disabled={isSubmitting}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {charCount}/500
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2
                    ${isSubmitting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'}
                    transition-all duration-200`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      Wird gesendet...
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Feedback senden
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;