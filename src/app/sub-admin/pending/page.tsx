export default function SubAdminPendingPage() {
  return (
    <div>
      <div className="app-topbar">
        <div>
          <h1>Waiting on a club assignment</h1>
          <p>An admin needs to assign you to a club before you can manage a roster or events.</p>
        </div>
      </div>
      <div className="table-wrap">
        <div className="empty-state">Nothing to do here yet — check back after an admin assigns your club.</div>
      </div>
    </div>
  );
}
