import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitAbsensi, getAttendanceByUser } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch attendance logs on component mount
  useEffect(() => {
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;
    
    setIsLoadingLogs(true);
    try {
      const response = await getAttendanceByUser(user.id);
      setLogs(response.data || response || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    }
    setIsLoadingLogs(false);
  };

  const handleAbsen = async (status) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Ambil user ID dari berbagai kemungkinan field
    const userId = user?.id || user?._id || user?.user_id || user?.userId;
    
    console.log('User object:', user); // Debug
    console.log('User ID being used:', userId); // Debug

    if (!userId) {
      setMessage({
        type: 'error',
        text: '❌ User ID tidak ditemukan. Silakan login ulang.',
      });
      setIsLoading(false);
      return;
    }

    try {
      await submitAbsensi(userId, status);
      setMessage({
        type: 'success',
        text: `✅ Berhasil mencatat kehadiran: ${status}`,
      });
      fetchLogs(); // Refresh logs after submission
    } catch (error) {
      console.error('Absensi error:', error.response?.data || error);
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message || 
                       error.response?.data?.error ||
                       '❌ Gagal mencatat kehadiran';
      setMessage({
        type: 'error',
        text: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
      });
    }

    setIsLoading(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h2>Selamat Datang, {user?.name || 'User'}! 👋</h2>
              <p>{user?.email}</p>
              {user?.role && <span className="role-badge">{user.role}</span>}
            </div>
          </div>
          <button onClick={logout} className="logout-button">
            🚪 Keluar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Attendance Panel */}
        <section className="attendance-panel">
          <h3>📋 Panel Absensi</h3>
          <p className="panel-description">
            Klik tombol di bawah untuk mencatat kehadiran Anda hari ini
          </p>

          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <div className="attendance-buttons">
            <button
              onClick={() => handleAbsen('Hadir')}
              disabled={isLoading}
              className="btn-hadir"
            >
              {isLoading ? '⏳' : '✅'} Hadir
            </button>
            <button
              onClick={() => handleAbsen('Izin')}
              disabled={isLoading}
              className="btn-izin"
            >
              {isLoading ? '⏳' : '📝'} Izin
            </button>
            <button
              onClick={() => handleAbsen('Sakit')}
              disabled={isLoading}
              className="btn-sakit"
            >
              {isLoading ? '⏳' : '🏥'} Sakit
            </button>
          </div>
        </section>

        {/* Attendance History */}
        <section className="attendance-history">
          <div className="history-header">
            <h3>📊 Riwayat Kehadiran</h3>
            <button onClick={fetchLogs} className="refresh-button" disabled={isLoadingLogs}>
              🔄 Refresh
            </button>
          </div>

          {isLoadingLogs ? (
            <div className="loading">Memuat data...</div>
          ) : logs.length > 0 ? (
            <div className="table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Tanggal & Waktu</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id || index}>
                      <td>{index + 1}</td>
                      <td>{formatDate(log.created_at || log.timestamp)}</td>
                      <td>
                        <span className={`status-badge status-${log.status?.toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>📭 Belum ada riwayat kehadiran</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
