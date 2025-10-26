import axios, { AxiosInstance } from 'axios';
import { OnboardingStep, OnboardingPlan } from './types';

export class DevonboardAPI {
  private client: AxiosInstance;
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all steps for an onboarding plan
   */
  async getSteps(planId: string): Promise<OnboardingStep[]> {
    try {
      const response = await this.client.get(`/api/onboarding/${planId}/steps`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching steps:', error);
      throw error;
    }
  }

  /**
   * Get onboarding plan details
   */
  async getPlan(planId: string): Promise<OnboardingPlan> {
    try {
      const response = await this.client.get(`/api/onboarding/plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  }

  /**
   * Get all plans for an organization
   */
  async getPlans(organizationId?: string): Promise<OnboardingPlan[]> {
    try {
      const url = organizationId
        ? `/api/onboarding/plans?organization_id=${organizationId}`
        : '/api/onboarding/plans';

      const response = await this.client.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Update API URL
   */
  updateApiUrl(newUrl: string) {
    this.apiUrl = newUrl;
    this.client = axios.create({
      baseURL: newUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
