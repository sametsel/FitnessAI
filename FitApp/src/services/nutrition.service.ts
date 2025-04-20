import axios from 'axios';
import { NutritionPlan } from '../types/nutrition';
import { API_URL } from '../config';

interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: {
    nutritionPlan?: T;
    nutritionPlans?: T[];
  };
}

class NutritionService {
  async createPlan(planData: Omit<NutritionPlan, 'id' | 'userId' | 'createdAt'>): Promise<NutritionPlan> {
    try {
      const response = await axios.post<ApiResponse<NutritionPlan>>(
        `${API_URL}/nutrition/plans`,
        planData
      );

      if (response.data.status === 'success' && response.data.data?.nutritionPlan) {
        return response.data.data.nutritionPlan;
      }

      throw new Error(response.data.message || 'Beslenme planı oluşturulamadı');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Beslenme planı oluşturulurken bir hata oluştu');
    }
  }

  async updatePlan(planId: string, planData: Partial<NutritionPlan>): Promise<NutritionPlan> {
    try {
      const response = await axios.put<ApiResponse<NutritionPlan>>(
        `${API_URL}/nutrition/plans/${planId}`,
        planData
      );

      if (response.data.status === 'success' && response.data.data?.nutritionPlan) {
        return response.data.data.nutritionPlan;
      }

      throw new Error(response.data.message || 'Beslenme planı güncellenemedi');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Beslenme planı güncellenirken bir hata oluştu');
    }
  }

  async deletePlan(planId: string): Promise<void> {
    try {
      const response = await axios.delete<ApiResponse<null>>(
        `${API_URL}/nutrition/plans/${planId}`
      );

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Beslenme planı silinemedi');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Beslenme planı silinirken bir hata oluştu');
    }
  }

  async getPlan(planId: string): Promise<NutritionPlan> {
    try {
      const response = await axios.get<ApiResponse<NutritionPlan>>(
        `${API_URL}/nutrition/plans/${planId}`
      );

      if (response.data.status === 'success' && response.data.data?.nutritionPlan) {
        return response.data.data.nutritionPlan;
      }

      throw new Error(response.data.message || 'Beslenme planı bulunamadı');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Beslenme planı alınırken bir hata oluştu');
    }
  }

  async getUserPlans(): Promise<NutritionPlan[]> {
    try {
      const response = await axios.get<ApiResponse<NutritionPlan>>(
        `${API_URL}/nutrition/plans`
      );

      if (response.data.status === 'success' && response.data.data?.nutritionPlans) {
        return response.data.data.nutritionPlans;
      }

      throw new Error(response.data.message || 'Beslenme planları bulunamadı');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Beslenme planları alınırken bir hata oluştu');
    }
  }
}

export const nutritionService = new NutritionService(); 