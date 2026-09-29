import { Parent, LanguageCode } from '../types';
import { MOCK_PARENTS } from '../data/mockData';

const SESSION_KEY = 'schoolsathi_auth_session';
const PARENTS_DB_KEY = 'schoolsathi_parents_store';

// Helper to get all parents from storage or initialize with default
function getParentsStore(): Parent[] {
  if (typeof window === 'undefined') return MOCK_PARENTS;
  try {
    const data = localStorage.getItem(PARENTS_DB_KEY);
    if (!data) {
      localStorage.setItem(PARENTS_DB_KEY, JSON.stringify(MOCK_PARENTS));
      return MOCK_PARENTS;
    }
    return JSON.parse(data);
  } catch {
    return MOCK_PARENTS;
  }
}

function saveParentsStore(parents: Parent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PARENTS_DB_KEY, JSON.stringify(parents));
  } catch (e) {
    console.error('Failed to save parents store', e);
  }
}

// In-memory mock OTP storage for active challenges
const activeOtpChallenges = new Map<string, { otp: string; expiresAt: number }>();

export class AuthService {
  /**
   * Request an OTP for a mobile number.
   * Prototype returns mock OTP (and accepts '1234' as default master bypass).
   * Real provider (Twilio / MSG91 / Firebase Auth) can be plugged in here.
   */
  public static async requestOtp(mobile: string): Promise<{
    success: boolean;
    message: string;
    mockOtp: string;
  }> {
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      return {
        success: false,
        message: 'Please enter a valid 10-digit mobile number',
        mockOtp: '',
      };
    }

    // Generate prototype OTP
    const mockOtp = '1234'; // Default friendly test OTP
    activeOtpChallenges.set(cleanMobile, {
      otp: mockOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return {
      success: true,
      message: `SMS sent with 4-digit code to +91 ${cleanMobile}`,
      mockOtp,
    };
  }

  /**
   * Verify OTP and establish parent session
   */
  public static async verifyOtp(
    mobile: string,
    otpEntered: string,
    optionalName?: string,
    preferredLanguage: LanguageCode = 'hi'
  ): Promise<{
    success: boolean;
    parent?: Parent;
    token?: string;
    error?: string;
  }> {
    const cleanMobile = mobile.replace(/\D/g, '');
    const challenge = activeOtpChallenges.get(cleanMobile);

    // Accept challenge OTP or '1234' master prototype code
    const isValid = otpEntered === '1234' || (challenge && challenge.otp === otpEntered);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid OTP. Please enter 1234 to proceed.',
      };
    }

    // Clear challenge
    activeOtpChallenges.delete(cleanMobile);

    const parents = getParentsStore();
    let parent = parents.find((p) => p.mobile.replace(/\D/g, '') === cleanMobile);

    if (!parent) {
      // First time registration: create new secure parent profile
      const newParentId = `p-${Date.now().toString().slice(-4)}`;
      const name = optionalName?.trim() || `Parent ${cleanMobile.slice(-4)}`;

      parent = {
        id: newParentId,
        name,
        fullName: name,
        mobile: cleanMobile,
        phoneNumber: cleanMobile,
        preferredLanguage,
        children: [], // Initially empty, must verify & link
        childrenIds: [],
        relationship: 'Guardian',
        voiceSpeed: 'normal',
        autoSpeak: true,
      };

      parents.push(parent);
      saveParentsStore(parents);
    }

    // Save session in localStorage
    this.setSession(parent);

    return {
      success: true,
      parent,
      token: `mock-jwt-token-${parent.id}-${Date.now()}`,
    };
  }

  /**
   * Get current authenticated parent session
   */
  public static getCurrentParent(): Parent | null {
    if (typeof window === 'undefined') return MOCK_PARENTS[0];
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return null;
      const parsed: Parent = JSON.parse(session);
      // Refresh with latest data from parents store if available
      const parents = getParentsStore();
      const current = parents.find((p) => p.id === parsed.id);
      return current || parsed;
    } catch {
      return null;
    }
  }

  /**
   * Get parent by ID from store
   */
  public static getParentById(parentId: string): Parent | null {
    const parents = getParentsStore();
    return parents.find((p) => p.id === parentId) || null;
  }

  /**
   * Set active session
   */
  public static setSession(parent: Parent): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(parent));
    } catch (e) {
      console.error('Failed to set session', e);
    }
  }

  /**
   * Update parent profile
   */
  public static updateParentProfile(parentId: string, updates: Partial<Parent>): Parent {
    const parents = getParentsStore();
    const index = parents.findIndex((p) => p.id === parentId);
    if (index === -1) {
      throw new Error('Parent not found');
    }

    const updated = {
      ...parents[index],
      ...updates,
      name: updates.name || updates.fullName || parents[index].name,
      fullName: updates.name || updates.fullName || parents[index].fullName,
    };

    parents[index] = updated;
    saveParentsStore(parents);
    this.setSession(updated);
    return updated;
  }

  /**
   * Link child to parent account (Strict access control)
   */
  public static linkChildToParent(parentId: string, childId: string): Parent {
    const parents = getParentsStore();
    const parent = parents.find((p) => p.id === parentId);
    if (!parent) {
      throw new Error('Parent not found');
    }

    const childSet = new Set(parent.children || []);
    childSet.add(childId);
    const updatedChildren = Array.from(childSet);

    const updatedParent: Parent = {
      ...parent,
      children: updatedChildren,
      childrenIds: updatedChildren,
    };

    return this.updateParentProfile(parentId, updatedParent);
  }

  /**
   * Unlink child from parent account
   */
  public static unlinkChild(parentId: string, childId: string): Parent {
    const parents = getParentsStore();
    const parent = parents.find((p) => p.id === parentId);
    if (!parent) {
      throw new Error('Parent not found');
    }

    const updatedChildren = (parent.children || []).filter((id) => id !== childId);
    const updatedParent: Parent = {
      ...parent,
      children: updatedChildren,
      childrenIds: updatedChildren,
    };

    return this.updateParentProfile(parentId, updatedParent);
  }

  /**
   * Clear session on logout
   */
  public static logout(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  }

  /**
   * Check if a parent is currently authenticated
   */
  public static isAuthenticated(): boolean {
    return this.getCurrentParent() !== null;
  }
}
