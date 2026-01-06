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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Find user name by ID
  const getUserName = (userId) => {
    const foundUser = users.find((u) => u.id === userId);
    return foundUser?.name || userId;
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
                      <th>No</th>
                      <th>User ID</th>
                      <th>Nama User</th>
                      <th>Status</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={log.id || index}>
                        <td>{index + 1}</td>
                        <td><code>{log.user_id}</code></td>
                        <td>{getUserName(log.user_id)}</td>
                        <td>
                          <span className={`status-badge status-${log.status?.toLowerCase()}`}>
                            {log.status}
                          </span>
                        </td>
                        <td>{formatDate(log.created_at || log.timestamp)}</td>
                      </tr>
                    ))}
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
                      <th>No</th>
                      <th>ID</th>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Terdaftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => (
                      <tr key={u.id || index}>
                        <td>{index + 1}</td>
                        <td><code>{u.id}</code></td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge role-${u.role?.toLowerCase()}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td>{u.created_at ? formatDate(u.created_at) : '-'}</td>
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
