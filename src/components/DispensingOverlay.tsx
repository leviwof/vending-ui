import { motion, AnimatePresence } from 'framer-motion';

type DispenseStep = 'IDLE' | 'MOTOR_STARTING' | 'DISPENSING_ITEM' | 'DOOR_OPENED' | 'COMPLETED';

type DispensingOverlayProps = {
  isOpen: boolean;
  step: DispenseStep;
  productName?: string;
};

export function DispensingOverlay({ isOpen, step, productName }: DispensingOverlayProps) {
  if (!isOpen || step === 'IDLE') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink/80 backdrop-blur-md"
        />

        {/* Animation Container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-[3rem] border border-white/30 bg-gradient-to-b from-ink to-slate-950 p-10 text-center text-white shadow-2xl"
        >
          {/* Step 1: Motor Starting */}
          {step === 'MOTOR_STARTING' && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center space-y-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-5xl border-2 border-emerald-500/50"
              >
                ⚙️
              </motion.div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
                  Step 1 / 3
                </span>
                <h3 className="mt-2 font-display text-3xl font-bold">Motor Starting</h3>
                <p className="mt-2 text-sm text-white/70">
                  Engaging vend motor coil for <strong className="text-white">{productName || 'selected item'}</strong>...
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Dispensing Item */}
          {step === 'DISPENSING_ITEM' && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center space-y-6"
            >
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/20 text-5xl border-2 border-indigo-500/50"
              >
                🥤
              </motion.div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">
                  Step 2 / 3
                </span>
                <h3 className="mt-2 font-display text-3xl font-bold">Dispensing</h3>
                <p className="mt-2 text-sm text-white/70">
                  Product dropping into dispense chute...
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Door Opening & Completed */}
          {(step === 'DOOR_OPENED' || step === 'COMPLETED') && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-5xl shadow-lg shadow-emerald-500/40"
              >
                🎉
              </motion.div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
                  Dispense Complete
                </span>
                <h3 className="mt-2 font-display text-3xl font-bold">Door Unlocked!</h3>
                <p className="mt-2 text-sm text-white/80">
                  Please collect your <strong className="text-emerald-400 font-bold">{productName || 'beverage'}</strong> from the tray. Enjoy!
                </p>
              </div>
            </motion.div>
          )}

          {/* Progress Bar */}
          <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500"
              initial={{ width: '0%' }}
              animate={{
                width:
                  step === 'MOTOR_STARTING'
                    ? '35%'
                    : step === 'DISPENSING_ITEM'
                      ? '70%'
                      : '100%',
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
