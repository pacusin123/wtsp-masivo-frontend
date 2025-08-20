export default function Panel({ onLogout }: { onLogout: () => void }) {
  return (
    <div>
      <h2>Bienvenido al Panel Principal</h2>
      <button onClick={onLogout}>Cerrar sesión</button>
    </div>
  );
}
