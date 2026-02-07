export function LoadingState() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080808',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.875rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}
    >
      <div>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <div>Generating Mandala...</div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
