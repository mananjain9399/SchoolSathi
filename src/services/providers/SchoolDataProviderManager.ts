import { SchoolDataProvider, ProviderType } from './SchoolDataProvider';
import { MockSchoolDataProvider } from './MockSchoolDataProvider';
import { RESTSchoolDataProvider, RestProviderConfig } from './RESTSchoolDataProvider';
import { CSVSchoolDataProvider } from './CSVSchoolDataProvider';
import { FutureERPDataProvider, ERPConnectorConfig } from './FutureERPDataProvider';

const PROVIDER_PREF_KEY = 'schoolsathi_active_provider_pref';

class SchoolDataProviderManagerImpl {
  private providers = new Map<string, SchoolDataProvider>();
  private defaultMockProvider: MockSchoolDataProvider;
  private currentType: ProviderType = 'mock';

  constructor() {
    this.defaultMockProvider = new MockSchoolDataProvider('sch-demo');
    this.providers.set('mock_sch-demo', this.defaultMockProvider);

    // Initialize from saved preference if available
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(PROVIDER_PREF_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.currentType = parsed.type || 'mock';
        }
      } catch {}
    }
  }

  /**
   * Get the active provider for a school.
   * If an explicit provider is registered for this school, return it;
   * otherwise, return the active global provider type initialized for this school.
   */
  public getProvider(schoolId: string = 'sch-demo'): SchoolDataProvider {
    const key = `${this.currentType}_${schoolId}`;
    if (this.providers.has(key)) {
      return this.providers.get(key)!;
    }

    // Lazy instantiate provider for the requested school
    const newProvider = this.createProvider(this.currentType, schoolId);
    this.providers.set(key, newProvider);
    return newProvider;
  }

  /**
   * Set the active provider type across the application.
   */
  public setActiveProviderType(
    type: ProviderType,
    schoolId: string = 'sch-demo',
    config?: any
  ): SchoolDataProvider {
    this.currentType = type;
    const provider = this.createProvider(type, schoolId, config);
    const key = `${type}_${schoolId}`;
    this.providers.set(key, provider);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          PROVIDER_PREF_KEY,
          JSON.stringify({ type, schoolId, timestamp: new Date().toISOString() })
        );
      } catch {}
    }

    return provider;
  }

  public getActiveProviderType(): ProviderType {
    return this.currentType;
  }

  private createProvider(
    type: ProviderType,
    schoolId: string,
    config?: any
  ): SchoolDataProvider {
    switch (type) {
      case 'mock':
        return new MockSchoolDataProvider(schoolId);

      case 'rest':
        const restConfig: RestProviderConfig = {
          baseUrl: config?.baseUrl || ((import.meta as any).env?.VITE_SCHOOL_API_URL as string) || 'https://api.schoolerp.internal/v1',
          schoolId,
          apiKey: config?.apiKey || ((import.meta as any).env?.VITE_SCHOOL_API_KEY as string),
          authToken: config?.authToken,
        };
        return new RESTSchoolDataProvider(restConfig);

      case 'csv':
        return new CSVSchoolDataProvider(schoolId);

      case 'erp':
        const erpConfig: ERPConnectorConfig = {
          erpType: config?.erpType || 'generic-erp',
          schoolId,
          erpEndpointUrl: config?.erpEndpointUrl || 'https://erp.kendriyavidyalaya.gov.in/api',
          autoSyncEnabled: true,
        };
        return new FutureERPDataProvider(erpConfig);

      default:
        return new MockSchoolDataProvider(schoolId);
    }
  }

  /**
   * Reset back to default mock provider for safe prototype testing.
   */
  public resetToDefaultMock(): void {
    this.currentType = 'mock';
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(PROVIDER_PREF_KEY);
      } catch {}
    }
  }
}

export const SchoolDataProviderManager = new SchoolDataProviderManagerImpl();
