import { useState } from 'react'

export default function TaskTable({
  tasks, isAdmin, loading,
  onStatusChange, onObservationChange, onEdit, onDelete
}) {
  const [editingObs, setEditingObs] = useState(null)
  const [obsValue, setObsValue] = useState('')

  function startEditObs(task) {
    setEditingObs(task.id)
    setObsValue(task.observations || '')
  }

  function saveObs(taskId) {
    onObservationChange(taskId, obsValue)
    setEditingObs(null)
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function isOverdue(task) {
    if (!task.deadline || task.status === 'terminata') return false
    return new Date(task.deadline) < new Date(new Date().toDateString())
  }

  if (loading) {
    return (
      <div className="loading-inline">
        <div className="loader"></div>
        <p>Se încarcă taskurile...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📭</span>
        <h2>Niciun task momentan</h2>
        <p>{isAdmin ? 'Creează primul task apăsând butonul „+ Task nou".' : 'Nu ai taskuri asignate încă.'}</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            <th className="col-nr">#</th>
            <th className="col-desc">Descriere</th>
            {isAdmin && <th className="col-assigned">Asignat</th>}
            <th className="col-deadline">Deadline</th>
            <th className="col-status">Status</th>
            <th className="col-obs">Observații</th>
            {isAdmin && <th className="col-actions">Acțiuni</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className={`${task.status === 'terminata' ? 'row-done' : ''} ${isOverdue(task) ? 'row-overdue' : ''}`}>
              <td className="col-nr">{task.task_number}</td>
              <td className="col-desc">
                <div className="task-description">
                  {task.description}
                  {task.link && (
                    <a href={task.link} target="_blank" rel="noopener noreferrer" className="task-link">
                      🔗 Link
                    </a>
                  )}
                </div>
              </td>
              {isAdmin && (
                <td className="col-assigned">
                  <span className="member-name">
                    {task.assigned_user?.full_name || task.assigned_user?.email || '—'}
                  </span>
                </td>
              )}
              <td className={`col-deadline ${isOverdue(task) ? 'overdue' : ''}`}>
                {formatDate(task.deadline)}
                {isOverdue(task) && <span className="overdue-badge">Depășit</span>}
              </td>
              <td className="col-status">
                <select
                  value={task.status}
                  onChange={e => onStatusChange(task.id, e.target.value)}
                  className={`status-select ${task.status}`}
                >
                  <option value="in_lucru">În lucru</option>
                  <option value="terminata">Terminată</option>
                </select>
              </td>
              <td className="col-obs">
                {editingObs === task.id ? (
                  <div className="obs-edit">
                    <textarea
                      value={obsValue}
                      onChange={e => setObsValue(e.target.value)}
                      rows={2}
                      autoFocus
                    />
                    <div className="obs-actions">
                      <button className="btn-small btn-save" onClick={() => saveObs(task.id)}>✓</button>
                      <button className="btn-small btn-cancel" onClick={() => setEditingObs(null)}>✗</button>
                    </div>
                  </div>
                ) : (
                  <div className="obs-display" onClick={() => startEditObs(task)}>
                    {task.observations || <span className="obs-placeholder">Click pentru a adăuga...</span>}
                  </div>
                )}
              </td>
              {isAdmin && (
                <td className="col-actions">
                  <button className="btn-icon" onClick={() => onEdit(task)} title="Editează">✏️</button>
                  <button className="btn-icon btn-delete" onClick={() => onDelete(task.id)} title="Șterge">🗑️</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
