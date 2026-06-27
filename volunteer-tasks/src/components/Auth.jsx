import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: 'volunteer' }
        }
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Cont creat! Verifică-ți emailul pentru confirmare, sau conectează-te direct dacă nu e activată confirmarea.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">📋</span>
          <h1>Gestiune Taskuri</h1>
          <p className="auth-subtitle">Platforma echipei de voluntari</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); setMessage('') }}
          >
            Conectare
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); setMessage('') }}
          >
            Cont nou
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Nume complet</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ion Popescu"
                required={!isLogin}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplu.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Parolă</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minim 6 caractere"
              required
              minLength={6}
            />
          </div>

          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Se procesează...' : isLogin ? 'Conectare' : 'Creează cont'}
          </button>
        </form>
      </div>
    </div>
  )
}
