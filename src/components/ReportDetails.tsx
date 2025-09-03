import { useEffect, useState } from "react";
import { fetchWithToken } from "../api/fetchWithToken";
import { statusLabels, type MessageSendStatus } from "../types/MessageSendStatus";
import "../css/Reports.css";

const apiUrl = import.meta.env.VITE_API_URL;

interface SendingDetailRow {
    id: number;
    name: string | null;
    phone: string;
    status: MessageSendStatus;
    error_message: string | null;
    wa_message_id: string | null;
    sent_at: string | null;
}

const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString() : "-";

export default function ReportDetails({ sendingId, onClose }: { sendingId: number, onClose: () => void }) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [status, setStatus] = useState<MessageSendStatus | "">("");
    const [search, setSearch] = useState("");
    const [rows, setRows] = useState<SendingDetailRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
                if (status) query.set("status", status);
                if (search) query.set("search", search.trim());
                const res = await fetchWithToken(`${apiUrl}/reports/sendings/${sendingId}/details?` + query.toString());
                if (!res) return;
                const result = await res.json();
                setRows(result?.data ?? []);
                setTotal(result?.total ?? 0);
            } finally {
                setLoading(false);
            }
        })();
    }, [sendingId, page, pageSize, status, search]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="modal-backdrop">
            <div className="report-details-modal">
                <header className="modal-header">
                    <h3>Detalle de envío #{sendingId}</h3>
                    <button onClick={onClose}>×</button>
                </header>

                <div className="modal-toolbar">
                    <select
                        title="Estado"
                        value={status as MessageSendStatus | ""}
                        onChange={(e) => setStatus(e.target.value as MessageSendStatus | "")}
                    >
                        <option value="">Todos los estados</option>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <input placeholder="Buscar" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    <select title="Paginador" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                        <option>20</option>
                        <option>50</option>
                        <option>100</option>
                    </select>
                </div>

                <div className="table-wrap">
                    <table className="table-details">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Contacto</th>
                                <th>Teléfono</th>
                                <th>Estado</th>
                                <th>Fecha de Envío</th>
                                <th>Error</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6}>Cargando...</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan={6}>Sin resultados</td></tr>
                            ) : (
                                rows.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>                                                                                
                                        <td>{r.name ?? "-"}</td>
                                        <td>{r.phone}</td>
                                        <td><span className={`badge badge-${statusLabels[r.status]}`}>{statusLabels[r.status]}</span></td>
                                        <td>{formatDate(r.sent_at ?? undefined)}</td>
                                        <td title={r.error_message ?? ""}>{r.error_message ?? "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <footer className="pager">
                    <div>Página {page} / {totalPages}</div>
                    <div className="pager-actions">
                        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
                        <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Siguiente</button>
                    </div>
                </footer>
            </div>
        </div>
    );
}