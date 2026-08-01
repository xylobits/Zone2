import Link from 'next/link';
import { requireUser } from '@/lib/auth/roles';

export default async function ProfilePage() {
  const { profile } = await requireUser();

  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Your profile</h1>
          <p>What matches and clubs see about you.</p>
        </div>
        <Link className="btn btn-outline btn-sm" href="/dashboard/profile/edit">
          Edit profile
        </Link>
      </div>

      <div className="panel" style={{ maxWidth: 560 }}>
        <h3>{profile.display_name || 'No name set'}</h3>
        <p style={{ marginTop: 8, color: 'var(--mute)' }}>{profile.bio || 'No bio yet.'}</p>

        <div className="section-title">Details</div>
        <dl style={{ display: 'grid', gap: 10, fontSize: 14 }}>
          <Row label="Verification">
            <span className={`badge ${profile.verified_tier === 'verified' ? 'badge-green' : 'badge-mute'}`}>
              {profile.verified_tier}
            </span>
          </Row>
          <Row label="Intent">{profile.intent.replace('_', ' ')}</Row>
          <Row label="Consistency score">{profile.consistency_score}</Row>
          <Row label="Location">{profile.location_text || '—'}</Row>
          <Row label="Activities">
            {profile.primary_activities.length ? (
              <div className="checkbox-row">
                {profile.primary_activities.map((a) => (
                  <span key={a} className="badge">
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              '—'
            )}
          </Row>
        </dl>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <dt style={{ color: 'var(--mute)' }}>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
