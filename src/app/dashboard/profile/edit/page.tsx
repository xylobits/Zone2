import { requireUser } from '@/lib/auth/roles';
import { ProfileForm } from './ProfileForm';

export default async function EditProfilePage() {
  const { profile } = await requireUser();

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Edit profile</h1>
          <p>These details drive your matches.</p>
        </div>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
