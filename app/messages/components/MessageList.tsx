import React from "react";
import type { MessageDTO } from "../messageTypes";
import styles from "../MessagesPage.module.css";

interface MessageListProps {
  messages: MessageDTO[];
  activeTab: "inbox" | "sent";
  selectedMessageId: number | null;
  loading: boolean;
  onSelectMessage: (msg: MessageDTO) => void;
  userMap: Record<number, string>; // NOWE
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  activeTab, 
  selectedMessageId, 
  loading, 
  onSelectMessage,
  userMap // NOWE
}) => {

  // Helper do pobierania nazwy
  const getName = (id: number, fallbackName?: string) => {
      return userMap[id] || fallbackName || `ID: ${id}`;
  };

  return (
    <div className={`${styles.messagesList} ${selectedMessageId ? styles.hiddenMobile : ''}`}>
      {messages.length === 0 ? (
         <div className={styles.emptyState}>
            {loading ? "Loading..." : "No messages found"}
         </div>
      ) : (
        messages.map((msg) => {
           // Jeśli Inbox: Pokaż Nadawcę. Jeśli Sent: Pokaż Odbiorcę.
           const displayName = activeTab === "inbox" 
                ? getName(msg.senderId, msg.senderName)
                : `To: ${getName(msg.recipientId, msg.recipientName)}`;

           return (
            <div
              key={msg.id}
              onClick={() => onSelectMessage(msg)}
              className={`${styles.messageCard} ${selectedMessageId === msg.id ? styles.active : ""}`}
            >
              <div className={styles.msgHeader}>
                <span className={styles.sender}>
                  {displayName}
                </span>
                <span className={styles.date}>
                  {new Date(msg.sentAt).toLocaleDateString()}
                </span>
              </div>
              <span className={styles.subject}>
                  {msg.subject}
              </span>
              <div className={styles.preview}>{msg.content}</div>
            </div>
          );
        })
      )}
    </div>
  );
};