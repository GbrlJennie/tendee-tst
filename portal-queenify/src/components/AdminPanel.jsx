import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAttendanceLogs, getAllUsers } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, logout, isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchLogs(), fetchUsers()]);
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await getAttendanceLogs();
      setLogs(response.data || response || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    }
    setIsLoadingLogs(false);
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await getAllUsers();
      setUsers(response.data || response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
    setIsLoadingUsers(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Find user name by ID
  const getUserName = (userId) => {
    const foundUser = users.find((u) => String(u.id) === String(userId));
    return foundUser?.name || `User #${userId}`;
  };

  // Get user status by ID
  const getUserStatus = (userId) => {
    const foundUser = users.find((u) => String(u.id) === String(userId));
    return foundUser?.status || 'unknown';
  };

  if (!isAdmin()) {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h2>🚫 Akses Ditolak</h2>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="admin-info">
            <h1>⚙️ Admin Panel</h1>
            <p>Portal Queenify Official - Monitoring Dashboard</p>
          </div>
          <div className="admin-actions">
            <span className="admin-badge">👑 Admin: {user?.name}</span>
            <button onClick={logout} className="logout-button">
              🚪 Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button
          className={`nav-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📊 Log Kehadiran
        </button>
        <button
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Daftar User
        </button>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'logs' && (
          <section className="panel-section">
            <div className="section-header">
              <h2>📊 Semua Log Kehadiran</h2>
              <button onClick={fetchLogs} className="refresh-button" disabled={isLoadingLogs}>
                🔄 Refresh
              </button>
            </div>

            {isLoadingLogs ? (
              <div className="loading">Memuat data...</div>
            ) : logs.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TIME</th>
                      <th>USER ID</th>
                      <th>NAMA</th>
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
                          <td><span className="user-id-badge">#{log.user_id}</span></td>
                          <td>{getUserName(log.user_id)}</td>
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
                <p>📭 Belum ada data log kehadiran</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'users' && (
          <section className="panel-section">
            <div className="section-header">
              <h2>👥 Daftar User Terdaftar</h2>
              <button onClick={fetchUsers} className="refresh-button" disabled={isLoadingUsers}>
                🔄 Refresh
              </button>
            </div>

            {isLoadingUsers ? (
              <div className="loading">Memuat data...</div>
            ) : users.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NAMA</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => (
                      <tr key={u.id || index}>
                        <td><span className="user-id-badge">#{u.id}</span></td>
                        <td className="user-name">{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge role-${u.role?.toLowerCase()}`}>
                            {u.role || 'employee'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-user-badge ${u.status?.toLowerCase()}`}>
                            {u.status === 'active' ? '● Active' : '● Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>📭 Belum ada user terdaftar</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
