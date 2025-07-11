// Supabase configuration (optional - not required for core functionality)
// إعدادات Supabase (اختيارية - غير مطلوبة للوظائف الأساسية)

// Note: Supabase is optional for this application
// ملاحظة: Supabase اختياري لهذا التطبيق

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Mock Supabase client for when Supabase is not configured
// عميل Supabase وهمي عندما لا يكون Supabase مكوناً
const mockSupabaseClient = {
  auth: {
    signUp: () => Promise.resolve({ data: null, error: null }),
    signIn: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
};

// Export mock clients for compatibility
// تصدير عملاء وهميين للتوافق
export const createClientSupabase = () => mockSupabaseClient;
export const createServerSupabase = () => mockSupabaseClient;
export const supabase = mockSupabaseClient;

// Admin client (mock)
export const createAdminSupabase = () => mockSupabaseClient;

// Database table names
export const TABLES = {
  CHEMICAL_TESTS: 'chemical_tests',
  COLOR_RESULTS: 'color_results',
  TEST_RESULTS: 'test_results',
  TEST_SESSIONS: 'test_sessions',
  TEST_INSTRUCTIONS: 'test_instructions',
  USERS: 'users',
  ACTIVITY_LOGS: 'activity_logs',
} as const;

// RLS Policies helper functions
export const RLS_POLICIES = {
  // Users can only see their own data
  USER_OWN_DATA: 'user_own_data',
  // Admins can see all data
  ADMIN_ALL_DATA: 'admin_all_data',
  // Public read access for chemical tests and color results
  PUBLIC_READ_TESTS: 'public_read_tests',
  // Authenticated users can create test results
  AUTH_CREATE_RESULTS: 'auth_create_results',
} as const;

// Helper function to check if user is admin (mock)
export const isAdmin = async (userId: string): Promise<boolean> => {
  // Mock implementation - always returns false for demo
  return false;
};

// Helper function to get user profile (mock)
export const getUserProfile = async (userId: string) => {
  // Mock implementation
  return { id: userId, name: 'Demo User', role: 'user' };
};

// Helper function to log activity (mock)
export const logActivity = async (
  userId: string | null,
  action: string,
  details: Record<string, any> = {}
) => {
  // Mock implementation - just log to console
  console.log('Activity logged:', { userId, action, details });
};

// All helper functions return mock data for demo purposes
// جميع الدوال المساعدة ترجع بيانات وهمية لأغراض العرض

export const getChemicalTestsWithResults = async () => [];
export const createTestSession = async (userId: string | null, testId: string) => ({ id: 'mock-session', userId, testId });
export const completeTestSession = async (sessionId: string, colorResultId: string, confidenceScore: number, notes?: string) => ({ id: 'mock-result', sessionId, colorResultId, confidenceScore, notes });

// Export default client for backward compatibility
export default createClientSupabase;
