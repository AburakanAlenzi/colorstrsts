import { Language } from '@/types';
import {
  getChemicalTestsLocal,
  getColorResultsLocal,
  initializeLocalStorage,
  ChemicalTest as LocalChemicalTest,
  ColorResult as LocalColorResult
} from '@/lib/local-data-service';

// Types for local data
export interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  description: string;
  description_ar: string;
  category: 'basic' | 'advanced' | 'specialized';
  safety_level: 'low' | 'medium' | 'high' | 'extreme';
  preparation_time: number;
  icon: string;
  color_primary: string;
  created_at: string;
  prepare?: string;
  prepare_ar?: string;
  test_type?: string;
  test_number?: string;
  reference?: string;
}

export interface ColorResult {
  id: string;
  test_id: string;
  color_result: string;
  color_result_ar: string;
  color_hex: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
}

export interface TestInstruction {
  id: string;
  test_id: string;
  step_number: number;
  instruction: string;
  instruction_ar: string;
  safety_warning?: string;
  safety_warning_ar?: string;
  icon: string;
}

export interface TestResult {
  id: string;
  test_id: string;
  color_result_id: string;
  confidence_score: number;
  notes?: string;
  timestamp: string;
  session_id: string;
}

export interface TestSession {
  id: string;
  test_id: string;
  status: 'started' | 'in_progress' | 'completed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  results: TestResult[];
}

// Local storage keys
const STORAGE_KEYS = {
  TEST_RESULTS: 'color_testing_results',
  TEST_SESSIONS: 'color_testing_sessions',
  USER_PREFERENCES: 'color_testing_preferences',
  ADMIN_DATA: 'color_testing_admin_data',
} as const;

// Data Service Class
export class DataService {
  // Initialize localStorage if needed
  private static ensureInitialized(): void {
    if (typeof window !== 'undefined') {
      try {
        initializeLocalStorage();
      } catch (error) {
        console.warn('Failed to initialize localStorage:', error);
      }
    }
  }

  // Get all chemical tests
  static getChemicalTests(): ChemicalTest[] {
    this.ensureInitialized();
    try {
      const localTests = getChemicalTestsLocal();
      return localTests.map(test => ({
        ...test,
        category: test.category || 'basic',
        safety_level: test.safety_level || 'medium',
        preparation_time: test.preparation_time || 10,
        icon: test.icon || 'BeakerIcon',
        color_primary: test.color_primary || '#3B82F6',
        created_at: test.created_at || new Date().toISOString()
      })) as ChemicalTest[];
    } catch (error) {
      console.error('Error loading chemical tests:', error);
      return [];
    }
  }

  // Get chemical test by ID
  static getChemicalTestById(id: string): ChemicalTest | null {
    const tests = this.getChemicalTests();
    return tests.find(test => test.id === id) || null;
  }

  // Get chemical tests by category
  static getChemicalTestsByCategory(category: string): ChemicalTest[] {
    const tests = this.getChemicalTests();
    return tests.filter(test => test.category === category);
  }

  // Get all color results
  static getColorResults(): ColorResult[] {
    this.ensureInitialized();
    try {
      const localColorResults = getColorResultsLocal();
      return localColorResults.map(result => ({
        id: result.color_hex || Math.random().toString(36).substr(2, 9),
        test_id: result.test_id || '',
        hex_code: result.color_hex || '#000000',
        color_name: {
          ar: result.color_result_ar || result.color_result || '',
          en: result.color_result || ''
        },
        substances: {
          ar: typeof result.possible_substance_ar === 'string'
            ? result.possible_substance_ar.split(',').map(s => s.trim())
            : Array.isArray(result.possible_substance_ar)
            ? result.possible_substance_ar
            : [],
          en: typeof result.possible_substance === 'string'
            ? result.possible_substance.split(',').map(s => s.trim())
            : Array.isArray(result.possible_substance)
            ? result.possible_substance
            : []
        },
        confidence: this.getConfidenceNumber(result.confidence_level || 'medium'),
        confidence_level: result.confidence_level || 'medium'
      })) as ColorResult[];
    } catch (error) {
      console.error('Error loading color results:', error);
      return [];
    }
  }

  // Helper method to convert confidence level to number
  private static getConfidenceNumber(level: string): number {
    switch (level.toLowerCase()) {
      case 'very_high': return 95;
      case 'high': return 85;
      case 'medium': return 75;
      case 'low': return 60;
      case 'very_low': return 40;
      default: return 50;
    }
  }

  // Get color results by test ID
  static getColorResultsByTestId(testId: string): ColorResult[] {
    const results = this.getColorResults();
    return results.filter(result => result.test_id === testId);
  }

  // Get color result by ID
  static getColorResultById(id: string): ColorResult | null {
    const results = this.getColorResults();
    return results.find(result => result.id === id) || null;
  }

  // Get all test instructions
  static getTestInstructions(): TestInstruction[] {
    return testInstructionsData as TestInstruction[];
  }

  // Get test instructions by test ID
  static getTestInstructionsByTestId(testId: string): TestInstruction[] {
    const instructions = this.getTestInstructions();
    return instructions.filter(instruction => instruction.test_id === testId)
      .sort((a, b) => a.step_number - b.step_number);
  }

