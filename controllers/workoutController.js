const Workout = require('../models/Workout');

// Tüm antrenmanları getir
exports.getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      data: {
        workouts
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Yeni antrenman oluştur
exports.createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create({
      ...req.body,
      user: req.user.id
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        workout
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Belirli bir antrenmanı getir
exports.getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!workout) {
      return res.status(404).json({
        status: 'fail',
        message: 'Antrenman bulunamadı'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        workout
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Antrenmanı güncelle
exports.updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!workout) {
      return res.status(404).json({
        status: 'fail',
        message: 'Antrenman bulunamadı'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        workout
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Antrenmanı sil
exports.deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!workout) {
      return res.status(404).json({
        status: 'fail',
        message: 'Antrenman bulunamadı'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Antrenmanı tamamla
exports.completeWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { completedAt: new Date() },
      { new: true }
    );
    
    if (!workout) {
      return res.status(404).json({
        status: 'fail',
        message: 'Antrenman bulunamadı'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        workout
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 