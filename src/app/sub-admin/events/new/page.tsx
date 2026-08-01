import { redirect } from 'next/navigation';
import { requireSubAdmin } from '@/lib/auth/roles';
import { EventForm } from './EventForm';

export default async function NewEventPage() {
  const { profile } = await requireSubAdmin();
  if (!profile.club_id) redirect('/sub-admin/pending');

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>New event</h1>
          <p>Group workouts lower the stakes for a first meet.</p>
        </div>
      </div>
      <EventForm />
    </div>
  );
}
