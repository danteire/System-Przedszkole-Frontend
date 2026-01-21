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
  senderName?: string; // Opcjonalne, jeśli backend zwraca zjoinowane nazwy
  recipientName?: string;
  subject: string;
  content: string;
  sentAt: string; // ISO string
  replyToMessageId?: number;
  attachments?: MessageAttachmentDTO[];
}

export interface Account {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string; // np. 'ADMIN', 'TEACHER', 'PARENT'
}