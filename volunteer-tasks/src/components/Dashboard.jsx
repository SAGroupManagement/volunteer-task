import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import TaskTable from './TaskTable'
import AdminPanel from './AdminPanel'
import TaskForm from './TaskForm'

export default function Dashboard({ session, profile, onLogout, onProfileUpdate }) {
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    fetchTasks()
    if (isAdmin) fetchMembers()

    // Real-time subscription pentru taskuri
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => { fetchTasks() }
      )
      .subscribe()

    // Real-time subscription pentru profiles
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => { if (isAdmin) fetchMembers() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [isAdmin])

  async function fetchTasks() {
    const query = supabase
      .from('tasks')
      .select('*, assigned_user:profiles!assigned_to(full_name, email)')
      .order('task_number', { ascending: true })

    const { data, error } = await query
    if (data) setTasks(data)
    setLoading(false)
  }

  async function fetchMembers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setMembers(data)
  }

  async function handleStatusChange(taskId, newStatus) {
    await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
  }

  async function handleObservationChange(taskId, observations) {
    await supabase
      .from('tasks')
      .update({ observations })
      .eq('id', taskId)
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm('Sigur vrei să ștergi acest task?')) return
    await supabase.from('tasks').delete().eq('id', taskId)
  }

  async function handleSaveTask(taskData) {
    if (editingTask) {
      await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTask.id)
    } else {
      await supabase
        .from('tasks')
        .insert({ ...taskData, created_by: session.user.id })
    }
    setShowTaskForm(false)
    setEditingTask(null)
  }

  function handleEditTask(task) {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const completedCount = tasks.filter(t => t.status === 'terminata').length
  const totalCount = tasks.length

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <span className="header-icon">📋</span>
          <div>
            <h1>Gestiune Taskuri</h1>
            <p className="header-role">
              {profile?.full_name || profile?.email}
              <span className={`role-badge ${isAdmin ? 'admin' : 'volunteer'}`}>
                {isAdmin ? 'Admin' : 'Voluntar'}
              </span>
            </p>
          </div>
        </div>
        <div className="header-right">
          {isAdmin && (
            <>
              <button
                className="btn-secondary"
                onClick={() => { setShowAdmin(!showAdmin); setShowTaskForm(false) }}
              >
                {showAdmin ? '← Taskuri' : '👥 Membrii'}
              </button>
              <button
                className="btn-primary"
                onClick={() => { setShowTaskForm(true); setEditingTask(null); setShowAdmin(false) }}
              >
                + Task nou
              </button>
            </>
          )}
          <button className="btn-logout" onClick={onLogout}>Ieșire</button>
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-number">{totalCount}</span>
          <span className="stat-label">Total taskuri</span>
        </div>
        <div className="stat">
          <span className="stat-number">{totalCount - completedCount}</span>
          <span className="stat-label">În lucru</span>
        </div>
        <div className="stat">
          <span className="stat-number">{completedCount}</span>
          <span className="stat-label">Terminate</span>
        </div>
        <div className="stat">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
          <span className="stat-label">Progres</span>
        </div>
      </div>

      <main className="main-content">
        {showTaskForm && (
          <TaskForm
            task={editingTask}
            members={members}
            onSave={handleSaveTask}
            onCancel={() => { setShowTaskForm(false); setEditingTask(null) }}
          />
        )}

        {showAdmin ? (
          <AdminPanel
            members={members}
            currentUserId={session.user.id}
            onRefresh={fetchMembers}
          />
        ) : (
          <TaskTable
            tasks={tasks}
            isAdmin={isAdmin}
            loading={loading}
            onStatusChange={handleStatusChange}
            onObservationChange={handleObservationChange}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}
      </main>
    </div>
  )
}
