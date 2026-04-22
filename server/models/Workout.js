import mongoose from 'mongoose';
const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  exercises: [{ name: String, sets: Number, reps: Number }],
  duration: Number,
  difficulty: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;