import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('attendance'); // Default tab
  const [logs, setLogs] = useState([]);
  const [notes, setNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Ambil history absensi saat komponen dimuat
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/attendance/logs');
      // Filter log hanya milik user yang login (sebaiknya filter di backend, tapi ini ok untuk demo)
      const myLogs = res.data.filter(log => String(log.user_id) === String(user.id));
      setLogs(myLogs);
    } catch (err) {
      console.error("Gagal ambil log", err);
    }
  };

  const handleAttendance = async (type) => {
    setStatusMsg('Memproses...');
    try {
      // PANGGIL BACKEND TENDEE
      // Backend akan: Cek user di Identity -> Simpan di Attendance
      await api.post('/attendance', {
        user_id: user.id,
        event_type: type, // "CHECK_IN" atau "CHECK_OUT"
        notes: notes
      });
      
      setStatusMsg(`Berhasil ${type}!`);
      setNotes('');
      fetchLogs(); // Refresh tabel
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Gagal melakukan absensi');
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="title">Tendee Platform</h1>
          <p className="subtitle">Layanan Absensi Terintegrasi</p>
        </div>
        <div style={{textAlign: 'right'}}>
          <p style={{fontWeight: '600', marginBottom: '5px'}}>Halo, {user.name}</p>
          <button onClick={onLogout} className="btn-danger" style={{fontSize: '0.8rem', borderRadius: '4px'}}>Logout</button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          📅 Absensi
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profil Saya
        </button>
      </div>

      {/* KONTEN TAB ABSENSI */}
      {activeTab === 'attendance' && (
        <div className="card" style={{maxWidth: '100%'}}>
          <h3 style={{marginTop: 0}}>Catat Kehadiran</h3>
          
          <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
            <input 
              type="text" 
              placeholder="Catatan harian (opsional)..." 
              className="input-field"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
            <button onClick={() => handleAttendance('CHECK_IN')} className="btn btn-success" style={{flex: 1}}>
              🟢 CHECK IN
            </button>
            <button onClick={() => handleAttendance('CHECK_OUT')} className="btn btn-danger" style={{flex: 1, backgroundColor: '#dc2626'}}>
              🔴 CHECK OUT
            </button>
          </div>

          {statusMsg && <div style={{padding: '10px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontWeight: '500'}}>{statusMsg}</div>}

          <h4 style={{marginBottom: '10px'}}>Riwayat Terakhir</h4>
          <div style={{overflowX: 'auto'}}>
            <table className="log-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Tipe</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? logs.map((log, i) => (
                  <tr key={i}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${log.event_type.toLowerCase()}`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td>{log.notes || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" style={{textAlign: 'center', color: '#888'}}>Belum ada data absensi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KONTEN TAB PROFIL */}
      {activeTab === 'profile' && (
        <div className="card" style={{maxWidth: '600px'}}>
          <h3 style={{marginTop: 0}}>Informasi Karyawan</h3>
          <div style={{display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px'}}>
            <div style={{color: '#64748b'}}>Nama</div>
            <div style={{fontWeight: '600'}}>{user.name}</div>
            
            <div style={{color: '#64748b'}}>ID Karyawan</div>
            <div>{user.id}</div>
            
            <div style={{color: '#64748b'}}>Email</div>
            <div>{user.email}</div>
            
            <div style={{color: '#64748b'}}>Role</div>
            <div style={{textTransform: 'capitalize'}}>{user.role}</div>
            
            <div style={{color: '#64748b'}}>Status</div>
            <div>
              <span style={{
                padding: '4px 8px', 
                borderRadius: '4px', 
                background: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                color: user.status === 'active' ? '#166534' : '#991b1b',
                fontWeight: 'bold', fontSize: '0.85rem'
              }}>
                {user.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}