import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const VoucherPopup = ({ isOpen, onClose, onSuccess }) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First check if voucher is valid
      const checkResponse = await fetch(`http://18.184.65.167:5000/voucher/check?code=${encodeURIComponent(voucherCode)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(checkData.detail?.[0]?.msg || checkData.detail || 'Invalid or already used voucher');
      }

      // If valid, mark it as used
      const markResponse = await fetch(`http://18.184.65.167:5000/voucher/mark-used?code=${encodeURIComponent(voucherCode)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });

      const markData = await markResponse.json();

      if (!markResponse.ok) {
        throw new Error(markData.detail?.[0]?.msg || markData.detail || 'Could not process voucher');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 ">Enter Voucher Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="voucher" className="block text-sm font-medium text-gray-700 mb-2">
              Voucher Code
            </label>
            <input
              id="voucher"
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="Enter your code"
              disabled={loading || success}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Voucher successfully applied!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!voucherCode || loading || success}
            className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center gap-2
              ${!voucherCode || loading || success
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors`}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {success ? 'Verified!' : loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VoucherPopup;