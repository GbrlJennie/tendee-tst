import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAttendanceLogs, getAllUsers } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, logout, isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');
  
  // Filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterUserId, setFilterUserId] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  // Apply filters when logs or filter values change
  useEffect(() => {
    applyFilters();
  }, [logs, filterDate, filterUserId]);

  const fetchAllData = async () => {
    await Promise.all([fetchLogs(), fetchUsers()]);
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await getAttendanceLogs(200);
      console.log('Raw attendance response:', response);
      
      // Handle different response structures
      let logsData = [];
      if (Array.isArray(response)) {
        logsData = response;
      } else if (response && Array.isArray(response.data)) {
        logsData = response.data;
      } else if (response && response.logs) {
        logsData = response.logs;
      }
      
      console.log('Processed logs data:', logsData);
      console.log('Total logs:', logsData.length);
      setLogs(logsData);
      setFilteredLogs(logsData); // Set initial filtered logs
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
      setFilteredLogs([]);
    }
    setIsLoadingLogs(false);
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await getAllUsers();
      console.log('Users response:', response);
      const usersData = Array.isArray(response) ? response : [];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
    setIsLoadingUsers(false);
  };

  const applyFilters = () => {
    let filtered = [...logs];
    
    console.log('Applying filters to', logs.length, 'logs');
    console.log('Filter date:', filterDate);
    console.log('Filter user ID:', filterUserId);
    
    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === filterDate;
      });
      console.log('After date filter:', filtered.length);
    }
    
    // Filter by user ID
    if (filterUserId) {
      filtered = filtered.filter(log => 
        String(log.user_id).includes(filterUserId)
      );
      console.log('After user ID filter:', filtered.length);
    }
    
    console.log('Final filtered logs:', filtered.length);
    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterUserId('');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    };
  };

  // Find user name by ID
  const getUserName = (userId) => {
    const foundUser = users.find((u) => String(u.id) === String(userId));
    return foundUser?.name || `User #${userId}`;
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
          📊 Log Kehadiran ({logs.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Daftar User ({users.length})
        </button>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'logs' && (
          <section className="panel-section">
            <div className="section-header">
              <h2>📊 Semua Log Kehadiran</h2>
              <div className="header-actions">
                <span className="log-count">{filteredLogs.length} dari {logs.length} log</span>
                <button onClick={fetchLogs} className="refresh-button" disabled={isLoadingLogs}>
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
              <div className="filter-group">
                <label htmlFor="filterDate">📅 Filter Tanggal:</label>
                <input
                  type="date"
                  id="filterDate"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterUserId">👤 Filter User ID:</label>
                <input
                  type="text"
                  id="filterUserId"
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  placeholder="Cari user ID..."
                  className="filter-input"
                />
              </div>
              {(filterDate || filterUserId) && (
                <button onClick={clearFilters} className="clear-filter-btn">
                  ✕ Clear Filter
                </button>
              )}
            </div>

            {isLoadingLogs ? (
              <div className="loading">Memuat data...</div>
            ) : filteredLogs.length > 0 ? (
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
                    {filteredLogs.map((log, index) => {
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
                            <span className={`event-badge ${log.event_type?.toLowerCase().replace('_', '-')}`}>
                              {log.event_type}
                            </span>
                          </td>
                          <td>
                            <span className={`category-badge ${log.category?.toLowerCase()}`}>
                              {log.category}
                            </span>
                          </td>
                          <td className="notes-cell">{log.notes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                {logs.length > 0 ? (
                  <p>🔍 Tidak ada log yang cocok dengan filter</p>
                ) : (
                  <p>📭 Belum ada data log kehadiran</p>
                )}
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
