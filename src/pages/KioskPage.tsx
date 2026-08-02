import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AudioPlayerCard } from '../components/AudioPlayerCard';
import { ProductGrid } from '../components/ProductGrid';
import { ProductModal, Product } from '../components/ProductModal';
import { CoinPaymentModal } from '../components/CoinPaymentModal';
import { QRPaymentModal } from '../components/QRPaymentModal';
import { DispensingOverlay } from '../components/DispensingOverlay';
import { LiveTelemetryPanel } from '../components/LiveTelemetryPanel';
import { ActivityLogConsole } from '../components/ActivityLogConsole';
import { socket } from '../lib/socket';
import { api } from '../lib/api';
import { RootState } from '../store';
import {
  selectItem,
  setMachineState,
  setActivePaymentSession,
  setDispenseStep,
  updateTelemetry,
  addActivityLog,
  pushAlert,
  resetKioskSession,
} from '../store/slices/machineSlice';

export function KioskPage() {
  const dispatch = useDispatch();
  const machine = useSelector((state: RootState) => state.machine);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Fetch product catalog from backend API
  const fetchItems = async () => {
    try {
      const res = await api.get('/items');
      const formatted: Product[] = res.data.map((item: any) => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        priceCents: item.priceCents,
        imageUrl: item.imageUrl,
        quantity: item.inventory?.quantity ?? 0,
        calories: 140,
      }));
      setProducts(formatted);
    } catch (e) {
      console.error('Failed to load items:', e);
      dispatch(pushAlert('Failed to connect to backend items API'));
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Socket.IO event handling
  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      dispatch(updateTelemetry({ socketConnected: true, isOnline: true }));
      dispatch(addActivityLog({ message: 'Connected to IoT Telemetry Gateway (Socket.IO)', type: 'info' }));
    };

    const handleDisconnect = () => {
      dispatch(updateTelemetry({ socketConnected: false }));
      dispatch(addActivityLog({ message: 'Disconnected from Telemetry Gateway', type: 'error' }));
    };

    const handleMachineStateChanged = ({ state, event }: { state: string; event?: string }) => {
      dispatch(setMachineState(state));
      dispatch(addActivityLog({ message: `Machine State Changed: ${state} (${event || 'internal'})`, type: 'info' }));
    };

    const handleCoinInserted = ({ insertedRupees }: { insertedRupees: number }) => {
      dispatch(addActivityLog({ message: `Coin Inserted: ₹${insertedRupees}`, type: 'success' }));
    };

    const handlePaymentSuccess = ({ method, amountCents }: { method: string; amountCents: number }) => {
      dispatch(addActivityLog({ message: `Payment Successful! ₹${amountCents / 100} (${method})`, type: 'success' }));
      setIsCoinModalOpen(false);
      setIsQRModalOpen(false);
    };

    const handlePaymentFailed = ({ reason }: { reason?: string }) => {
      dispatch(addActivityLog({ message: `Payment Failed: ${reason || 'Transaction error'}`, type: 'error' }));
      dispatch(pushAlert('Payment Failed. Refund initiated.'));
      handleCancelSession();
    };

    const handleDispensingStarted = () => {
      dispatch(setDispenseStep('MOTOR_STARTING'));
      dispatch(addActivityLog({ message: 'Vend Motor Starting (Coil Engaged)', type: 'warning' }));
    };

    const handleDispensingInProgress = () => {
      dispatch(setDispenseStep('DISPENSING_ITEM'));
      dispatch(addActivityLog({ message: 'Item Dispensing into Chute...', type: 'warning' }));
    };

    const handleDispensingCompleted = ({ itemName }: { itemName?: string }) => {
      dispatch(setDispenseStep('DOOR_OPENED'));
      dispatch(addActivityLog({ message: `Item Dispensed: ${itemName || 'Product'} (Door Unlocked)`, type: 'success' }));
      fetchItems();

      setTimeout(() => {
        dispatch(setDispenseStep('IDLE'));
        handleCancelSession();
        dispatch(addActivityLog({ message: 'Session Completed. Kiosk Ready.', type: 'info' }));
      }, 2500);
    };

    const handleInventoryUpdated = ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === itemId ? { ...p, quantity } : p)),
      );
      dispatch(addActivityLog({ message: `Inventory Updated (Qty: ${quantity})`, type: 'info' }));
    };

    const handleTemperatureUpdated = ({ celsius }: { celsius: number }) => {
      dispatch(updateTelemetry({ temperature: celsius }));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('machine.state.changed', handleMachineStateChanged);
    socket.on('coin.inserted', handleCoinInserted);
    socket.on('payment.success', handlePaymentSuccess);
    socket.on('payment.failed', handlePaymentFailed);
    socket.on('dispensing.started', handleDispensingStarted);
    socket.on('dispensing.in_progress', handleDispensingInProgress);
    socket.on('dispensing.completed', handleDispensingCompleted);
    socket.on('inventory.updated', handleInventoryUpdated);
    socket.on('temperature.updated', handleTemperatureUpdated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('machine.state.changed', handleMachineStateChanged);
      socket.off('coin.inserted', handleCoinInserted);
      socket.off('payment.success', handlePaymentSuccess);
      socket.off('payment.failed', handlePaymentFailed);
      socket.off('dispensing.started', handleDispensingStarted);
      socket.off('dispensing.in_progress', handleDispensingInProgress);
      socket.off('dispensing.completed', handleDispensingCompleted);
      socket.off('inventory.updated', handleInventoryUpdated);
      socket.off('temperature.updated', handleTemperatureUpdated);
      socket.disconnect();
    };
  }, [dispatch]);

  // Cancel / Reset Session Handler
  const handleCancelSession = () => {
    setIsCoinModalOpen(false);
    setIsQRModalOpen(false);
    setSelectedProduct(null);
    dispatch(resetKioskSession());
  };

  // Product Selection
  const handleSelectProduct = (product: Product) => {
    if ((product.quantity ?? 0) <= 0) {
      dispatch(pushAlert('Product is out of stock'));
      dispatch(addActivityLog({ message: `Out of Stock clicked: ${product.name}`, type: 'warning' }));
      return;
    }
    setSelectedProduct(product);
    dispatch(selectItem(product.id));
    dispatch(addActivityLog({ message: `Product Selected: ${product.name} (₹${product.priceCents / 100})`, type: 'info' }));
  };

  // Payment Proceed
  const handleProceedPayment = async (product: Product, method: 'COIN' | 'QR') => {

    try {
      const res = await api.post('/payment/create', {
        itemId: product.id,
        method,
        idempotencyKey: `IDEM-${Date.now()}-${Math.random()}`,
        machineId: 'MUM-014',
      });

      const paymentSession = {
        id: res.data.id,
        method,
        itemId: product.id,
        amountCents: product.priceCents,
        insertedRupees: 0,
      };

      dispatch(setActivePaymentSession(paymentSession));

      if (method === 'COIN') {
        setIsCoinModalOpen(true);
      } else {
        setIsQRModalOpen(true);
      }
    } catch (e: any) {
      console.error(e);
      dispatch(pushAlert(e.response?.data?.message || 'Failed to initiate payment session'));
      dispatch(addActivityLog({ message: 'Payment Session Creation Failed', type: 'error' }));
    }
  };

  // Coin insertion handler
  const handleInsertCoin = async (denomRupees: number) => {
    if (!machine.activePaymentSession) return;
    try {
      await api.post('/coin/payment', {
        paymentId: machine.activePaymentSession.id,
        insertedAmountRupees: denomRupees,
      });
    } catch (e: any) {
      console.error(e);
      dispatch(pushAlert('Coin acceptor timeout or communication error'));
    }
  };

  // QR verification handler
  const handleVerifyQR = async (paymentId: string) => {
    try {
      await api.post('/payment/verify', { paymentId });
    } catch (e: any) {
      console.error(e);
      dispatch(pushAlert('QR verification failed'));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row">
      {/* Main Kiosk Product Catalog Section */}
      <section className="flex-1 rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur-md">
        {/* State Machine Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mist/80 pb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-ink/50">Smart vending kiosk</div>
            <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">Touchless Checkout Fleet</h1>
          </div>

          {/* State Machine Indicator Pill */}
          <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/90 px-4 py-2 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/40">State:</span>
            <span
              className={`rounded-xl px-3 py-1 font-mono text-xs font-extrabold shadow-xs ${
                machine.machineState === 'IDLE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : machine.machineState === 'PAYMENT_PENDING'
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : machine.machineState === 'DISPENSING'
                      ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                      : machine.machineState === 'SUCCESS'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-100 text-rose-800'
              }`}
            >
              {machine.machineState}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          <ProductGrid products={products} onSelect={handleSelectProduct} />
        </div>
      </section>

      {/* Right Sidebar: Telemetry, Audio, and Console Logs */}
      <aside className="w-full max-w-md space-y-6">
        <AudioPlayerCard machineState={machine.machineState} />
        <LiveTelemetryPanel telemetry={machine.telemetry} machineState={machine.machineState} />
        <ActivityLogConsole logs={machine.activityLogs} />
      </aside>

      {/* Product Details Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => {
          handleCancelSession();
          dispatch(addActivityLog({ message: 'Product Details Modal Closed', type: 'info' }));
        }}
        onProceedPayment={handleProceedPayment}
      />

      {/* Coin Payment Modal */}
      <CoinPaymentModal
        isOpen={isCoinModalOpen}
        requiredAmountRupees={
          selectedProduct ? Math.round(selectedProduct.priceCents / 100) : 0
        }
        onInsertCoin={handleInsertCoin}
        onCancel={() => {
          handleCancelSession();
          dispatch(addActivityLog({ message: 'Coin Payment Session Cancelled', type: 'warning' }));
        }}
      />

      {/* QR Code Payment Modal */}
      <QRPaymentModal
        isOpen={isQRModalOpen}
        amountRupees={
          selectedProduct ? Math.round(selectedProduct.priceCents / 100) : 0
        }
        paymentId={machine.activePaymentSession?.id || ''}
        onVerifyQR={handleVerifyQR}
        onCancel={() => {
          handleCancelSession();
          dispatch(addActivityLog({ message: 'QR Payment Session Cancelled', type: 'warning' }));
        }}
      />

      {/* Multi-Stage Dispensing Animation Overlay */}
      <DispensingOverlay
        isOpen={machine.dispenseStep !== 'IDLE'}
        step={machine.dispenseStep}
        productName={selectedProduct?.name}
      />
    </main>
  );
}
