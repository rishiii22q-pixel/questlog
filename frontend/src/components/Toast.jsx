export default function Toast({ message, type = 'success' }) {
  const icon = type === 'success' ? '✅' : 'ℹ️';
  return (
    <div className={`toast ${type}`}>
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
}
