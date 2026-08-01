import { requireUser } from '@/lib/auth/roles';
import { WorkoutForm } from './WorkoutForm';

export default async function NewWorkoutPage() {
  await requireUser();

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Log a workout</h1>
          <p>Manual entry for now — real wearable sync comes later.</p>
        </div>
      </div>
      <WorkoutForm />
    </div>
  );
}
