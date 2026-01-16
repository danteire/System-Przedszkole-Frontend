import React, { useState } from "react";
import DashBoard from "~/commons/dashboard";
import { type MessageDTO, CURRENT_USER, getAvailableRecipients } from "./messageTypes";
import styles from "./MessagesPage.module.css"; // Import modułu CSS

// [MOCK DATA pozostaje bez zmian - skróciłem dla czytelności]
const MOCK_MESSAGES: MessageDTO[] = [
  {
    id: 101,
    senderId: 2,
    recipientId: 1,
    senderName: "Pani Anna (Nauczyciel gr. 1)",
    subject: "Wyprawka na wrzesień",
    content: "Dzień dobry, proszę o przyniesienie kredek...",
    sentAt: "2023-10-12T10:00:00",
  },
  {
    id: 102,
    senderId: 1,
    recipientId: 2,
    recipientName: "Pani Anna (Nauczyciel gr. 1)",
    subject: "Re: Wyprawka na wrzesień",
    content: "Dzień dobry, oczywiście doniesiemy jutro.",
    sentAt: "2023-10-12T12:30:00",
  }
];

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [messages, setMessages] = useState<MessageDTO[]>(MOCK_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<MessageDTO | null>(null);
  
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMsgRecipient, setNewMsgRecipient] = useState<string>("");
  const [newMsgSubject, setNewMsgSubject] = useState("");
  const [newMsgContent, setNewMsgContent] = useState("");

  const availableRecipients = getAvailableRecipients(CURRENT_USER.role);

  const displayedMessages = messages.filter((msg) => {
    if (activeTab === "inbox") return msg.recipientId === CURRENT_USER.id;
    if (activeTab === "sent") return msg.senderId === CURRENT_USER.id;
    return false;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgRecipient) return;

    const newMessage: MessageDTO = {
      id: Date.now(),
      senderId: CURRENT_USER.id,
      recipientId: parseInt(newMsgRecipient),
      senderName: CURRENT_USER.name,
      recipientName: availableRecipients.find(u => u.id === parseInt(newMsgRecipient))?.name,
      subject: newMsgSubject,
      content: newMsgContent,
      sentAt: new Date().toISOString(),
      attachments: []
    };

    setMessages([newMessage, ...messages]);
    setIsComposeOpen(false);
    resetForm();
    setActiveTab("sent");
  };

  const handleReply = (msg: MessageDTO) => {
    setIsComposeOpen(true);
    const replyToId = activeTab === 'inbox' ? msg.senderId : msg.recipientId;
    setNewMsgRecipient(replyToId.toString());
    setNewMsgSubject(`Re: ${msg.subject}`);
    setNewMsgContent(`\n\n--- W odpowiedzi na ---\n${msg.content}`);
  };

  const resetForm = () => {
    setNewMsgRecipient("");
    setNewMsgSubject("");
    setNewMsgContent("");
  };

  return (
    <>
    <DashBoard />
      <div className={styles.messagesWrapper}>
        
        {/* --- MAIN SECTION (Dark Card) --- */}
        <div className={styles.mainSection}>
          
          {/* HEADER */}
          <div className={styles.header}>
            <h1 className={styles.title}>
              Centrum Wiadomości
              <span className={styles.subtitle}>Witaj, {CURRENT_USER.name}</span>
            </h1>
            <button
              onClick={() => { resetForm(); setIsComposeOpen(true); }}
              className={styles.composeButton}
            >
              + Napisz wiadomość
            </button>
          </div>

          {/* TABS */}
          <div className={styles.controls}>
            <button
              onClick={() => { setActiveTab("inbox"); setSelectedMessage(null); }}
              className={`${styles.tabButton} ${activeTab === "inbox" ? styles.active : ""}`}
            >
              Odebrane
            </button>
            <button
              onClick={() => { setActiveTab("sent"); setSelectedMessage(null); }}
              className={`${styles.tabButton} ${activeTab === "sent" ? styles.active : ""}`}
            >
              Wysłane
            </button>
          </div>

          <div style={{ height: '20px' }}></div> {/* Spacer */}

          {/* CONTENT GRID */}
          <div className={styles.contentGrid}>
            
            {/* LISTA */}
            <div className={styles.messagesList}>
              {displayedMessages.length === 0 ? (
                 <div className={styles.emptyState}>Brak wiadomości</div>
              ) : (
                displayedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`${styles.messageCard} ${selectedMessage?.id === msg.id ? styles.active : ""}`}
                  >
                    <div className={styles.msgHeader}>
                      <span className={styles.sender}>
                        {activeTab === "inbox" ? msg.senderName : `Do: ${msg.recipientName}`}
                      </span>
                      <span className={styles.date}>
                        {new Date(msg.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={styles.subject}>{msg.subject}</span>
                    <div className={styles.preview}>{msg.content}</div>
                  </div>
                ))
              )}
            </div>

            {/* SZCZEGÓŁY */}
            {selectedMessage ? (
              <div className={styles.messageDetail}>
                <div className={styles.detailHeader}>
                  <h2 className={styles.detailSubject}>{selectedMessage.subject}</h2>
                  <div className={styles.detailMeta}>
                    <div>
                      <p><strong>Od:</strong> {selectedMessage.senderName}</p>
                      <p><strong>Do:</strong> {activeTab === "inbox" ? "Mnie" : selectedMessage.recipientName}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <span className={styles.date}>{new Date(selectedMessage.sentAt).toLocaleString()}</span>
                        <button onClick={() => handleReply(selectedMessage)} className={styles.replyButton}>
                            Odpowiedz
                        </button>
                         {/* Przycisk powrotu na mobile */}
                        <button 
                            className={`${styles.replyButton} md:hidden`} // Używam klasy md:hidden z tailwind pomocniczo lub trzeba dodać w CSS
                            style={{borderColor: '#e53e3e', color: '#e53e3e'}}
                            onClick={(e) => { e.stopPropagation(); setSelectedMessage(null); }}
                        >
                            X
                        </button>
                    </div>
                  </div>
                </div>
                <div className={styles.detailContent}>
                  {selectedMessage.content}
                </div>
                
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        <strong>Załączniki:</strong>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px'}}>
                           {selectedMessage.attachments.map(att => (
                               <span key={att.id} style={{color: '#3182ce', cursor: 'pointer'}}>📎 {att.fileName}</span>
                           ))}
                        </div>
                    </div>
                )}
              </div>
            ) : (
              // Placeholder gdy nie wybrano wiadomości
              <div className={`${styles.messageDetail} ${styles.emptyState}`} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
                Wybierz wiadomość z listy
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isComposeOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h2 className={styles.detailSubject} style={{marginBottom: '20px'}}>Nowa wiadomość</h2>
            <form onSubmit={handleSendMessage}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Odbiorca</label>
                <select
                  required
                  value={newMsgRecipient}
                  onChange={(e) => setNewMsgRecipient(e.target.value)}
                  className={styles.select}
                >
                  <option value="">-- Wybierz odbiorcę --</option>
                  {availableRecipients.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role === 'TEACHER' ? 'Nauczyciel' : 'Rodzic'})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Temat</label>
                <input
                  type="text"
                  required
                  value={newMsgSubject}
                  onChange={(e) => setNewMsgSubject(e.target.value)}
                  className={styles.input}
                  placeholder="Temat wiadomości"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Treść</label>
                <textarea
                  required
                  rows={5}
                  value={newMsgContent}
                  onChange={(e) => setNewMsgContent(e.target.value)}
                  className={styles.textarea}
                  placeholder="Wpisz treść..."
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className={styles.cancelButton}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  Wyślij wiadomość
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}