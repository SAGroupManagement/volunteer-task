import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminPanel({ members, currentUserId, onRefresh }) {
  const [changingRole, setChangingRole] = useState(null)

  async function handleRoleChange(memberId, newRole) {
    setChangingRole(memberId)
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', memberId)
    await onRefresh()
    setChangingRole(null)
  }

  async function handleRemoveMember(member) {
    if (!window.confirm(`Sigur vrei să elimini pe ${member.full_name || member.email}? Această acțiune va șterge profilul din aplicație.`)) return

    await supabase
      .from('profiles')
      .delete()
      .eq('id', member.id)

    // Notă: ștergerea din auth.users necesită funcție server-side
    // Profilul va fi șters, utilizatorul nu va mai putea accesa nimic
    await onRefresh()
  }

  const admins = members.filter(m => m.role === 'admin')
  const volunteers = members.filter(m => m.role === 'volunteer')

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>👥 Gestionare membrii</h2>
        <p className="admin-subtitle">
          Voluntarii își creează cont singuri la adresa site-ului. Tu le poți schimba rolul sau îi poți elimina de aici.
        </p>
      </div>

      <div className="members-section">
        <h3>Administratori ({admins.length})</h3>
        <div className="members-list">
          {admins.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-info">
                <span className="member-avatar">
                  {(member.full_name || member.email)[0].toUpperCase()}
                </span>
                <div>
                  <div className="member-name-text">{member.full_name || '(Fără nume)'}</div>
                  <div className="member-email">{member.email}</div>
                </div>
              </div>
              <div className="member-actions">
                {member.id === currentUserId ? (
                  <span className="badge-you">Tu</span>
                ) : (
                  <>
                    <button
                      className="btn-small btn-secondary"
                      onClick={() => handleRoleChange(member.id, 'volunteer')}
                      disabled={changingRole === member.id}
                    >
                      Fă voluntar
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleRemoveMember(member)}
                    >
                      Elimină
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="members-section">
        <h3>Voluntari ({volunteers.length})</h3>
        {volunteers.length === 0 ? (
          <p className="no-members">Niciun voluntar încă. Trimite-le link-ul site-ului să-și facă cont.</p>
        ) : (
          <div className="members-list">
            {volunteers.map(member => (
              <div key={member.id} className="member-card">
                <div className="member-info">
                  <span className="member-avatar volunteer">
                    {(member.full_name || member.email)[0].toUpperCase()}
                  </span>
                  <div>
                    <div className="member-name-text">{member.full_name || '(Fără nume)'}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
                <div className="member-actions">
                  <button
                    className="btn-small btn-secondary"
                    onClick={() => handleRoleChange(member.id, 'admin')}
                    disabled={changingRole === member.id}
                  >
                    Fă admin
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleRemoveMember(member)}
                  >
                    Elimină
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
