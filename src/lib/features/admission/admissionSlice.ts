import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export interface ApplicantProfile {
  id?: string;
  userId?: string;
  applicantId?: string; // Added for compatibility
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  stateOfOrigin?: string;
  lga?: string;
  address?: string;
  passportUrl?: string;
  nameOfGuardian?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  nextOfKin?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  nextOfKinEmail?: string;
}

export interface Message {
  id: string;
  applicationId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface RequiredDocument {
  id: string;
  documentName: string;
  fileUrl: string;
  isVerified: boolean;
}

export interface AcademicResult {
  id: string;
  resultType: string;
  details: unknown;
}

export interface Application {
  id: string;
  applicantId: string;
  applicationNumber: string;
  programmeId?: string;
  facultyId?: string;
  sessionId?: string;
  entryMode?: string;
  status: string;
  editRequested: boolean;
  modificationNote?: string;
  editRequestReason?: string;
  admissionLetterUrl?: string;
  documents?: RequiredDocument[];
  academicResults?: AcademicResult[];
  session?: {
    academicSessionName: string;
    isActive: boolean;
  };
}

interface ApplicationSession {
  id: string;
  academicSessionName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface AdmissionState {
  profile: ApplicantProfile | null;
  application: Application | null;
  applications: Application[];
  activeSession: ApplicationSession | null;
  activeSessionFetched: boolean;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  messages: Record<string, Message[]>;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

const initialState: AdmissionState = {
  profile: null,
  application: null,
  applications: [],
  activeSession: null,
  activeSessionFetched: false,
  loading: false,
  profileLoading: false,
  error: null,
  messages: {},
};

export const fetchAdmissionProfile = createAsyncThunk(
  'admission/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admission/me');
      return response.data; // { profile, application, alert }
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch profile';
      return rejectWithValue(errorMessage);
    }
  }
);

