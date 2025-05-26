import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

class NutritionService {
  private async getHeaders() {
    const token = await AsyncStorage.getItem('@fitapp_token');

    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async getUserPlans() {
    const response = await axios.get(`${API_URL}/nutrition-plans`);
    return response.data;
  }

  async getTodayNutrition(): Promise<any> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${API_URL}/nutrition-plans/today`, {
      headers,
    });
    
    return response.data;
  }

  async getDailyNutritionPlan(date: string): Promise<any> {
    const response = await axios.get(`${API_URL}/nutrition-plans/plan`, {
      params: { date },
      headers: await this.getHeaders(),
    });
    
    return response.data;
  }
}

export const nutritionService = new NutritionService(); 