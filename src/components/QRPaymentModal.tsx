import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type QRPaymentModalProps = {
  isOpen: boolean;
  amountRupees: number;
  paymentId: string;
  onVerifyQR: (paymentId: string) => Promise<void>;
  onCancel: () => void;
};

export function QRPaymentModal({
  isOpen,
  amountRupees,
  paymentId,
  onVerifyQR,
  onCancel,
}: QRPaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(120);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(120);
      setIsVerifying(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onCancel]);

  const handleSimulateScan = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      await onVerifyQR(paymentId);
    } catch (e) {
      console.error(e);
      setIsVerifying(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-ink/70 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-xl text-indigo-700">
                  📱
                </span>
                <div className="text-left">
                  <h3 className="font-display text-xl font-bold text-ink">UPI / Dynamic QR Code</h3>
                  <p className="text-xs text-ink/50">Scan with Google Pay, PhonePe, Paytm</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink/60 hover:bg-mist/80 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Amount Badge */}
            <div className="mt-6 rounded-2xl bg-mist/60 py-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink/50">Amount Payable</div>
              <div className="font-display text-3xl font-extrabold text-indigo-600">₹{amountRupees}</div>
            </div>

            {/* QR Code Container */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="relative flex h-52 w-52 items-center justify-center rounded-3xl border-2 border-indigo-200 bg-white p-4 shadow-inner">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <rect x="5" y="5" width="30" height="30" fill="#1e1b4b" rx="4" />
                  <rect x="10" y="10" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="15" y="15" width="10" height="10" fill="#1e1b4b" rx="1" />

                  <rect x="65" y="5" width="30" height="30" fill="#1e1b4b" rx="4" />
                  <rect x="70" y="10" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="75" y="15" width="10" height="10" fill="#1e1b4b" rx="1" />

                  <rect x="5" y="65" width="30" height="30" fill="#1e1b4b" rx="4" />
                  <rect x="10" y="70" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="15" y="75" width="10" height="10" fill="#1e1b4b" rx="1" />

                  <rect x="40" y="10" width="15" height="15" fill="#4f46e5" rx="2" />
                  <rect x="40" y="40" width="20" height="20" fill="#4f46e5" rx="2" />
                  <rect x="65" y="40" width="25" height="15" fill="#1e1b4b" rx="2" />
                  <rect x="40" y="65" width="15" height="25" fill="#1e1b4b" rx="2" />
                  <rect x="65" y="65" width="25" height="25" fill="#4f46e5" rx="2" />
                </svg>
              </div>

              {/* Timer */}
              <div className="mt-4 flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700">
                <span>⏳</span> Expires in {minutes}:{seconds}
              </div>
            </div>

            {/* Action Simulation */}
            <div className="mt-6 space-y-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isVerifying}
                onClick={handleSimulateScan}
                className="w-full rounded-2xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg hover:bg-indigo-700 transition-all cursor-pointer"
              >
                {isVerifying ? 'Verifying Payment...' : '📲 Simulate Phone UPI Scan & Pay'}
              </motion.button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-2xl border border-mist py-2.5 text-xs font-bold text-rose-600 hover:bg-mist cursor-pointer"
              >
                Cancel Payment Session
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
