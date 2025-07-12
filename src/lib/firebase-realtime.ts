import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  push, 
  update, 
  remove,
  onValue,
  off,
  DataSnapshot
} from 'firebase/database';
import app from './firebase';

// Initialize Realtime Database
const database = getDatabase(app);

// Database paths
export const DB_PATHS = {
  CHEMICAL_TESTS: 'chemical_tests',
  SUBSCRIPTION_SETTINGS: 'subscription_settings',
  USER_PROFILES: 'user_profiles',
  TEST_USAGE: 'test_usage'
} as const;

// Chemical Test interface
export interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  description?: string;
  description_ar?: string;
  color_result?: string;
  color_result_ar?: string;
  possible_substance?: string;
  possible_substance_ar?: string;
  prepare: string;
  prepare_ar?: string;
  test_type: string;
  test_number: string;
  reference: string;
  category?: string;
  safety_level?: string;
  preparation_time?: number;
  icon?: string;
  color_primary?: string;
  created_at?: string;
}

// Subscription Settings interface
export interface SubscriptionSettings {
  freeTestsEnabled: boolean;
  freeTestsCount: number;
  premiumRequired: boolean;
  globalFreeAccess: boolean;
  specificPremiumTests: number[];
  lastUpdated?: string;
  updatedBy?: string;
}

// Get all chemical tests
export async function getChemicalTests(): Promise<ChemicalTest[]> {
  try {
    const testsRef = ref(database, DB_PATHS.CHEMICAL_TESTS);
    const snapshot = await get(testsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object to array if needed
      if (Array.isArray(data)) {
        return data;
      } else {
        // Convert object with keys to array
        return Object.values(data) as ChemicalTest[];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching chemical tests from Firebase:', error);
    throw new Error('Failed to fetch chemical tests');
  }
}

// Get single chemical test by ID
export async function getChemicalTest(testId: string): Promise<ChemicalTest | null> {
  try {
    const tests = await getChemicalTests();
    return tests.find(test => test.id === testId) || null;
  } catch (error) {
    console.error('Error fetching chemical test:', error);
    return null;
  }
}

// Save all chemical tests
export async function saveChemicalTests(tests: ChemicalTest[]): Promise<void> {
  try {
    const testsRef = ref(database, DB_PATHS.CHEMICAL_TESTS);
    await set(testsRef, tests);
    console.log('Chemical tests saved to Firebase successfully');
  } catch (error) {
    console.error('Error saving chemical tests to Firebase:', error);
    throw new Error('Failed to save chemical tests');
  }
}

// Add new chemical test
export async function addChemicalTest(test: Omit<ChemicalTest, 'id'>): Promise<string> {
  try {
    const tests = await getChemicalTests();
    const newTest: ChemicalTest = {
      ...test,
      id: `test-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    tests.push(newTest);
    await saveChemicalTests(tests);
    
    return newTest.id;
  } catch (error) {
    console.error('Error adding chemical test:', error);
    throw new Error('Failed to add chemical test');
  }
}

// Update chemical test
export async function updateChemicalTest(testId: string, updates: Partial<ChemicalTest>): Promise<void> {
  try {
    const tests = await getChemicalTests();
    const testIndex = tests.findIndex(test => test.id === testId);
    
    if (testIndex === -1) {
      throw new Error('Test not found');
    }
    
    tests[testIndex] = { ...tests[testIndex], ...updates };
    await saveChemicalTests(tests);
  } catch (error) {
    console.error('Error updating chemical test:', error);
    throw new Error('Failed to update chemical test');
  }
}

// Delete chemical test
export async function deleteChemicalTest(testId: string): Promise<void> {
  try {
    const tests = await getChemicalTests();
    const filteredTests = tests.filter(test => test.id !== testId);
    await saveChemicalTests(filteredTests);
  } catch (error) {
    console.error('Error deleting chemical test:', error);
    throw new Error('Failed to delete chemical test');
  }
}

// Get subscription settings
export async function getSubscriptionSettings(): Promise<SubscriptionSettings> {
  try {
    const settingsRef = ref(database, DB_PATHS.SUBSCRIPTION_SETTINGS);
    const snapshot = await get(settingsRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as SubscriptionSettings;
    }
    
    // Return default settings if none exist
    const defaultSettings: SubscriptionSettings = {
      freeTestsEnabled: true,
      freeTestsCount: 5,
      premiumRequired: true,
      globalFreeAccess: false,
      specificPremiumTests: [],
      lastUpdated: new Date().toISOString()
    };
    
    // Save default settings
    await saveSubscriptionSettings(defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error fetching subscription settings from Firebase:', error);
    // Return default settings on error
    return {
      freeTestsEnabled: true,
      freeTestsCount: 5,
      premiumRequired: true,
      globalFreeAccess: false,
      specificPremiumTests: []
    };
  }
}

// Save subscription settings
export async function saveSubscriptionSettings(settings: SubscriptionSettings): Promise<void> {
  try {
    const settingsWithTimestamp = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    
    const settingsRef = ref(database, DB_PATHS.SUBSCRIPTION_SETTINGS);
    await set(settingsRef, settingsWithTimestamp);
    
    console.log('Subscription settings saved to Firebase successfully');
  } catch (error) {
    console.error('Error saving subscription settings to Firebase:', error);
    throw new Error('Failed to save subscription settings');
  }
}

// Listen to subscription settings changes
export function listenToSubscriptionSettings(
  callback: (settings: SubscriptionSettings) => void
): () => void {
  const settingsRef = ref(database, DB_PATHS.SUBSCRIPTION_SETTINGS);
  
  const unsubscribe = onValue(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as SubscriptionSettings);
    }
  });
  
  return () => off(settingsRef, 'value', unsubscribe);
}

// Listen to chemical tests changes
export function listenToChemicalTests(
  callback: (tests: ChemicalTest[]) => void
): () => void {
  const testsRef = ref(database, DB_PATHS.CHEMICAL_TESTS);
  
  const unsubscribe = onValue(testsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const tests = Array.isArray(data) ? data : Object.values(data) as ChemicalTest[];
      callback(tests);
    } else {
      callback([]);
    }
  });
  
  return () => off(testsRef, 'value', unsubscribe);
}

// Initialize database with default data
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing Firebase Realtime Database...');
    
    // Check if data already exists
    const tests = await getChemicalTests();
    const settings = await getSubscriptionSettings();
    
    console.log(`Found ${tests.length} tests and settings in database`);
    
    if (tests.length === 0) {
      console.log('No tests found, initializing with default data...');
      // Import default data from JSON file if needed
      // This will be handled by a separate migration script
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
