import { motion } from 'framer-motion';
import { Product } from './ProductModal';

type ProductGridProps = {
  products: Product[];
  onSelect: (product: Product) => void;
};

export function ProductGrid({ products, onSelect }: ProductGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => {
        const isOutOfStock = (product.quantity ?? 0) <= 0;
        const priceRupees = (product.priceCents / 100).toFixed(0);

        return (
          <motion.button
            key={product.id}
            type="button"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={!isOutOfStock ? { y: -4, scale: 1.02 } : undefined}
            whileTap={!isOutOfStock ? { scale: 0.98 } : undefined}
            onClick={() => onSelect(product)}
            className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 text-left transition-all ${
              isOutOfStock
                ? 'cursor-not-allowed border-gray-200 bg-gray-100/80 opacity-60 grayscale'
                : 'border-white/80 bg-white/90 shadow-lg hover:border-emerald-500/40 hover:shadow-xl'
            }`}
          >
            {/* Product Image Thumbnail */}
            <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl bg-mist/60">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <span className="text-4xl">🥤</span>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/75 backdrop-blur-xs">
                  <span className="rounded-full bg-rose-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
                    Out Of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">
                  {product.sku || 'ITEM'}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isOutOfStock
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isOutOfStock ? '0 Left' : `${product.quantity} left`}
                </span>
              </div>

              <h3 className="mt-1 font-display text-lg font-bold text-ink">{product.name}</h3>

              <div className="mt-4 flex items-center justify-between border-t border-mist/80 pt-3">
                <span className="font-display text-xl font-extrabold text-emerald-600">
                  ₹{priceRupees}
                </span>
                <span
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-ink text-white shadow-md'
                  }`}
                >
                  {isOutOfStock ? 'Restock Required' : 'Select Item →'}
                </span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
