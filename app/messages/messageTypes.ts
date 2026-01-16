// types/messageTypes.ts

export interface MessageAttachmentDTO {
  id: number;
  messageId: number;
  fileName: string;
  mimeType: string;
}

export interface MessageDTO {
  id: number;
  senderId: number;
  recipientId: number;
  senderName?: string; // Dodatkowe pole dla UI (zazwyczaj zaciągane z user-service)
  recipientName?: string; // Dodatkowe pole dla UI
  subject: string;
  content: string;
  sentAt: string; // ISO string dla LocalDateTime
  replyToMessageId?: number;
  attachments?: MessageAttachmentDTO[];
}

// Mockowanie użytkownika (W prawdziwej apce to przychodzi z AuthContext)
export const CURRENT_USER = {
  id: 1,
  name: "Jan Kowalski (Rodzic)",
  role: "PARENT" as "PARENT" | "TEACHER"
  // Zmień na "TEACHER", aby przetestować uprawnienia nauczyciela
};

// Mock bazy użytkowników do wyboru odbiorcy
const ALL_USERS = [
  { id: 2, name: "Pani Anna (Nauczyciel gr. 1)", role: "TEACHER" },
  { id: 3, name: "Pan Piotr (Nauczyciel WF)", role: "TEACHER" },
  { id: 4, name: "Maria Nowak (Rodzic)", role: "PARENT" },
  { id: 5, name: "Krzysztof Krawczyk (Rodzic)", role: "PARENT" },
];

// KLUCZOWA LOGIKA BIZNESOWA: Filtrowanie odbiorców
export const getAvailableRecipients = (userRole: string) => {
  if (userRole === "PARENT") {
    // Rodzic widzi tylko nauczycieli
    return ALL_USERS.filter(u => u.role === "TEACHER");
  } else if (userRole === "TEACHER") {
    // Nauczyciel widzi wszystkich (rodziców i innych nauczycieli)
    return ALL_USERS;
  }
  return [];
};