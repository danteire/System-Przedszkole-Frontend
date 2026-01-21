import React, { useState, useEffect, useRef } from "react";
import DashBoard from "~/commons/dashboard";
import { api } from "~/utils/serviceAPI"; 
import { type MessageDTO, type Account, type MessageAttachmentDTO } from "./messageTypes";
import styles from "./MessagesPage.module.css";
import { RefreshCw, Send, Paperclip, X, Download } from "lucide-react";

export default function MessagesPage() {
  // --- Pobranie danych zalogowanego użytkownika ---
  const accountInfo = api.getAccountInfo();
  const currentUserId = accountInfo?.id;
  const currentUserName = accountInfo ? `${accountInfo.firstName} ${accountInfo.lastName}` : "";

  // --- Stan Aplikacji ---
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageDTO | null>(null);
  
  // --- Stan Formularza Nowej Wiadomości ---
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [availableRecipients, setAvailableRecipients] = useState<Account[]>([]);
  
  // Pola formularza
  const [newMsgRecipient, setNewMsgRecipient] = useState<string>("");
  const [newMsgSubject, setNewMsgSubject] = useState("");
  const [newMsgContent, setNewMsgContent] = useState("");
  const [files, setFiles] = useState<File[]>([]); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Pobieranie wiadomości (API) ---
  const fetchMessages = async () => {
    if (!currentUserId) return;

    setLoading(true);
    setSelectedMessage(null);
    setMessages([]);
    
    try {
      let endpoint = "";
      if (activeTab === "inbox") {
        endpoint = `/messages/recipient/${currentUserId}`;
      } else {
        endpoint = `/messages/sender/${currentUserId}`;
      }

      const data = await api.get<MessageDTO[]>(endpoint); 
      
      if (Array.isArray(data)) {
         const sorted = data.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
         setMessages(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Pobieranie listy użytkowników ---
  const fetchRecipients = async () => {
      try {
          const users = await api.get<Account[]>("/accounts"); 
          if (Array.isArray(users)) {
              setAvailableRecipients(users);
          }
      } catch (error) {
          console.error("Failed to fetch accounts list", error);
      }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeTab, currentUserId]);

  useEffect(() => {
      fetchRecipients();
  }, []);

  // --- NOWE: Funkcja pobierająca załączniki po kliknięciu ---
  const handleMessageClick = async (msg: MessageDTO) => {
    setSelectedMessage({ ...msg, attachments: [] });

    try {
        const attachmentsData = await api.get<MessageAttachmentDTO[]>(`/message-attachments/message/${msg.id}`);

        if (Array.isArray(attachmentsData) && attachmentsData.length > 0) {
            console.log("Znaleziono załączniki:", attachmentsData);
            
            setSelectedMessage(prev => {
                if (prev && prev.id === msg.id) {
                    return { ...prev, attachments: attachmentsData };
                }
                return prev;
            });
        } else {
            console.log("Brak załączników dla tej wiadomości.");
        }
    } catch (error) {
        // Jeśli 404 lub inny błąd -> po prostu nie pokazujemy załączników, nie blokujemy UI
        console.log("Nie udało się pobrać informacji o załącznikach (może ich nie być).");
    }
  };


  // --- 3. Wysyłanie wiadomości ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgRecipient || !currentUserId) return;
    
    setSending(true);
    try {
        const payload = {
            senderId: currentUserId,
            recipientId: parseInt(newMsgRecipient),
            subject: newMsgSubject,
            content: newMsgContent,
        };

        const createdMessage = await api.post<MessageDTO>("/messages", payload);
        
        if (files.length > 0 && createdMessage?.id) {
            await Promise.all(files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                await api.upload<MessageAttachmentDTO>(`/message-attachments/upload/${createdMessage.id}`, formData);
            }));
        }
        
        setIsComposeOpen(false);
        resetForm();
        
        if (activeTab === "sent") {
            fetchMessages();
        } else {
            setActiveTab("sent");
        }
        
    } catch (error) {
        console.error("Failed to send message:", error);
        alert("Nie udało się wysłać wiadomości.");
    } finally {
        setSending(false);
    }
  };

  // --- 4. Pobieranie pliku ---
  const handleDownload = async (attachment: MessageAttachmentDTO) => {
      try {
        const blob = await api.download('/message-attachments/download/' + attachment.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
      } catch (e) {
        console.error("Błąd pobierania", e);
        alert("Nie udało się pobrać pliku.");
      }
  };

  // --- Helpersy formularza ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const newFiles = Array.from(e.target.files);
          setFiles((prev) => [...prev, ...newFiles]);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (indexToRemove: number) => {
      setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleReply = (msg: MessageDTO) => {
    setIsComposeOpen(true);
    const replyToId = activeTab === 'inbox' ? msg.senderId : msg.recipientId;
    setNewMsgRecipient(replyToId.toString());
    setNewMsgSubject(msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`);
    setNewMsgContent(`\n\n--- W odpowiedzi na ---\n${msg.content}`);
  };

  const resetForm = () => {
    setNewMsgRecipient("");
    setNewMsgSubject("");
    setNewMsgContent("");
    setFiles([]); 
  };

  return (
    <>
    <DashBoard />
      <div className={styles.messagesWrapper}>
        <div className={styles.mainSection}>
          
          {/* HEADER */}
          <div className={styles.header}>
            <div className={styles.title}>
              Centrum Wiadomości
              {loading && <RefreshCw className="animate-spin" size={20} style={{marginLeft: 10, color: '#aaa'}}/>}
              <span className={styles.subtitle} style={{ fontSize: '0.9rem', marginLeft: '10px', color: '#718096', fontWeight: 'normal' }}>
                 Witaj, {currentUserName}
              </span>
            </div>
            <button
              onClick={() => { resetForm(); setIsComposeOpen(true); }}
              className={styles.composeButton}
            >
              <Send size={18} /> Napisz wiadomość
            </button>
          </div>

          {/* TABS */}
          <div className={styles.controlsRow}>
            <div className={styles.tabsContainer}>
                <button
                onClick={() => { setActiveTab("inbox"); }}
                className={`${styles.tabButton} ${activeTab === "inbox" ? styles.active : ""}`}
                >
                Odebrane
                </button>
                <button
                onClick={() => { setActiveTab("sent"); }}
                className={`${styles.tabButton} ${activeTab === "sent" ? styles.active : ""}`}
                >
                Wysłane
                </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className={styles.contentGrid}>
            
            {/* LISTA */}
            <div className={`${styles.messagesList} ${selectedMessage ? styles.hiddenMobile : ''}`}>
              {messages.length === 0 ? (
                 <div className={styles.emptyState}>
                    {loading ? "Ładowanie..." : "Brak wiadomości"}
                 </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    // ZMIANA: Tutaj używamy nowej funkcji handleMessageClick
                    onClick={() => handleMessageClick(msg)}
                    className={`${styles.messageCard} ${selectedMessage?.id === msg.id ? styles.active : ""}`}
                  >
                    <div className={styles.msgHeader}>
                      <span className={styles.sender}>
                        {activeTab === "inbox" ? (msg.senderName || `ID: ${msg.senderId}`) : `Do: ${msg.recipientName || msg.recipientId}`}
                      </span>
                      <span className={styles.date}>
                        {new Date(msg.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={styles.subject}>
                        {msg.subject}
                        {/* Opcjonalnie: ikona spinacza jeśli wiadomość ma flagę 'hasAttachments' z backendu
                            Jeśli backend tego nie zwraca na liście, ikonka pojawi się dopiero po kliknięciu */}
                    </span>
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
                      <p><strong>Od:</strong> {selectedMessage.senderName || selectedMessage.senderId}</p>
                      <p><strong>Do:</strong> {activeTab === "inbox" ? "Mnie" : (selectedMessage.recipientName || selectedMessage.recipientId)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <span className={styles.date}>
                            {new Date(selectedMessage.sentAt).toLocaleString()}
                        </span>
                        <button onClick={() => handleReply(selectedMessage)} className={styles.replyButton}>
                            Odpowiedz
                        </button>
                        <button 
                            className="md:hidden"
                            style={{ 
                                marginLeft: '10px', border: '1px solid #e53e3e', color: '#e53e3e', 
                                background: 'white', padding: '0.4rem 1rem', borderRadius: '6px'
                            }}
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
                
                {/* SEKCJA ZAŁĄCZNIKÓW */}
                {/* Wyświetli się tylko jeśli api.get(...) zwróciło listę */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        <strong style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px'}}>
                            <Paperclip size={16}/> Załączniki ({selectedMessage.attachments.length}):
                        </strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                           {selectedMessage.attachments.map(att => (
                               <div 
                                   key={att.id} 
                                   onClick={() => handleDownload(att)}
                                   style={{
                                       display: 'flex', alignItems: 'center', gap: '8px',
                                       background: '#ebf8ff', border: '1px solid #bee3f8',
                                       padding: '8px 12px', borderRadius: '6px',
                                       cursor: 'pointer', transition: 'background 0.2s',
                                       color: '#2b6cb0', fontSize: '0.9rem'
                                   }}
                                   title={`Pobierz: ${att.fileName}`}
                               >
                                   <Download size={14} />
                                   <span style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                       {att.fileName}
                                   </span>
                               </div>
                           ))}
                        </div>
                    </div>
                )}
              </div>
            ) : (
              <div className={`${styles.messageDetail} ${styles.emptyState}`} style={{background: 'white', border: 'none'}}>
                {messages.length > 0 ? "Wybierz wiadomość z listy, aby przeczytać treść" : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL (bez zmian) */}
      {isComposeOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h2 className={styles.detailSubject} style={{marginBottom: '20px'}}>Nowa wiadomość</h2>
            <form onSubmit={handleSendMessage}>
               {/* ... (Reszta formularza bez zmian) ... */}
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
                      {user.firstName} {user.lastName} ({user.accountType})
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

              <div className={styles.formGroup}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px'}}>
                    <label className={styles.label} style={{marginBottom: 0}}>Załączniki</label>
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: 'transparent', border: '1px solid #cbd5e0',
                            padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'
                        }}
                    >
                        <Paperclip size={14} /> Dodaj plik
                    </button>
                  </div>
                  
                  <input 
                      type="file" 
                      multiple 
                      ref={fileInputRef} 
                      style={{display: 'none'}} 
                      onChange={handleFileSelect}
                  />

                  {files.length > 0 && (
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px'}}>
                          {files.map((file, idx) => (
                              <div key={idx} style={{
                                  display: 'flex', alignItems: 'center', gap: '5px',
                                  background: '#f7fafc', border: '1px solid #e2e8f0',
                                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'
                              }}>
                                  <span style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                      {file.name}
                                  </span>
                                  <X 
                                      size={14} 
                                      style={{cursor: 'pointer', color: '#e53e3e'}} 
                                      onClick={() => removeFile(idx)}
                                  />
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className={styles.cancelButton}
                  disabled={sending}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={sending}
                >
                  {sending ? "Wysyłanie..." : "Wyślij wiadomość"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}