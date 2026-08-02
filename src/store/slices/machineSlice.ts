import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ActivityLog = {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
};

export type TelemetryData = {
  temperature: number;
  isOnline: boolean;
  socketConnected: boolean;
  redisConnected: boolean;
  motorHealthy: boolean;
  doorOpen: boolean;
  coinAcceptor: string;
  qrScanner: string;
};

export type ActivePaymentSession = {
  id: string;
  method: 'COIN' | 'QR';
  itemId: string;
  amountCents: number;
  insertedRupees: number;
};

type MachineState = {
  selectedItemId?: string;
  machineState: string; // IDLE | ITEM_SELECTED | PAYMENT_PENDING | PAYMENT_SUCCESS | DISPENSING | SUCCESS | FAILED | OUT_OF_STOCK
  activePaymentSession?: ActivePaymentSession;
  dispenseStep: 'IDLE' | 'MOTOR_STARTING' | 'DISPENSING_ITEM' | 'DOOR_OPENED' | 'COMPLETED';
  telemetry: TelemetryData;
  activityLogs: ActivityLog[];
  alerts: string[];
};

const initialState: MachineState = {
  machineState: 'IDLE',
  dispenseStep: 'IDLE',
  telemetry: {
    temperature: 4.5,
    isOnline: true,
    socketConnected: true,
    redisConnected: true,
    motorHealthy: true,
    doorOpen: false,
    coinAcceptor: 'READY',
    qrScanner: 'READY',
  },
  activityLogs: [
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: 'Kiosk Initialized & Ready',
      type: 'info',
    },
  ],
  alerts: [],
};

const machineSlice = createSlice({
  name: 'machine',
  initialState,
  reducers: {
    selectItem(state, action: PayloadAction<string | undefined>) {
      state.selectedItemId = action.payload;
      if (action.payload) {
        state.machineState = 'ITEM_SELECTED';
      } else if (state.machineState === 'ITEM_SELECTED') {
        state.machineState = 'IDLE';
      }
    },
    setMachineState(state, action: PayloadAction<string>) {
      state.machineState = action.payload;
    },
    setActivePaymentSession(state, action: PayloadAction<ActivePaymentSession | undefined>) {
      state.activePaymentSession = action.payload;
      if (action.payload) {
        state.machineState = 'PAYMENT_PENDING';
      }
    },
    updateInsertedCoins(state, action: PayloadAction<number>) {
      if (state.activePaymentSession) {
        state.activePaymentSession.insertedRupees += action.payload;
      }
    },
    setDispenseStep(state, action: PayloadAction<MachineState['dispenseStep']>) {
      state.dispenseStep = action.payload;
    },
    updateTelemetry(state, action: PayloadAction<Partial<TelemetryData>>) {
      state.telemetry = { ...state.telemetry, ...action.payload };
    },
    addActivityLog(
      state,
      action: PayloadAction<{ message: string; type?: ActivityLog['type'] }>,
    ) {
      const newLog: ActivityLog = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
      state.activityLogs.unshift(newLog);
      state.activityLogs = state.activityLogs.slice(0, 50);
    },
    pushAlert(state, action: PayloadAction<string>) {
      state.alerts.unshift(action.payload);
      state.alerts = state.alerts.slice(0, 5);
    },
    dismissAlert(state, action: PayloadAction<number>) {
      state.alerts.splice(action.payload, 1);
    },
    resetKioskSession(state) {
      state.selectedItemId = undefined;
      state.activePaymentSession = undefined;
      state.dispenseStep = 'IDLE';
      state.machineState = 'IDLE';
    },
  },
});

export const {
  selectItem,
  setMachineState,
  setActivePaymentSession,
  updateInsertedCoins,
  setDispenseStep,
  updateTelemetry,
  addActivityLog,
  pushAlert,
  dismissAlert,
  resetKioskSession,
} = machineSlice.actions;

export default machineSlice.reducer;