  // Generate unique ID
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Local Storage Operations
  static saveToLocalStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getFromLocalStorage<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  // Test Session Management
  static createTestSession(testId: string): TestSession {
    const session: TestSession = {
      id: this.generateId(),
      test_id: testId,
      status: 'started',
      started_at: new Date().toISOString(),
      results: [],
    };

    const sessions = this.getTestSessions();
    sessions.push(session);
    this.saveToLocalStorage(STORAGE_KEYS.TEST_SESSIONS, sessions);

    return session;
  }

  static getTestSessions(): TestSession[] {
    return this.getFromLocalStorage<TestSession[]>(STORAGE_KEYS.TEST_SESSIONS) || [];
  }

  static getTestSessionById(sessionId: string): TestSession | null {
    const sessions = this.getTestSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  static updateTestSession(sessionId: string, updates: Partial<TestSession>): TestSession | null {
    const sessions = this.getTestSessions();
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex === -1) return null;

    sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
    this.saveToLocalStorage(STORAGE_KEYS.TEST_SESSIONS, sessions);

    return sessions[sessionIndex];
  }

  static completeTestSession(
    sessionId: string, 
    colorResultId: string, 
    confidenceScore: number, 
    notes?: string
  ): TestResult | null {
    const session = this.getTestSessionById(sessionId);
    if (!session) return null;

    const result: TestResult = {
      id: this.generateId(),
      test_id: session.test_id,
      color_result_id: colorResultId,
      confidence_score: confidenceScore,
      notes,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
    };

    // Update session
    this.updateTestSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      results: [...session.results, result],
    });

    // Save result separately
    const results = this.getTestResults();
    results.push(result);
    this.saveToLocalStorage(STORAGE_KEYS.TEST_RESULTS, results);

    return result;
  }

  // Test Results Management
  static getTestResults(): TestResult[] {
    return this.getFromLocalStorage<TestResult[]>(STORAGE_KEYS.TEST_RESULTS) || [];
  }

  static getTestResultsByTestId(testId: string): TestResult[] {
    const results = this.getTestResults();
    return results.filter(result => result.test_id === testId);
  }

  static deleteTestResult(resultId: string): boolean {
    const results = this.getTestResults();
    const filteredResults = results.filter(result => result.id !== resultId);
    
    if (filteredResults.length === results.length) return false;

    this.saveToLocalStorage(STORAGE_KEYS.TEST_RESULTS, filteredResults);
    return true;
  }

  // User Preferences
  static getUserPreferences() {
    return this.getFromLocalStorage(STORAGE_KEYS.USER_PREFERENCES) || {
      language: 'ar' as Language,
      theme: 'light',
      notifications: true,
      autoSave: true,
    };
  }

  static saveUserPreferences(preferences: any): void {
    this.saveToLocalStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  // Admin Data Management
  static getAdminData() {
    return this.getFromLocalStorage(STORAGE_KEYS.ADMIN_DATA) || {
      customTests: [],
      customColorResults: [],
      customInstructions: [],
      settings: {},
    };
  }

  static saveAdminData(data: any): void {
    this.saveToLocalStorage(STORAGE_KEYS.ADMIN_DATA, data);
  }

  // Statistics and Analytics
  static getStatistics() {
    const results = this.getTestResults();
    const sessions = this.getTestSessions();
    const tests = this.getChemicalTests();

    const stats = {
      total_tests: tests.length,
      total_results: results.length,
      total_sessions: sessions.length,
      completed_sessions: sessions.filter(s => s.status === 'completed').length,
      tests_by_category: tests.reduce((acc, test) => {
        acc[test.category] = (acc[test.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      results_by_confidence: results.reduce((acc, result) => {
        const colorResult = this.getColorResultById(result.color_result_id);
        if (colorResult) {
          acc[colorResult.confidence_level] = (acc[colorResult.confidence_level] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      recent_activity: results
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10),
    };

    return stats;
  }

  // Search and Filter
  static searchTests(query: string, language: Language = 'ar'): ChemicalTest[] {
    const tests = this.getChemicalTests();
    const searchTerm = query.toLowerCase();

    return tests.filter(test => {
      const name = language === 'ar' ? test.method_name_ar : test.method_name;
      const description = language === 'ar' ? test.description_ar : test.description;
      
      return name.toLowerCase().includes(searchTerm) || 
             description.toLowerCase().includes(searchTerm) ||
             test.category.toLowerCase().includes(searchTerm);
    });
  }

  // Export/Import Data
  static exportData() {
    const data = {
      results: this.getTestResults(),
      sessions: this.getTestSessions(),
      preferences: this.getUserPreferences(),
      adminData: this.getAdminData(),
      exportDate: new Date().toISOString(),
      version: '2.0.0',
    };

    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.results) {
        this.saveToLocalStorage(STORAGE_KEYS.TEST_RESULTS, data.results);
      }
      if (data.sessions) {
        this.saveToLocalStorage(STORAGE_KEYS.TEST_SESSIONS, data.sessions);
      }
      if (data.preferences) {
        this.saveToLocalStorage(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
      }
      if (data.adminData) {
        this.saveToLocalStorage(STORAGE_KEYS.ADMIN_DATA, data.adminData);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Backup and restore
  static createBackup(): string {
    return this.exportData();
  }

  static restoreFromBackup(backupData: string): boolean {
    return this.importData(backupData);
  }
}