export const initializeApplication = createAsyncThunk(
  'admission/initializeApplication',
  async (data: { programId: string; facultyId: string; entryMode?: string; sessionId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/admission/application', data);
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize application';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateApplication = createAsyncThunk(
  'admission/updateApplication',
  async (data: { id?: string; programId: string; facultyId: string; entryMode?: string; sessionId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put('/admission/application', data);
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update application';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchActiveSession = createAsyncThunk(
  'admission/fetchActiveSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admission/sessions/active');
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      // 404 means no active session, which is valid (just closed)
      if (error.response?.status === 404) {
          return null;
      }
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch active session';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateAdmissionProfile = createAsyncThunk(
  'admission/updateProfile',
  async (profileData: Partial<ApplicantProfile>, { rejectWithValue }) => {
    try {
      const response = await api.post('/admission/profile', profileData);
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      return rejectWithValue(errorMessage);
    }
  }
);

export const uploadPassport = createAsyncThunk(
  'admission/uploadPassport',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentName', 'Passport Photograph');
      
      const response = await api.post('/admission/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.fileUrl;
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload passport';
      return rejectWithValue(errorMessage);
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'admission/uploadDocument',
  async ({ file, documentName, applicationId }: { file: File; documentName: string; applicationId?: string }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentName', documentName);
      if (applicationId) formData.append('applicationId', applicationId);
      
      const response = await api.post('/admission/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data; // Returns the updated/created RequiredDocument object
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload document';
      return rejectWithValue(errorMessage);
    }
  }
);

export const saveAcademicResults = createAsyncThunk(
  'admission/saveAcademicResults',
  async ({ results, applicationId }: { results: Record<string, unknown>[]; applicationId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/admission/academic-results', { results, applicationId });
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save academic results';
      return rejectWithValue(errorMessage);
    }
  }
);

export const submitApplication = createAsyncThunk(
  'admission/submitApplication',
  async (applicationId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await api.post('/admission/submit', { applicationId });
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit application';
      return rejectWithValue(errorMessage);
    }
  }
);

export const requestEditAccess = createAsyncThunk(
  'admission/requestEditAccess',
  async ({ reason, applicationId }: { reason: string; applicationId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/admission/request-edit', { reason, applicationId });
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to request edit access';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'admission/fetchMessages',
  async (applicationId: string | undefined, { rejectWithValue }) => {
    try {
      // Use Communication Service via Gateway
      const query = applicationId ? `?applicationId=${applicationId}` : '';
      console.log('Fetching messages with query:', query);
      const response = await api.get(`/messages${query}`);
      return { applicationId: applicationId || 'general', messages: response.data };
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch messages';
      return rejectWithValue(errorMessage);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'admission/sendMessage',
  async ({ applicationId, content, receiverId }: { applicationId?: string; content: string; receiverId?: string }, { rejectWithValue }) => {
    try {
      // Default receiver to ADMISSION_OFFICE if not specified
      const finalReceiver = receiverId || 'ADMISSION_OFFICE'; 
      const response = await api.post(`/messages`, { 
        applicationId, 
        content,
        receiverId: finalReceiver
      });
      return { applicationId: applicationId || 'general', message: response.data };
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
      return rejectWithValue(errorMessage);
    }
  }
);

const admissionSlice = createSlice({
  name: 'admission',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setApplication: (state, action) => {
      state.application = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmissionProfile.pending, (state) => {
        state.loading = true;
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchAdmissionProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileLoading = false;
        state.profile = action.payload.profile;
        state.application = action.payload.application;
        state.applications = action.payload.applications || [];
      })
      .addCase(fetchAdmissionProfile.rejected, (state, action) => {
        state.loading = false;
        state.profileLoading = false;
        state.error = action.payload as string;
      })
      .addCase(initializeApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.application = action.payload;
        state.applications.unshift(action.payload);
      })
      .addCase(initializeApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.loading = false;
        // Merge with existing application state to preserve fields not returned by the update
        if (state.application) {
            state.application = { ...state.application, ...action.payload };
        } else {
            state.application = action.payload;
        }
        
        const index = state.applications.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
            state.applications[index] = { ...state.applications[index], ...action.payload };
        }
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchActiveSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSession.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = action.payload;
        state.activeSessionFetched = true;
      })
      .addCase(fetchActiveSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.activeSessionFetched = true;
      })
      .addCase(updateAdmissionProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmissionProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateAdmissionProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveAcademicResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveAcademicResults.fulfilled, (state, action) => {
        state.loading = false;
        if (state.application) {
            state.application.academicResults = action.payload;
        }
      })
      .addCase(saveAcademicResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        if (state.application) {
          if (!state.application.documents) {
            state.application.documents = [];
          }
          // Check if document already exists and update it, otherwise add new
          const index = state.application.documents.findIndex(d => d.id === action.payload.id);
          if (index !== -1) {
            state.application.documents[index] = action.payload;
          } else {
            state.application.documents.push(action.payload);
          }
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadPassport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPassport.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.passportUrl = action.payload;
        }
      })
      .addCase(uploadPassport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.application = action.payload;
        const index = state.applications.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
            state.applications[index] = action.payload;
        }
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(requestEditAccess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestEditAccess.fulfilled, (state, action) => {
        state.loading = false;
        if (state.application) {
            state.application = { ...state.application, ...action.payload };
        } else {
            state.application = action.payload;
        }

        const index = state.applications.findIndex(app => app.id === action.payload.id);
        if (index !== -1) {
            state.applications[index] = { ...state.applications[index], ...action.payload };
        }
      })
      .addCase(requestEditAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessages.pending, () => {})
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { applicationId, messages } = action.payload;
        state.messages[applicationId] = messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { applicationId, message } = action.payload;
        if (!state.messages[applicationId]) {
            state.messages[applicationId] = [];
        }
        state.messages[applicationId].push(message);
      });
  },
});

export const { clearError, setApplication } = admissionSlice.actions;
export default admissionSlice.reducer;
