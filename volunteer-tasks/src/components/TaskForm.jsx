import { useState } from 'react'

export default function TaskForm({ task, members, onSave, onCancel }) {
  const [description, setDescription] = useState(task?.description || '')
  const [link, setLink] = useState(task?.link || '')
  const [deadline, setDeadline] = useState(task?.deadline || '')
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '')
  const [status, setStatus] = useState(task?.status || 'in_lucru')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      description,
      link: link || null,
      deadline: deadline || null,
      assigned_to: assignedTo || null,
      status,
    })
    setSaving(false)
  }

  const volunteers = members.filter(m => m.role === 'volunteer')

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Editează task' : 'Task nou'}</h2>
          <button className="btn-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Descriere task *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrierea taskului..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Link (opțional)</label>
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Asignat lui</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                <option value="">— Neasignat —</option>
                {volunteers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || m.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="in_lucru">În lucru</option>
                <option value="terminata">Terminată</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Anulează</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Se salvează...' : task ? 'Salvează' : 'Creează task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
