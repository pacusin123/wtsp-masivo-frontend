// 🔹 Tipo unión (los posibles valores que devuelve la BD)
export type MessageSendStatus = "0" | "1" | "2" | "3" | "4"| "5";

// 🔹 Objeto "enum" para usar con autocompletado
export const MessageSendStatusValues = {
  Created: "0",
  Sent: "1",
  Delivered: "2",
  Read: "3",
  Partial: "4",
  Initiated: "5",
} as const;

// 🔹 Labels amigables (map bien tipado)
export const statusLabels: Record<MessageSendStatus, string> = {
  "0": "Creado",
  "1": "Enviado",
  "2": "Entregado",
  "3": "Leído",
  "4": "Parcial",
  "5": "Iniciado",
};
