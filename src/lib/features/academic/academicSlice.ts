import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// Types
export interface Faculty {
  id: string;
  name: string;
  code: string;
  departments?: Department[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  programs?: Program[];
}

export interface ProgramLevel {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  programLevelId: string;
  programLevel?: ProgramLevel;
  entryMode: string[]; // ["UTME", "DIRECT_ENTRY"]
  isActive: boolean;
}

export interface ProgramRequirement {
  id: string;
  programId: string;
  entryMode: string | null;
  programType: string | null;
  requiresJamb: boolean;
  requiresTranscript: boolean;
  minOLevelCredits: number;
  requiredDocuments: string[];
  specificRequirements: unknown; // Json
}

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  semester?: 'FIRST' | 'SECOND' | string;
  isCurrent: boolean;
}

interface AcademicState {
  faculties: Faculty[];
  departments: Department[]; // Optional: if we want to store all fetched departments
  programs: Program[]; // Programs for the selected context
  sessions: AcademicSession[];
  currentRequirement: ProgramRequirement | null;
  loading: boolean;
  error: string | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const initialState: AcademicState = {
  faculties: [],
  departments: [],
  programs: [],
  sessions: [],
  currentRequirement: null,
  loading: false,
  error: null,
};

// Async Thunks

export const fetchFaculties = createAsyncThunk(
  'academic/fetchFaculties',
  async (_, { rejectWithValue }) => {
    try {
      // Gateway proxies /api/faculties -> Academic Service
      const response = await api.get('/faculties');
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch faculties');
    }
  }
);

export const fetchPrograms = createAsyncThunk(
  'academic/fetchPrograms',
  async (_, { rejectWithValue }) => {
    try {
      // Gateway proxies /api/programs -> Academic Service (Global Search)
      const response = await api.get('/programs');
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch programs');
    }
  }
);

export const fetchProgramsByFaculty = createAsyncThunk(
  'academic/fetchProgramsByFaculty',
  async (facultyId: string, { rejectWithValue }) => {
    try {
      // Gateway proxies /api/programs -> Academic Service
      // Academic Service has GET /api/faculties/:facultyId/programs
      const response = await api.get(`/faculties/${facultyId}/programs`);
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch programs');
    }
  }
);

export const fetchProgramRequirements = createAsyncThunk(
  'academic/fetchProgramRequirements',
  async ({ programId, entryMode }: { programId: string; entryMode: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/programs/${programId}/requirements?entryMode=${entryMode}`);
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch requirements');
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'academic/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/sessions');
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch sessions');
    }
  }
);

const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPrograms: (state) => {
      state.programs = [];
    },
    clearSessions: (state) => {
      state.sessions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Faculties
      .addCase(fetchFaculties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaculties.fulfilled, (state, action) => {
        state.loading = false;
        state.faculties = action.payload;
      })
      .addCase(fetchFaculties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch All Programs (Global)
      .addCase(fetchPrograms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = action.payload;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Programs By Faculty
      .addCase(fetchProgramsByFaculty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgramsByFaculty.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = action.payload;
      })
      .addCase(fetchProgramsByFaculty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Requirements
      .addCase(fetchProgramRequirements.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentRequirement = null;
      })
      .addCase(fetchProgramRequirements.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequirement = action.payload;
      })
      .addCase(fetchProgramRequirements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearPrograms, clearSessions } = academicSlice.actions;
export default academicSlice.reducer;
