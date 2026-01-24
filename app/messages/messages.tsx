// app/routes/messages/MessagesPage.tsx
import React, { useState, useEffect } from "react";
import DashBoard from "~/commons/dashboard";
import { api } from "~/utils/serviceAPI"; 
import { type MessageDTO, type Account, type MessageAttachmentDTO } from "./messageTypes";
import styles from "./MessagesPage.module.css";
import { RefreshCw, Send } from "lucide-react";

import { MessageList } from "./components/MessageList";
import { MessageDetail } from "./components/MessageDetail";
import { ComposeMessageModal } from "./components/ComposeMessageModal";

export default function MessagesPage() {
  const accountInfo = api.getAccountInfo();
  const currentUserId = accountInfo?.id;
  const currentUserRole = accountInfo?.accountType;
  const currentUserName = accountInfo ? `${accountInfo.firstName} ${accountInfo.lastName}` : "";

  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageDTO | null>(null);
  
  const [availableRecipients, setAvailableRecipients] = useState<Account[]>([]);
  
  // NOWE: Mapa użytkowników (ID -> "Imię Nazwisko")
  const [userMap, setUserMap] = useState<Record<number, string>>({});

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyData, setReplyData] = useState<{
      recipientId: string; 
      recipientName: string; 
      subject: string; 
      content: string
  } | null>(null);

  const fetchMessages = async (isBackground = false) => {
    if (!currentUserId) return;
    
    if (!isBackground) {
        setLoading(true);
        setSelectedMessage(null);
        setMessages([]);
    }
    
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
      if (!isBackground) console.error("Failed to fetch messages:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // ZMODYFIKOWANA FUNKCJA POBIERANIA UŻYTKOWNIKÓW
  const fetchRecipients = async () => {
      try {
          // Pobieramy WSZYSTKICH użytkowników
          const users = await api.get<Account[]>("/accounts"); 
          
          if (Array.isArray(users)) {
              // 1. Tworzymy mapę dla wyświetlania nazw (niezależnie od ról)
              const map: Record<number, string> = {};
              users.forEach(u => {
                  map[u.id] = `${u.firstName} ${u.lastName}`;
              });
              setUserMap(map);

              // 2. Filtrujemy listę do Selecta (tylko ci, do których można pisać)
              let filteredUsers = users;
              if (currentUserRole === 'PARENT') {
                  filteredUsers = users.filter(u => u.accountType === 'TEACHER');
              } else {
                  filteredUsers = users.filter(u => u.id !== currentUserId);
              }
              setAvailableRecipients(filteredUsers);
          }
      } catch (error) {
          console.error("Failed to fetch accounts list", error);
      }
  };

  useEffect(() => { fetchMessages(false); }, [activeTab, currentUserId]);
  
  useEffect(() => {
      const intervalId = setInterval(() => {
          fetchMessages(true);
      }, 5000);
      return () => clearInterval(intervalId);
  }, [activeTab, currentUserId]); 

  useEffect(() => { fetchRecipients(); }, [currentUserRole]);

  // --- Handlers ---

  const handleMessageSelect = async (msg: MessageDTO) => {
    setSelectedMessage({ ...msg, attachments: [] });
    try {
        const attachmentsData = await api.get<MessageAttachmentDTO[]>(`/message-attachments/message/${msg.id}`);
        if (Array.isArray(attachmentsData) && attachmentsData.length > 0) {
            setSelectedMessage(prev => {
                if (prev && prev.id === msg.id) {
                    return { ...prev, attachments: attachmentsData };
                }
                return prev;
            });
        } 
    } catch (error) {
        console.log("No attachments info or error.");
    }
  };

  const handleSendMessage = async (recipientId: string, subject: string, content: string, files: File[]) => {
    if (!currentUserId) return;
    
    try {
        const payload = {
            senderId: currentUserId,
            recipientId: parseInt(recipientId),
            subject: subject,
            content: content,
        };

        const createdMessage = await api.post<MessageDTO>("/messages", payload);
        
        if (files.length > 0 && createdMessage?.id) {
            await Promise.all(files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                await api.upload(`/message-attachments/upload/${createdMessage.id}`, formData);
            }));
        }
        
        if (activeTab === "sent") {
            fetchMessages(false);
        } else {
            setActiveTab("sent");
        }
    } catch (error) {
        console.error("Failed to send:", error);
        alert("Failed to send message.");
        throw error;
    }
  };

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
        alert("Failed to download file.");
      }
  };

  const handleReplyClick = (msg: MessageDTO) => {
    const replyToId = activeTab === 'inbox' ? msg.senderId : msg.recipientId;
    
    // Używamy mapy, żeby pobrać ładną nazwę, lub fallback do ID/pola z DTO
    const replyToName = userMap[replyToId] || (activeTab === 'inbox' ? msg.senderName : msg.recipientName) || "User";

    setReplyData({
        recipientId: replyToId.toString(),
        recipientName: replyToName,
        subject: msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`,
        content: `\n\n--- In reply to ---\n${msg.content}`
    });
    setIsComposeOpen(true);
  };

  const handleOpenCompose = () => {
      setReplyData(null);
      setIsComposeOpen(true);
  };

  return (
    <>
    <DashBoard />
      <div className={styles.messagesWrapper}>
        <div className={styles.mainSection}>
          
          <div className={styles.header}>
            <div className={styles.title}>
              Message Center
              {loading && <RefreshCw className="animate-spin" size={20} style={{marginLeft: 10, color: '#aaa'}}/>}
              <span className={styles.subtitle}>
                 Welcome, {currentUserName}
              </span>
            </div>
            <button onClick={handleOpenCompose} className={styles.composeButton}>
              <Send size={18} /> Compose
            </button>
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.tabsContainer}>
                <button
                    onClick={() => { setActiveTab("inbox"); }}
                    className={`${styles.tabButton} ${activeTab === "inbox" ? styles.active : ""}`}
                >
                Inbox
                </button>
                <button
                    onClick={() => { setActiveTab("sent"); }}
                    className={`${styles.tabButton} ${activeTab === "sent" ? styles.active : ""}`}
                >
                Sent
                </button>
            </div>
          </div>

          <div className={styles.contentGrid}>
            <MessageList 
                messages={messages}
                activeTab={activeTab}
                selectedMessageId={selectedMessage?.id || null}
                loading={loading}
                onSelectMessage={handleMessageSelect}
                userMap={userMap} // Przekazujemy mapę
            />

            <MessageDetail 
                message={selectedMessage}
                activeTab={activeTab}
                onReply={handleReplyClick}
                onDownload={handleDownload}
                onClose={() => setSelectedMessage(null)}
                userMap={userMap} // Przekazujemy mapę
            />
          </div>
        </div>
      </div>

      <ComposeMessageModal 
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSendMessage}
          recipients={availableRecipients}
          replyTo={replyData}
      />
    </>
  );
}