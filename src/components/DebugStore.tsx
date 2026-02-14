import { useAuthStore } from '@/stores/authStore';

/**
 * Debug component để kiểm tra Zustand store state
 * Để sử dụng: <DebugStore />
 */
export const DebugStore = () => {
  const state = useAuthStore();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      maxWidth: '400px',
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '11px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxHeight: '300px',
      overflowY: 'auto',
      border: '1px solid #475569'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#60a5fa' }}>
        📊 Zustand Store State
      </div>

      <div style={{ marginBottom: '6px' }}>
        <strong>isAuthenticated:</strong> {String(state.isAuthenticated)}
      </div>

      <div style={{ marginBottom: '6px' }}>
        <strong>accessToken:</strong> {state.accessToken ? `${state.accessToken.substring(0, 20)}...` : 'null'}
      </div>

      <div style={{ marginBottom: '6px', backgroundColor: '#0f172a', padding: '6px', borderRadius: '4px' }}>
        <strong>userProfile:</strong>
        <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {state.userProfile ? JSON.stringify(state.userProfile, null, 2) : 'null'}
        </pre>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <strong>Permissions:</strong> {state.userProfile?.permissions ? state.userProfile.permissions.join(', ') : 'none'}
      </div>

      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #475569', fontSize: '10px', color: '#94a3b8' }}>
        F12 Console cũng có logs từ PermissionGuard
      </div>
    </div>
  );
};

export default DebugStore;
