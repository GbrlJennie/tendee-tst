import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitAttendance, getAttendanceLogs } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state seperti di gambar
  const [category, setCategory] = useState('WFO'); // WFO atau WFH
  const [notes, setNotes] = useState('');

  // Cek apakah user aktif
  const isUserActive = user?.status === 'active';

  // Fetch attendance logs on component mount
  useEffect(() => {
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;
    
    setIsLoadingLogs(true);
    try {
      const response = await getAttendanceLogs();
      // Filter logs untuk user ini saja
      const userLogs = (response || []).filter(log => 
        String(log.user_id) === String(user.id)
      );
      setLogs(userLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    }
    setIsLoadingLogs(false);
  };

  const handleSubmit = async (eventType) => {
    // Cek status user
    if (!isUserActive) {
      setMessage({
        type: 'error',
        text: '❌ Akun Anda tidak aktif. Hubungi admin untuk mengaktifkan akun.',
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const userId = user?.id || user?._id || user?.user_id;

    if (!userId) {
      setMessage({
        type: 'error',
        text: '❌ User ID tidak ditemukan. Silakan login ulang.',
      });
      setIsLoading(false);
      return;
    }

    try {
      await submitAttendance(userId, eventType, category, notes);
      setMessage({
        type: 'success',
        text: `✅ Berhasil ${eventType === 'CHECK_IN' ? 'Check In' : 'Check Out'} - ${category}`,
      });
      setNotes(''); // Reset notes
      fetchLogs();
    } catch (error) {
      console.error('Attendance error:', error.response?.data || error);
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message || 
                       '❌ Gagal mencatat kehadiran';
      setMessage({
        type: 'error',
        text: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
      });
    }

    setIsLoading(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    };
  };

  return (
    <div className="dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🏢 Attendance Hub</h1>
            <p className="subtitle">Portal Queenify Official</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-email">{user?.email}</span>
                <div className="user-badges">
                  {user?.role && <span className="role-badge">{user.role}</span>}
                  <span className={`status-badge-user ${isUserActive ? 'active' : 'inactive'}`}>
                    {isUserActive ? '● Active' : '● Inactive'}
                  </span>
                </div>
              </div>
            </div>
            {isAdmin() && (
              <button onClick={() => navigate('/admin')} className="admin-button">
                ⚙️ Admin Panel
              </button>
            )}
            <button onClick={logout} className="logout-button">
              🚪 Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Input Kehadiran Panel */}
          <section className="attendance-panel">
            <div className="panel-header">
              <h3>Input Kehadiran</h3>
              <p>Masukkan data log.</p>
            </div>

            {/* Status Warning untuk Inactive User */}
            {!isUserActive && (
              <div className="inactive-warning">
                ⚠️ Akun Anda tidak aktif. Anda tidak dapat melakukan presensi.
              </div>
            )}

            {message.text && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <div className="form-group">
              <label>User ID (NIM/NIP)</label>
              <input 
                type="text" 
                value={user?.id || ''} 
                disabled 
                className="input-disabled"
              />
            </div>

            <div className="form-group">
              <label>Kategori Kehadiran</label>
              <div className="category-buttons">
                <button
                  type="button"
                  className={`category-btn ${category === 'WFO' ? 'active' : ''}`}
                  onClick={() => setCategory('WFO')}
                  disabled={!isUserActive}
                >
                  🏢 WFO
                </button>
                <button
                  type="button"
                  className={`category-btn ${category === 'WFH' ? 'active' : ''}`}
                  onClick={() => setCategory('WFH')}
                  disabled={!isUserActive}
                >
                  🏠 WFH
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Catatan (Opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cth: Demam tinggi / Meeting luar"
                rows={3}
                disabled={!isUserActive}
              />
            </div>

            <div className="action-buttons">
              <button
                onClick={() => handleSubmit('CHECK_IN')}
                disabled={isLoading || !isUserActive}
                className="btn-checkin"
              >
                {isLoading ? '⏳' : '📥'} Check In
              </button>
              <button
                onClick={() => handleSubmit('CHECK_OUT')}
                disabled={isLoading || !isUserActive}
                className="btn-checkout"
              >
                {isLoading ? '⏳' : '📤'} Check Out
              </button>
            </div>
          </section>

          {/* Live Attendance Logs */}
          <section className="attendance-history">
            <div className="history-header">
              <h3>Live Attendance Logs</h3>
              <button onClick={fetchLogs} className="refresh-button" disabled={isLoadingLogs}>
                Refresh
              </button>
            </div>

            {isLoadingLogs ? (
              <div className="loading">Memuat data...</div>
            ) : logs.length > 0 ? (
              <div className="table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>TIME</th>
                      <th>USER ID</th>
                      <th>EVENT</th>
                      <th>CATEGORY</th>
                      <th>NOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => {
                      const { time, date } = formatTime(log.timestamp);
                      return (
                        <tr key={log.id || index}>
                          <td>
                            <div className="time-cell">
                              <span className="time">{time}</span>
                              <span className="date">{date}</span>
                            </div>
                          </td>
                          <td><span className="user-id">#{log.user_id}</span></td>
                          <td>
                            <span className={`event-badge ${log.event_type?.toLowerCase()}`}>
                              {log.event_type}
                            </span>
                          </td>
                          <td>
                            <span className={`category-badge ${log.category?.toLowerCase()}`}>
                              {log.category}
                            </span>
                          </td>
                          <td>{log.notes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>📭 Belum ada riwayat kehadiran</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;