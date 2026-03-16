import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export interface Fee {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description?: string;
  mandatory: boolean;
  type: string; // TUITION, ACCEPTANCE, etc.
  programId?: string;
  facultyId?: string;
  departmentId?: string;
  level?: string;
  semester?: string;
  sessionId?: string;
}

export interface PaymentItem {
  feeId?: string;
  name: string;
  amount: number;
}

export interface Payment {
  id: string;
  reference: string;
  amount: number;
  status: 'PENDING' | 'SUCCESSFUL' | 'SUCCESS' | 'FAILED' | 'ABANDONED' | 'COMPLETED' | 'PAID';
  feeId?: string;
  fee?: Fee;
  items?: PaymentItem[];
  createdAt: string;
  percentagePaid?: number;
  balanceDue?: number;
  channel?: string;
  proofUrl?: string;
}

interface PaymentState {
  fees: Fee[];
  payments: Payment[];
  loading: boolean;
  actionLoading: boolean; // For initiate/verify actions
  error: string | null;
  paymentUrl: string | null; // For redirecting to gateway
  verificationStatus: 'idle' | 'verifying' | 'success' | 'failed' | 'pending';
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const initialState: PaymentState = {
  fees: [],
  payments: [],
  loading: false,
  actionLoading: false,
  error: null,
  paymentUrl: null,
  verificationStatus: 'idle',
};

// Async Thunks

export const fetchFees = createAsyncThunk(
  'payment/fetchFees',
  async (programId: string | undefined, { rejectWithValue }) => {
    try {
      // If programId is provided, fetch fees for that program
      // Otherwise fetch generic fees or all fees
      const url = programId ? `/fees/program/${programId}` : '/fees';
      const response = await api.get(url);
      return response.data.data || response.data; // Handle potential wrapper
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch fees');
    }
  }
);

export const fetchAllFees = createAsyncThunk(
  'payment/fetchAllFees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/fees');
      return response.data.data || response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch fees');
    }
  }
);

export const fetchMyPayments = createAsyncThunk(
  'payment/fetchMyPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/my-payments');
      return response.data.data || response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch payments');
    }
  }
);

interface InitiatePaymentPayload {
  feeId?: string; // Single fee
  items?: { name: string; amount: number }[]; // Or custom items if allowed
  amount: number;
  percentagePaid?: number;
  percent?: number;
  redirectUrl: string;
  programId?: string;
  sessionId?: string;
  level?: string;
  semester?: string;
  channel?: string; // 'paystack' | 'flutterwave' | 'globalpay'
  studentEmail?: string;
  studentName?: string;
  phoneNumber?: string;
  address?: string;
  applicantId?: string;
  applicationId?: string;
  userId?: string;
}

export const initiatePayment = createAsyncThunk(
  'payment/initiatePayment',
  async (payload: InitiatePaymentPayload, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/initiate', payload);
      return response.data.data || response.data; // Should return authorization_url
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to initiate payment');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async (reference: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payments/verify/${reference}`, { params: { gateway: 'global' } });
      return response.data.data || response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Payment verification failed');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentUrl: (state) => {
      state.paymentUrl = null;
    },
    resetVerificationStatus: (state) => {
      state.verificationStatus = 'idle';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Fees
    builder.addCase(fetchFees.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFees.fulfilled, (state, action) => {
      state.loading = false;
      state.fees = action.payload;
    });
    builder.addCase(fetchFees.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchAllFees.fulfilled, (state, action) => {
      const byId = new Map<string, Fee>();
      [...state.fees, ...(action.payload as Fee[])].forEach((f: Fee) => {
        byId.set(f.id, f);
      });
      state.fees = Array.from(byId.values());
    });
    builder.addCase(fetchAllFees.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Fetch My Payments
    builder.addCase(fetchMyPayments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyPayments.fulfilled, (state, action) => {
      state.loading = false;
      state.payments = action.payload;
    });
    builder.addCase(fetchMyPayments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Initiate Payment
    builder.addCase(initiatePayment.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(initiatePayment.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.paymentUrl = action.payload.authorization_url || action.payload.link || action.payload.checkoutUrl || null;
    });
    builder.addCase(initiatePayment.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // Verify Payment
    builder.addCase(verifyPayment.pending, (state) => {
      state.verificationStatus = 'verifying';
      state.error = null;
    });
    builder.addCase(verifyPayment.fulfilled, (state, action) => {
      const payload = action.payload as { status?: string; payment?: { status?: string }; data?: { status?: string }; responseMessage?: string; message?: string };
      const statusRaw =
        (payload?.status ||
          payload?.payment?.status ||
          payload?.data?.status ||
          '').toString().toUpperCase();
      if (statusRaw === 'SUCCESSFUL' || statusRaw === 'SUCCESS') {
        state.verificationStatus = 'success';
      } else if (statusRaw === 'FAILED' || statusRaw === 'ABANDONED' || statusRaw === 'DECLINED') {
        state.verificationStatus = 'failed';
        state.error = 'Payment failed or was abandoned.';
      } else {
        // Pending/unknown: show non-blocking state with retry guidance
        state.verificationStatus = 'pending';
        state.error =
          (payload?.responseMessage ||
            payload?.message ||
            'Payment not confirmed yet. Reconciliation may update automatically later. You can retry verification now.');
      }
    });
    builder.addCase(verifyPayment.rejected, (state, action) => {
      state.verificationStatus = 'failed';
      state.error = action.payload as string;
    });
  },
});

export const { clearPaymentUrl, resetVerificationStatus, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
