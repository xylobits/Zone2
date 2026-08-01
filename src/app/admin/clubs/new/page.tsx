import { requireAdmin } from '@/lib/auth/roles';
import { ClubForm } from '../ClubForm';

export default async function NewClubPage() {
  await requireAdmin();

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>New club</h1>
          <p>Partner clubs get their own sub-admin panel once assigned.</p>
        </div>
      </div>
      <ClubForm />
    </div>
  );
}
