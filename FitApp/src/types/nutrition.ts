export interface Food {
  name: string;
  portion: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Meal {
  name: string;
  foods: Food[];
  totalCalories: number;
  time: string;
}

export type NutritionPlanType = 'günlük' | 'haftalık' | 'aylık';
export type DietaryRestriction = 'vejeteryan' | 'vegan' | 'glütensiz' | 'laktozsuz' | 'diğer';

export interface MacroTargets {
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface NutritionPlan {
  id: string;
  userId: string;
  name: string;
  type: NutritionPlanType;
  targetCalories: number;
  meals: Meal[];
  startDate: Date;
  endDate: Date;
  notes?: string;
  macroTargets?: MacroTargets;
  restrictions?: DietaryRestriction[];
  createdAt: Date;
} 