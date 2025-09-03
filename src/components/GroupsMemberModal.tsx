import { useEffect, useRef, useState } from "react";
import "../css/ConfirmModal.css"; // Reutiliza estilos del modal oscuro
import NotificationMessage from "./NotificationMessage";
import { fetchWithToken } from "../api/fetchWithToken";
import ImportFromExcelModal from "./ImportFromExcelModal";

interface Props {
    isOpen: boolean;
    groupId: number;
    groupName: string;
    onClose: () => void;
}

interface Contact {
    id: number;
    name: string;
    phone: string;
}

export default function GroupMembersModal({ isOpen, groupId, groupName, onClose }: Props) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [id, setIdContact] = useState(0);
    const [name, setNewName] = useState("");
    const [phone, setNewPhone] = useState("");
    const [notification, setNotification] = useState<{
        message: string;
        type?: "success" | "error";
    } | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);


    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (isOpen) fetchContacts();

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    async function fetchContacts() {
        const res = await fetch(`${apiUrl}/groups/${groupId}/contacts`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        const data = await res.json();
        setContacts(data.contacts || []);
    }

    const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    if (!isOpen) return null;

    async function handleAddContact() {
        try {
            let res: Response | void;

            if (id > 0) {
                res = await fetchWithToken(`${apiUrl}/groups/${groupId}/contacts/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone }),
                });
            } else {
                res = await fetchWithToken(`${apiUrl}/groups/${groupId}/contacts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone }),
                });
            }

            if (!res) return;
            const data = await res.json();
            setIdContact(0);
            setNewName("");
            setNewPhone("");

            if (res.ok) {
                setShowAddModal(false);
                setNotification({ message: `✅ ${data.message}`, type: "success" });
                fetchContacts();
            } else {
                setNotification({
                    message: `❌ ${data.message || "Error al guardar contacto"}`,
                    type: "error",
                });
            }
        } catch (error) {
            setNotification({ message: "❌ Error inesperado", type: "error" });
            console.error(error);
        }
    }

    async function OpenEditModal(contact?: Contact) {
        setIdContact(contact?.id ?? 0);
        setNewName(contact?.name ?? "");
        setNewPhone(contact?.phone ?? "");
        setShowAddModal(true);
    }

    async function DeleteContact(contactId: number) {
        try {
            const res = await fetchWithToken(`${apiUrl}/groups/${groupId}/contacts/${contactId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone }),
            });

            if (!res) return;
            const data = await res.json();
            if (res.ok) {
                setNotification({ message: `🗑️ ${data.message}`, type: "success" });
                fetchContacts();
            } else {
                setNotification({ message: "❌ No se pudo eliminar el contacto" });
            }
        } catch {
            setNotification({ message: "❌ Error inesperado", type: "error" });
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-contact">
                <header className="modal-header">
                    <h2>Miembros de {groupName}</h2>
                    <button className="modal-close" onClick={onClose}>✖</button>
                </header>

                <div className="modal-body">
                    <div className="filters-bar">
                        <input
                            type="text"
                            placeholder="🔍 Buscar por nombre o teléfono"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #444",
                                backgroundColor: "#2a2a2a",
                                color: "#fff",
                                marginRight: 10,
                            }}
                        />
                        <div className="dropdown-container" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(prev => !prev)}
                                className="dropdown-toggle"
                            >
                                👤 Agregar Miembro ▾
                            </button>

                            {showDropdown && (
                                <div className="dropdown-content">
                                    <button onClick={() => {
                                        OpenEditModal();
                                        setTimeout(() => setShowDropdown(false), 10);
                                    }}>
                                        👤 Individual
                                    </button>
                                    <div
                                        className="dropdown-option"
                                        onClick={() => {
                                            setShowImportModal(true);
                                            setTimeout(() => setShowDropdown(false), 10);
                                        }}
                                    >
                                        📄 Desde Excel
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="table-scroll">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Número de Teléfono</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.name}</td>
                                        <td>{c.phone}</td>
                                        <td className="actions">
                                            <button title="Editar ✏️" onClick={() => OpenEditModal(c)}>✏️</button>
                                            <button title="Eliminar 🗑️" onClick={() => DeleteContact(c.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: "center", padding: 16, color: "#aaa" }}>
                                            No hay coincidencias
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="pager">
                        <span>Total Contactos: {filtered.length}</span>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-new-contact">
                        <div className="modal-header">
                            <h2>{id && id > 0 ? "Editar" : "Agregar"} Miembro</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✖</button>
                        </div>
                        <div className="modal-body">
                            <label htmlFor="name">Nombre</label>
                            <input
                                type="text"
                                placeholder="Nombre"
                                value={name}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <label htmlFor="phone">Teléfono</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Teléfono"
                                pattern="[0-9]*"
                                value={phone}
                                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancelar</button>
                            <button className="btn-save" onClick={handleAddContact}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {showImportModal && (
                <ImportFromExcelModal
                    onClose={() => setShowImportModal(false)}
                    onImport={(file) => {
                        // Aquí manejas el archivo importado
                        // Por ejemplo, subirlo al servidor:
                        const formData = new FormData();
                        formData.append("file", file);
                        fetchWithToken(`${apiUrl}/groups/${groupId}/import`, {
                            method: "POST",
                            body: formData
                        })
                            .then(res => res?.json())
                            .then(data => {
                                setNotification({ message: data.message || "Importación completada" });
                                setShowImportModal(false);
                                fetchContacts(); // refrescar la lista de contactos
                            })
                            .catch(() => {
                                setNotification({ message: "❌ Error al importar desde Excel" });
                            });
                    }}
                />
            )}

            {notification && (
                <NotificationMessage
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}
