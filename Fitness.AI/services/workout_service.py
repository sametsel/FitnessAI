from datetime import datetime
from typing import Dict, List, Optional
import random

class WorkoutProgramService:
    def __init__(self):
        # Servis başlangıç yapılandırması
        pass
    
    def generate_workout_program(self, user_profile: Dict) -> Dict:
        """
        Kullanıcı profiline göre kişiselleştirilmiş antrenman programı oluşturur
        """
        # Kullanıcı seviyesine göre uygun egzersizleri belirleme
        suitable_exercises = self._get_exercises_by_level(user_profile["experience_level"])
        
        # Spor aleti veya ev egzersizleri seçimi
        if user_profile.get("has_gym_access", False):
            exercises = self._select_gym_exercises(suitable_exercises, user_profile)
        else:
            exercises = self._select_home_exercises(suitable_exercises, user_profile)
        
        # Haftalık/aylık program oluşturma
        schedule = self._create_workout_schedule(
            exercises, 
            user_profile["preferred_workout_days"],
            user_profile.get("program_duration", "weekly")
        )
        
        # Program süresini belirle
        duration_weeks = 4 if user_profile.get("program_duration", "weekly") == "monthly" else 1
        
        return {
            "exercises": exercises,
            "schedule": schedule,
            "difficulty": user_profile["experience_level"],
            "duration_weeks": duration_weeks,
            "target_muscles": self._determine_target_muscles(user_profile),
            "created_at": datetime.now(),
            "last_updated": datetime.now()
        }
    
    def _get_exercises_by_level(self, experience_level: str) -> Dict[str, List[Dict]]:
        """
        Deneyim seviyesine göre uygun egzersizleri belirler
        """
        # TODO: Bu veriler gerçek API'den alınabilir veya veritabanında saklanabilir
        
        # Deneyim seviyesine göre egzersiz havuzu
        beginner_exercises = {
            "chest": [
                {"name": "Göğüs Sıkıştırma (Makine)", "difficulty": "beginner", "equipment": "machine"},
                {"name": "Dumbbell Press (Hafif)", "difficulty": "beginner", "equipment": "dumbbell"},
                {"name": "Push-up (Dizler Üzerinde)", "difficulty": "beginner", "equipment": "bodyweight"}
            ],
            "back": [
                {"name": "Lat Pulldown", "difficulty": "beginner", "equipment": "machine"},
                {"name": "Oturarak Kürek Çekme (Makine)", "difficulty": "beginner", "equipment": "machine"},
                {"name": "Superman Hareketi", "difficulty": "beginner", "equipment": "bodyweight"}
            ],
            "legs": [
                {"name": "Leg Press (Makine)", "difficulty": "beginner", "equipment": "machine"},
                {"name": "Bacak Uzatma (Makine)", "difficulty": "beginner", "equipment": "machine"},
                {"name": "Vücut Ağırlığı ile Squat", "difficulty": "beginner", "equipment": "bodyweight"}
            ],
            "shoulders": [
                {"name": "Dumbbell Shoulder Press (Hafif)", "difficulty": "beginner", "equipment": "dumbbell"},
                {"name": "Lateral Raise (Hafif)", "difficulty": "beginner", "equipment": "dumbbell"},
                {"name": "Duvar Şınavı", "difficulty": "beginner", "equipment": "bodyweight"}
            ],
            "arms": [
                {"name": "Bicep Curl (Makine)", "difficulty": "beginner", "equipment": "machine"},
                {"name": "Rope Tricep Pushdown", "difficulty": "beginner", "equipment": "cable"},
                {"name": "Dumbbell Bicep Curl (Hafif)", "difficulty": "beginner", "equipment": "dumbbell"}
            ],
            "core": [
                {"name": "Crunch", "difficulty": "beginner", "equipment": "bodyweight"},
                {"name": "Plank (Dizler Üzerinde)", "difficulty": "beginner", "equipment": "bodyweight"},
                {"name": "Dead Bug", "difficulty": "beginner", "equipment": "bodyweight"}
            ],
            "cardio": [
                {"name": "Yürüyüş", "difficulty": "beginner", "equipment": "none"},
                {"name": "Sabit Bisiklet (Düşük Direnç)", "difficulty": "beginner", "equipment": "machine"},
                {"name": "Yüzme (Hafif Tempo)", "difficulty": "beginner", "equipment": "none"}
            ]
        }
        
        intermediate_exercises = {
            "chest": [
                {"name": "Bench Press (Orta Ağırlık)", "difficulty": "intermediate", "equipment": "barbell"},
                {"name": "Dumbbell Press", "difficulty": "intermediate", "equipment": "dumbbell"},
                {"name": "Push-up", "difficulty": "intermediate", "equipment": "bodyweight"}
            ],
            "back": [
                {"name": "Seated Cable Row", "difficulty": "intermediate", "equipment": "cable"},
                {"name": "Bent-Over Row", "difficulty": "intermediate", "equipment": "barbell"},
                {"name": "Pull-up (Assisted)", "difficulty": "intermediate", "equipment": "bodyweight"}
            ],
            "legs": [
                {"name": "Barbell Squat", "difficulty": "intermediate", "equipment": "barbell"},
                {"name": "Romanian Deadlift", "difficulty": "intermediate", "equipment": "barbell"},
                {"name": "Walking Lunge", "difficulty": "intermediate", "equipment": "dumbbell"}
            ],
            "shoulders": [
                {"name": "Overhead Press", "difficulty": "intermediate", "equipment": "barbell"},
                {"name": "Face Pull", "difficulty": "intermediate", "equipment": "cable"},
                {"name": "Arnold Press", "difficulty": "intermediate", "equipment": "dumbbell"}
            ],
            "arms": [
                {"name": "EZ Bar Curl", "difficulty": "intermediate", "equipment": "barbell"},
                {"name": "Skull Crusher", "difficulty": "intermediate", "equipment": "barbell"},
                {"name": "Hammer Curl", "difficulty": "intermediate", "equipment": "dumbbell"}
            ],
            "core": [
                {"name": "Hanging Knee Raise", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "Plank", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "Russian Twist", "difficulty": "intermediate", "equipment": "dumbbell"}
            ],
            "cardio": [
                {"name": "Koşu", "difficulty": "intermediate", "equipment": "none"},
                {"name": "Eliptik Trainer", "difficulty": "intermediate", "equipment": "machine"},
                {"name": "HIIT (Orta Zorluk)", "difficulty": "intermediate", "equipment": "none"}
            ]
        }
        
        advanced_exercises = {
            "chest": [
                {"name": "Bench Press (Ağır)", "difficulty": "advanced", "equipment": "barbell"},
                {"name": "Incline Dumbbell Press", "difficulty": "advanced", "equipment": "dumbbell"},
                {"name": "Weighted Dips", "difficulty": "advanced", "equipment": "bodyweight"}
            ],
            "back": [
                {"name": "Pull-up (Weighted)", "difficulty": "advanced", "equipment": "bodyweight"},
                {"name": "Barbell Row", "difficulty": "advanced", "equipment": "barbell"},
                {"name": "Deadlift", "difficulty": "advanced", "equipment": "barbell"}
            ],
            "legs": [
                {"name": "Front Squat", "difficulty": "advanced", "equipment": "barbell"},
                {"name": "Bulgarian Split Squat", "difficulty": "advanced", "equipment": "dumbbell"},
                {"name": "Hack Squat", "difficulty": "advanced", "equipment": "machine"}
            ],
            "shoulders": [
                {"name": "Push Press", "difficulty": "advanced", "equipment": "barbell"},
                {"name": "Upright Row", "difficulty": "advanced", "equipment": "barbell"},
                {"name": "Lateral Raise (Ağır)", "difficulty": "advanced", "equipment": "dumbbell"}
            ],
            "arms": [
                {"name": "Weighted Chin-up", "difficulty": "advanced", "equipment": "bodyweight"},
                {"name": "Close Grip Bench Press", "difficulty": "advanced", "equipment": "barbell"},
                {"name": "21s (Bicep Curl)", "difficulty": "advanced", "equipment": "barbell"}
            ],
            "core": [
                {"name": "Dragon Flag", "difficulty": "advanced", "equipment": "bodyweight"},
                {"name": "Ab Wheel Rollout", "difficulty": "advanced", "equipment": "other"},
                {"name": "Hanging Leg Raise", "difficulty": "advanced", "equipment": "bodyweight"}
            ],
            "cardio": [
                {"name": "Interval Sprints", "difficulty": "advanced", "equipment": "none"},
                {"name": "Plyometric Circuit", "difficulty": "advanced", "equipment": "none"},
                {"name": "HIIT (Yüksek Zorluk)", "difficulty": "advanced", "equipment": "none"}
            ]
        }
        
        # Vücut ağırlığı ile yapılan ev egzersizleri
        home_exercises = {
            "chest": [
                {"name": "Push-up", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "Decline Push-up", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "Diamond Push-up", "difficulty": "advanced", "equipment": "bodyweight"}
            ],
            "back": [
                {"name": "Superman", "difficulty": "beginner", "equipment": "bodyweight"},
                {"name": "Inverted Row", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "Pull-up", "difficulty": "advanced", "equipment": "bodyweight"}
            ],
            "legs": [
                {"name": "Squat", "difficulty": "beginner", "equipment": "bodyweight"},
                {"name": "Lunge", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "Pistol Squat", "difficulty": "advanced", "equipment": "bodyweight"}
            ],
            "shoulders": [
                {"name": "Pike Push-up", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "Wall Handstand Hold", "difficulty": "advanced", "equipment": "bodyweight"},
                {"name": "Handstand Push-up", "difficulty": "advanced", "equipment": "bodyweight"}
            ],
            "arms": [
                {"name": "Tricep Dip", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "Chin-up", "difficulty": "advanced", "equipment": "bodyweight"},
                {"name": "Commando Pull-up", "difficulty": "advanced", "equipment": "bodyweight"}
            ],
            "core": [
                {"name": "Plank", "difficulty": "beginner", "equipment": "bodyweight"},
                {"name": "Mountain Climber", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "L-Sit", "difficulty": "advanced", "equipment": "bodyweight"}
            ],
            "cardio": [
                {"name": "Jumping Jack", "difficulty": "beginner", "equipment": "bodyweight"},
                {"name": "Burpee", "difficulty": "intermediate", "equipment": "bodyweight"},
                {"name": "Jump Squat", "difficulty": "intermediate", "equipment": "bodyweight"}
            ]
        }
        
        # Deneyim seviyesine göre egzersiz havuzunu döndür
        if experience_level == "beginner":
            return beginner_exercises
        elif experience_level == "intermediate":
            return intermediate_exercises
        elif experience_level == "advanced":
            return advanced_exercises
        else:
            # Varsayılan olarak başlangıç seviyesini döndür
            return beginner_exercises
    
    def _select_gym_exercises(self, exercise_pool: Dict[str, List[Dict]], user_profile: Dict) -> List[Dict]:
        """
        Spor salonu ekipmanları kullanarak yapılacak egzersizleri seçer
        """
        selected_exercises = []
        
        # Fitness hedefine göre hangi kas gruplarına odaklanılacağını belirle
        target_muscles = self._determine_target_muscles(user_profile)
        
        # Her kas grubu için egzersiz seç
        for muscle in target_muscles:
            if muscle in exercise_pool:
                # Egzersiz havuzundan ilgili kas grubu için egzersizleri al
                muscle_exercises = exercise_pool[muscle]
                
                # Ekipman türüne göre uygun olanları filtrele (ev için bodyweight hariç)
                gym_exercises = [ex for ex in muscle_exercises if ex["equipment"] != "none"]
                
                # Eğer uygun egzersiz varsa, rastgele 2 tanesini seç
                if gym_exercises:
                    selected_count = min(2, len(gym_exercises))
                    selected = random.sample(gym_exercises, selected_count)
                    
                    # Egzersizlere ek bilgileri ekle
                    for ex in selected:
                        ex["muscle_group"] = muscle
                        ex["sets"] = self._determine_sets(user_profile["experience_level"])
                        ex["reps"] = self._determine_reps(user_profile["experience_level"], user_profile["fitness_goal"])
                        ex["rest_time"] = self._determine_rest_time(user_profile["experience_level"], user_profile["fitness_goal"])
                        ex["instructions"] = "TODO: Detaylı talimatlar eklenecek"
                        ex["image_url"] = "TODO: Resim URL'si eklenecek"
                        ex["video_url"] = "TODO: Video URL'si eklenecek"
                    
                    selected_exercises.extend(selected)
        
        # Kardio egzersizlerini ekle (fitness hedefine bağlı olarak)
        if "cardio" in exercise_pool and (user_profile["fitness_goal"] in ["weight_loss", "overall_health"]):
            cardio_exercises = exercise_pool["cardio"]
            if cardio_exercises:
                selected_cardio = random.sample(cardio_exercises, 1)[0]
                
                selected_cardio["muscle_group"] = "cardio"
                selected_cardio["sets"] = 1
                selected_cardio["reps"] = "20-30 dakika"
                selected_cardio["rest_time"] = 0
                selected_cardio["instructions"] = "TODO: Detaylı talimatlar eklenecek"
                
                selected_exercises.append(selected_cardio)
        
        return selected_exercises
    
    def _select_home_exercises(self, exercise_pool: Dict[str, List[Dict]], user_profile: Dict) -> List[Dict]:
        """
        Evde vücut ağırlığı veya minimal ekipmanla yapılabilecek egzersizleri seçer
        """
        selected_exercises = []
        
        # Fitness hedefine göre hangi kas gruplarına odaklanılacağını belirle
        target_muscles = self._determine_target_muscles(user_profile)
        
        # Her kas grubu için evde yapılabilecek egzersizleri seç
        for muscle in target_muscles:
            if muscle in exercise_pool:
                # Egzersiz havuzundan ilgili kas grubu için egzersizleri al
                muscle_exercises = exercise_pool[muscle]
                
                # Evde yapılabilecek egzersizleri filtrele (bodyweight, dumbbell veya bands)
                home_friendly = [ex for ex in muscle_exercises if ex["equipment"] in ["bodyweight", "dumbbell", "bands", "none"]]
                
                # Eğer uygun egzersiz varsa, rastgele 1-2 tanesini seç
                if home_friendly:
                    selected_count = min(2, len(home_friendly))
                    selected = random.sample(home_friendly, selected_count)
                    
                    # Egzersizlere ek bilgileri ekle
                    for ex in selected:
                        ex["muscle_group"] = muscle
                        ex["sets"] = self._determine_sets(user_profile["experience_level"])
                        ex["reps"] = self._determine_reps(user_profile["experience_level"], user_profile["fitness_goal"])
                        ex["rest_time"] = self._determine_rest_time(user_profile["experience_level"], user_profile["fitness_goal"])
                        ex["instructions"] = "TODO: Detaylı talimatlar eklenecek"
                        ex["image_url"] = "TODO: Resim URL'si eklenecek"
                        ex["video_url"] = "TODO: Video URL'si eklenecek"
                    
                    selected_exercises.extend(selected)
        
        # Kardio egzersizlerini ekle (fitness hedefine bağlı olarak)
        if "cardio" in exercise_pool and (user_profile["fitness_goal"] in ["weight_loss", "overall_health"]):
            cardio_exercises = [ex for ex in exercise_pool["cardio"] if ex["equipment"] in ["bodyweight", "none"]]
            if cardio_exercises:
                selected_cardio = random.sample(cardio_exercises, 1)[0]
                
                selected_cardio["muscle_group"] = "cardio"
                selected_cardio["sets"] = 1
                selected_cardio["reps"] = "15-20 dakika"
                selected_cardio["rest_time"] = 0
                selected_cardio["instructions"] = "TODO: Detaylı talimatlar eklenecek"
                
                selected_exercises.append(selected_cardio)
        
        return selected_exercises
    
    def _create_workout_schedule(self, exercises: List[Dict], workout_days: int, program_duration: str) -> Dict[str, List[str]]:
        """
        Egzersizleri haftanın günlerine dağıtarak antrenman programı oluşturur
        """
        # Haftada kaç gün antrenman yapılacağını belirle (1-6 arası)
        days_per_week = max(1, min(6, workout_days))
        
        # Egzersizleri kas gruplarına göre sınıflandır
        exercise_by_muscle = {}
        for ex in exercises:
            muscle = ex["muscle_group"]
            if muscle not in exercise_by_muscle:
                exercise_by_muscle[muscle] = []
            exercise_by_muscle[muscle].append(ex["name"])
        
        # Antrenman bölünmesini belirle
        split_type = self._determine_split_type(days_per_week, exercise_by_muscle.keys())
        
        # Haftanın günleri
        days_of_week = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]
        
        # Günleri karıştır ve antrenman günlerini seç
        available_days = days_of_week.copy()
        random.shuffle(available_days)
        workout_day_selection = available_days[:days_per_week]
        workout_day_selection.sort(key=lambda x: days_of_week.index(x))  # Haftanın sırasına göre tekrar sırala
        
        # Antrenman programı (hangi gün hangi kas grupları çalışılacak)
        workout_schedule = {}
        
        # Split türüne göre programı oluştur
        if split_type == "full_body":
            # Tam vücut antrenman (haftada 1-3 gün)
            for day in workout_day_selection:
                workout_schedule[day] = list(exercise_by_muscle.keys())
        
        elif split_type == "upper_lower":
            # Üst vücut / Alt vücut bölünmesi (haftada 4 gün)
            upper_muscles = ["chest", "back", "shoulders", "arms"]
            lower_muscles = ["legs", "core"]
            
            for i, day in enumerate(workout_day_selection):
                if i % 2 == 0:  # Çift indeksli günler üst vücut
                    workout_schedule[day] = [m for m in upper_muscles if m in exercise_by_muscle]
                else:  # Tek indeksli günler alt vücut
                    workout_schedule[day] = [m for m in lower_muscles if m in exercise_by_muscle]
                
                # Kardio ekle (varsa)
                if "cardio" in exercise_by_muscle:
                    workout_schedule[day].append("cardio")
        
        elif split_type == "push_pull_legs":
            # Push/Pull/Legs bölünmesi (haftada 3-6 gün)
            push_muscles = ["chest", "shoulders", "arms"]  # Triceps kısmı
            pull_muscles = ["back", "arms"]  # Biceps kısmı
            leg_muscles = ["legs", "core"]
            
            # Günleri üçerli gruplara ayır (PPL PPL)
            workout_groups = []
            group_count = days_per_week // 3 + (1 if days_per_week % 3 > 0 else 0)
            
            for _ in range(group_count):
                workout_groups.extend(["push", "pull", "legs"])
            
            # Gereken gün sayısı kadar günleri seç
            workout_groups = workout_groups[:days_per_week]
            
            # Her gün için kas gruplarını belirle
            for i, day in enumerate(workout_day_selection):
                if workout_groups[i] == "push":
                    workout_schedule[day] = [m for m in push_muscles if m in exercise_by_muscle]
                elif workout_groups[i] == "pull":
                    workout_schedule[day] = [m for m in pull_muscles if m in exercise_by_muscle]
                elif workout_groups[i] == "legs":
                    workout_schedule[day] = [m for m in leg_muscles if m in exercise_by_muscle]
                    if "cardio" in exercise_by_muscle:
                        workout_schedule[day].append("cardio")
        
        # Aylık program için, haftalık programı tekrarlı olarak düzenleyebiliriz
        if program_duration == "monthly":
            # Şimdilik haftalık programı aylık olarak düşünüyoruz
            # Bu kısım ileride daha gelişmiş bir yapıya dönüştürülebilir
            pass
        
        return workout_schedule
    
    def _determine_split_type(self, workout_days: int, available_muscles: List[str]) -> str:
        """
        Egzersiz bölünme türünü belirler (Full Body, Upper/Lower, Push/Pull/Legs)
        """
        if workout_days <= 3:
            return "full_body"  # Haftada 1-3 gün için tam vücut
        elif workout_days == 4:
            return "upper_lower"  # Haftada 4 gün için üst/alt vücut
        else:
            return "push_pull_legs"  # Haftada 5-6 gün için PPL
    
    def _determine_target_muscles(self, user_profile: Dict) -> List[str]:
        """
        Kullanıcının hedeflerine göre odaklanılması gereken kas gruplarını belirler
        """
        all_muscles = ["chest", "back", "legs", "shoulders", "arms", "core"]
        
        # Fitness hedefine göre odaklanılacak kas grupları
        if user_profile["fitness_goal"] == "muscle_gain":
            # Kas kazanımı için tüm ana kas grupları
            return all_muscles
        elif user_profile["fitness_goal"] == "weight_loss":
            # Kilo kaybı için büyük kas grupları ve kardiyo
            return ["legs", "back", "chest", "core", "cardio"]
        elif user_profile["fitness_goal"] == "overall_health":
            # Genel sağlık için dengeli bir yaklaşım
            return all_muscles + ["cardio"]
        else:  # maintenance veya diğer hedefler
            # Dengeleme için tüm kas grupları
            return all_muscles
    
    def _determine_sets(self, experience_level: str) -> int:
        """
        Deneyim seviyesine göre set sayısını belirler
        """
        if experience_level == "beginner":
            return 3
        elif experience_level == "intermediate":
            return 4
        elif experience_level == "advanced":
            return 5
        else:
            return 3
    
    def _determine_reps(self, experience_level: str, fitness_goal: str) -> str:
        """
        Deneyim seviyesi ve fitness hedefine göre tekrar sayısını belirler
        """
        if fitness_goal == "muscle_gain":
            if experience_level == "beginner":
                return "8-10"
            elif experience_level == "intermediate":
                return "8-12"
            else:  # advanced
                return "6-12"
        elif fitness_goal == "weight_loss":
            if experience_level == "beginner":
                return "12-15"
            else:  # intermediate veya advanced
                return "12-20"
        else:  # overall_health veya maintenance
            if experience_level == "beginner":
                return "10-12"
            elif experience_level == "intermediate":
                return "8-15"
            else:  # advanced
                return "8-15"
    
    def _determine_rest_time(self, experience_level: str, fitness_goal: str) -> int:
        """
        Dinlenme süresini saniye cinsinden belirler
        """
        if fitness_goal == "muscle_gain":
            if experience_level == "beginner":
                return 90
            elif experience_level == "intermediate":
                return 120
            else:  # advanced
                return 180
        elif fitness_goal == "weight_loss":
            if experience_level == "beginner":
                return 30
            elif experience_level == "intermediate":
                return 45
            else:  # advanced
                return 60
        else:  # overall_health veya maintenance
            if experience_level == "beginner":
                return 60
            elif experience_level == "intermediate":
                return 90
            else:  # advanced
                return 120 