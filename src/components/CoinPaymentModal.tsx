import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CoinPaymentModalProps = {
  isOpen: boolean;
  requiredAmountRupees: number;
  onInsertCoin: (denomRupees: number) => Promise<void>;
  onCancel: () => void;
};

const COIN_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100];

export function CoinPaymentModal({
  isOpen,
  requiredAmountRupees,
  onInsertCoin,
  onCancel,
}: CoinPaymentModalProps) {
  const [insertedRupees, setInsertedRupees] = useState(0);
  const [isInserting, setIsInserting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInsertedRupees(0);
      setIsInserting(false);
    }
  }, [isOpen]);

  const remainingRupees = Math.max(0, requiredAmountRupees - insertedRupees);
  const progressPercent = Math.min(100, Math.round((insertedRupees / requiredAmountRupees) * 100));

  const handleCoinClick = async (denom: number) => {
    if (isInserting) return;
    setIsInserting(true);

    const nextInserted = insertedRupees + denom;
    setInsertedRupees(nextInserted);

    try {
      await onInsertCoin(denom);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInserting(false);
    }
  };

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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/95 p-8 shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-xl text-amber-700">
                  🪙
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">Coin Acceptor Slot</h3>
                  <p className="text-xs text-ink/50">Insert physical coin tokens below</p>
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

            {/* Payment Progress Display */}
            <div className="mt-6 rounded-3xl border border-amber-200/60 bg-amber-50/50 p-6">
              <div className="grid grid-cols-3 text-center">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Required</div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-ink">₹{requiredAmountRupees}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Inserted</div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-amber-600">₹{insertedRupees}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Remaining</div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-rose-500">₹{remainingRupees}</div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="mt-4">
                <div className="h-3 w-full overflow-hidden rounded-full bg-amber-200/50">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="mt-1.5 text-center text-xs font-semibold text-ink/60">
                  {progressPercent}% Inserted
                </div>
              </div>
            </div>

            {/* Coin Denomination Buttons */}
            <div className="mt-6 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-ink/50">
                Tap Coin to Insert
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {COIN_DENOMINATIONS.map((denom) => (
                  <motion.button
                    key={denom}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    disabled={isInserting}
                    onClick={() => handleCoinClick(denom)}
                    className="flex flex-col items-center justify-center rounded-2xl border border-amber-300/80 bg-gradient-to-b from-amber-100 to-amber-200/70 p-3 shadow-md hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span className="text-xs text-amber-800/80 font-bold">INR</span>
                    <span className="font-display text-xl font-black text-amber-950">₹{denom}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Status Note */}
            <div className="mt-6 flex items-center justify-between border-t border-mist pt-4 text-xs text-ink/60">
              <span>Hardware Coin Acceptor: <strong className="text-emerald-600">Active</strong></span>
              <button
                type="button"
                onClick={onCancel}
                className="font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Cancel Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
