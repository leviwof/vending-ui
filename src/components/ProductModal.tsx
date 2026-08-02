import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type Product = {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  quantity?: number;
  calories?: number;
};

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
  onProceedPayment: (product: Product, method: 'COIN' | 'QR') => void;
};

export function ProductModal({ product, onClose, onProceedPayment }: ProductModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'COIN' | 'QR'>('COIN');

  const isOutOfStock = (product?.quantity ?? 0) <= 0;
  const priceRupees = product ? (product.priceCents / 100).toFixed(0) : '0';

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/95 p-8 shadow-2xl backdrop-blur-md"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-mist text-ink/70 hover:bg-mist/80 transition-colors"
            >
              ✕
            </button>

            {/* Product Image */}
            <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-3xl bg-mist/60">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-6xl">🥤</span>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/75 backdrop-blur-xs">
                  <span className="rounded-full bg-rose-500/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
                    Out Of Stock • Restock Required
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="mt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/40">
                    {product.sku || 'SKU-SMART-VM'}
                  </span>
                  <h2 className="mt-1 font-display text-3xl font-bold text-ink">{product.name}</h2>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-extrabold text-emerald-600">₹{priceRupees}</div>
                  <div className="text-xs font-medium text-ink/50">
                    Stock:{' '}
                    <span
                      className={
                        isOutOfStock ? 'text-rose-500 font-bold' : 'text-emerald-600 font-bold'
                      }
                    >
                      {product.quantity ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-ink/70">
                {product.description || 'Premium quality fresh beverage chilled in smart vending controller.'}
              </p>

              <div className="mt-4 flex items-center gap-4 text-xs text-ink/60">
                <div className="rounded-xl bg-mist px-3 py-1.5 font-medium">
                  🔥 {product.calories || 140} kcal
                </div>
                <div className="rounded-xl bg-mist px-3 py-1.5 font-medium">
                  ❄️ Served at 4.2°C
                </div>
              </div>

              {/* Payment Method Selector */}
              {!isOutOfStock && (
                <div className="mt-6 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink/50">
                    Select Payment Method
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COIN')}
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-3 font-medium transition-all ${
                        paymentMethod === 'COIN'
                          ? 'border-ink bg-ink text-white shadow-md'
                          : 'border-mist bg-mist/50 text-ink hover:bg-mist'
                      }`}
                    >
                      <span>🪙</span> Coin Acceptor
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('QR')}
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-3 font-medium transition-all ${
                        paymentMethod === 'QR'
                          ? 'border-ink bg-ink text-white shadow-md'
                          : 'border-mist bg-mist/50 text-ink hover:bg-mist'
                      }`}
                    >
                      <span>📱</span> UPI / QR Code
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-mist py-3.5 font-medium text-ink/70 hover:bg-mist transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => onProceedPayment(product, paymentMethod)}
                  className={`flex-[2] rounded-2xl py-3.5 font-bold shadow-lg transition-all ${
                    isOutOfStock
                      ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-600/25 active:scale-95 cursor-pointer'
                  }`}
                >
                  {isOutOfStock ? 'Unavailable' : `Pay ₹${priceRupees} (${paymentMethod})`}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
