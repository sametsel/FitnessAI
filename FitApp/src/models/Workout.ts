import { Schema, model } from 'mongoose';

export interface IWorkout {
  userId: string;
  date: Date;
  type: string;
  duration: number;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
  completed: boolean;
}

const workoutSchema = new Schema<IWorkout>({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true },
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number }
  }],
  completed: { type: Boolean, default: false }
});

export const Workout = model<IWorkout>('Workout', workoutSchema); 