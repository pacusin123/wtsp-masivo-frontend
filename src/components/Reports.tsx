import { useEffect, useMemo, useState } from "react";
import { fetchWithToken } from "../api/fetchWithToken";
import ReportDetails from "./ReportDetails";
import "../css/Reports.css";
import { MessageSendStatusValues, statusLabels, type MessageSendStatus } from "../types/MessageSendStatus";

interface Group { id: number; name: string }
interface Message { id: number; title: string }
const apiUrl = import.meta.env.VITE_API_URL;

interface SendingRow {
  id: number;
  group_id: number;
  group_name: string;
  message_id: number;
  message_title: string;
  total_contacts: number;
  created_count: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  partial_count: number;
  created_at: string;
}

const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString() : "-";

export default function Reports() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [groupId, setGroupId] = useState<number | "">("");
  const [messageId, setMessageId] = useState<number | "">("");
  const [status, setStatus] = useState<MessageSendStatus | "">("");
  const [search, setSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState("");

  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [rows, setRows] = useState<SendingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [g, m] = await Promise.all([
          fetchWithToken(`${apiUrl}/groups`),
          fetchWithToken(`${apiUrl}/messages`)
        ]);

        if (!g) return;
        const dataG = await g.json();
        setGroups(dataG.groups ?? []);

        if (!m) return;
        const dataM = await m.json();
        setMessages(dataM.messages ?? []);
      } catch { }
    })();
  }, []);

  const filterQuery = useMemo(() => {
    const p = new URLSearchParams();
    if (dateFrom) p.set("dateFrom", dateFrom);
    if (dateTo) p.set("dateTo", dateTo);
    if (groupId !== "") p.set("groupId", String(groupId));
    if (messageId !== "") p.set("messageId", String(messageId));
    if (status) p.set("status", status);
    if (search) p.set("search", search.trim());
    return p.toString();
  }, [dateFrom, dateTo, groupId, messageId, status, search]);

  const query = useMemo(() => {
    const p = new URLSearchParams(appliedFilters);
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    return p.toString();
  }, [appliedFilters, page, pageSize]);

  useEffect(() => {
    if (!query) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWithToken(`${apiUrl}/reports/sendings?${query}`);
        if (!res) return;
        if (res.ok) {
          const result: { data: SendingRow[]; total: number } = await res.json();
          setRows(result?.data ?? []);
          setTotal(result?.total ?? 0);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="reports-container">
      <header className="reports-header">
        <h2 className="title">Reportes de Envíos</h2>
        <div className="filters">
          <input title="Fecha Inicial" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input title="Fecha Final" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <select title="Grupo" value={groupId as any} onChange={e => setGroupId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Todos los grupos</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select title="Mensaje" value={messageId as any} onChange={e => setMessageId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Todos los mensajes</option>
            {messages.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
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
          <input placeholder="Buscar" value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => { setPage(1); setAppliedFilters(filterQuery); }}>Buscar</button>
        </div>
      </header>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Grupo</th>
              <th>Mensaje</th>
              <th>Total</th>
              <th>Creados</th>
              <th>Enviados</th>
              <th>Entregados</th>
              <th>Leídos</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9}>Cargando...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={9}>Sin resultados</td></tr>
            ) : (
              rows.map(r => {
                const overall: MessageSendStatus = r.total_contacts === 0
                  ? MessageSendStatusValues.Initiated
                  : r.created_count > 0 && (r.sent_count > 0 || r.delivered_count > 0 || r.read_count > 0)
                    ? MessageSendStatusValues.Partial
                    : r.created_count > 0
                      ? MessageSendStatusValues.Created
                      : r.sent_count > 0
                        ? MessageSendStatusValues.Sent
                        : r.delivered_count > 0
                          ? MessageSendStatusValues.Delivered
                          : MessageSendStatusValues.Read;
                return (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{formatDate(r.created_at)}</td>
                    <td>{r.group_name}</td>
                    <td>{r.message_title}</td>
                    <td>{r.total_contacts}</td>
                    <td>{r.created_count}</td>
                    <td>{r.sent_count}</td>
                    <td>{r.delivered_count}</td>
                    <td>{r.read_count}</td>
                    <td><span className={`badge badge-${statusLabels[overall]}`}>{statusLabels[overall]}</span></td>
                    <td><button onClick={() => setOpenId(r.id)}>Ver detalles</button></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <footer className="pager">
        <div>Página {page} / {totalPages}</div>
        <div className="pager-actions">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
          <select title="Paginador" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Siguiente</button>
        </div>
      </footer>

      {openId && (
        <ReportDetails sendingId={openId} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}