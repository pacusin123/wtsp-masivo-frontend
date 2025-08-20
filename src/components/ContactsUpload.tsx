import { useEffect, useState } from "react";
import { fetchWithToken } from "../api/fetchWithToken";
import ConfirmModal from "../components/ConfirmModal";
import NotificationMessage from "../components/NotificationMessage";
import CreateGroupModal from "../components/CreateGroupModal";
import "../css/ContactsUpload.css";
import GroupMembersModal from "./GroupsMemberModal";

const apiUrl = import.meta.env.VITE_API_URL;

interface ContactGroup {
  id: number;
  name: string;
}

export default function ContactsUpload() {
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [editedName, setEditedName] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGroupToView, setSelectedGroupToView] = useState<ContactGroup | null>(null);



  // Modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ContactGroup | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    const res = await fetchWithToken(`${apiUrl}/groups`);
    if (!res) return;
    const data = await res.json();
    setGroups(data.groups || []);
  }

  function openEditModal(group: ContactGroup) {
    setSelectedGroup(group);
    setEditedName(group.name);
    setShowModal(true);
  }

  function openDeleteModal(group: ContactGroup) {
    setGroupToDelete(group);
    setShowDeleteModal(true);
  }

  function openViewModal(group: ContactGroup) {
    setSelectedGroupToView(group);
    setShowViewModal(true);
  }

  async function handleSave() {
    if (!selectedGroup) return;

    const response = await fetchWithToken(`${apiUrl}/groups/${selectedGroup.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editedName }),
    });

    if (!response) return;

    if (response.ok) {
      setGroups((prev) =>
        prev.map((g) => (g.id === selectedGroup.id ? { ...g, name: editedName } : g))
      );
      setShowModal(false);
      setNotification({ message: "✅ Grupo actualizado con éxito", type: "success" });
    } else {
      setNotification({ message: "❌ Error al actualizar el grupo", type: "error" });
    }
  }

  async function handleDeleteConfirm() {
    if (!groupToDelete) return;

    const response = await fetchWithToken(`${apiUrl}/groups/${groupToDelete.id}`, {
      method: "DELETE",
    });
    
    if (!response) return;

    if (response.ok) {
      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      setNotification({ message: "🗑️ Grupo eliminado", type: "success" });
    } else {
      setNotification({ message: "❌ No se pudo eliminar el grupo" });
    }

    setGroupToDelete(null);
    setShowDeleteModal(false);
  }

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Grupos</h2>
        <div className="dashboard-controls">
          <input
            type="text"
            placeholder="Buscar por nombre de grupo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-create" onClick={() => setShowCreateModal(true)}>+ Crear Grupo</button>
        </div>
      </div>

      {notification && (
        <NotificationMessage
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <table className="group-table">
        <colgroup>
          <col style={{ width: "10%" }} />
          <col style={{ width: "60%" }} />
          <col style={{ width: "30%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Id</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.map((group) => (
            <tr key={group.id}>
              <td>{group.id}</td>
              <td>{group.name}</td>
              <td className="actions">
                <button title="Ver 👁️" onClick={() => openViewModal(group)} style={{ marginRight: "8px" }}>👁️</button>
                <button title="Editar ✏️" onClick={() => openEditModal(group)} style={{ marginRight: "8px" }}>✏️</button>
                <button title="Eliminar 🗑️" onClick={() => openDeleteModal(group)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled>Anterior</button>
        <span>Página 1 de 1</span>
        <button disabled>Siguiente</button>
      </div>

      {/* MODAL DE EDICIÓN */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modern">
            <div className="modal-header">
              <h2>Editar Grupo</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
            </div>
            <div className="modal-body">
              <label htmlFor="groupName">Nombre del Grupo</label>
              <input
                id="groupName"
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Grupo"
        message={`¿Estás seguro de eliminar el grupo "${groupToDelete?.name}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={(newGroup) => {
          setGroups((prev) => [newGroup, ...prev]);
          setNotification({ message: "✅ Grupo creado con éxito", type: "success" });
        }}
      />
      {selectedGroupToView && (
        <GroupMembersModal
          isOpen={showViewModal}
          groupId={selectedGroupToView.id}
          groupName={selectedGroupToView.name}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
}
