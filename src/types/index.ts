// Core types for the color testing application

export type Language = 'ar' | 'en';

export interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  description: string;
  description_ar: string;
  category: TestCategory;
  safety_level: SafetyLevel;
  preparation_time: number; // in minutes
  created_at: string;
  updated_at: string;
}

export interface ColorResult {
  id: string;
  test_id: string;
  color_result: string;
  color_result_ar: string;
  color_hex: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: ConfidenceLevel;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: string;
  user_id?: string;
  test_id: string;
  color_result_id: string;
  session_id: string;
  confidence_score: number;
  notes?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  preferred_language: Language;
  created_at: string;
  updated_at: string;
}

export interface TestSession {
  id: string;
  user_id?: string;
  test_id: string;
  status: SessionStatus;
  started_at: string;
  completed_at?: string;
  results?: TestResult[];
}

export type TestCategory = 
  | 'basic' 
  | 'advanced' 
  | 'specialized';

export type SafetyLevel = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'extreme';

export type ConfidenceLevel = 
  | 'very_low' 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'very_high';

export type UserRole = 
  | 'user' 
  | 'admin' 
  | 'super_admin';

export type SessionStatus = 
  | 'started' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface TestInstructions {
  id: string;
  test_id: string;
  step_number: number;
  instruction: string;
  instruction_ar: string;
  safety_warning?: string;
  safety_warning_ar?: string;
  image_url?: string;
}

export interface AdminStats {
  total_tests: number;
  total_results: number;
  total_users: number;
  tests_by_category: Record<TestCategory, number>;
  results_by_confidence: Record<ConfidenceLevel, number>;
  recent_activity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

// UI Component Props
export interface TestCardProps {
  test: ChemicalTest;
  language: Language;
  onClick: (testId: string) => void;
  disabled?: boolean;
}

export interface ColorOptionProps {
  colorResult: ColorResult;
  language: Language;
  selected?: boolean;
  onClick: (colorResultId: string) => void;
}

export interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  preferredLanguage: Language;
}

export interface TestFormData {
  testId: string;
  colorResultId: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

// Notification types
export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Export utility types
export type Locale = {
  [key: string]: string | string[] | Locale | any;
};

export type TranslationKey = string;

export interface I18nConfig {
  defaultLanguage: Language;
  supportedLanguages: Language[];
  fallbackLanguage: Language;
}
