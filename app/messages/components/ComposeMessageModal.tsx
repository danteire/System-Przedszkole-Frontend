import React, { useState, useRef, useEffect } from "react";
import type { Account } from "../messageTypes";
import styles from "../MessagesPage.module.css";
import { Paperclip, X } from "lucide-react";

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (recipientId: string, subject: string, content: string, files: File[]) => Promise<void>;
  recipients: Account[];
  // ZMIANA: Dodajemy recipientName do obiektu replyTo
  replyTo?: { recipientId: string; recipientName: string; subject: string; content: string } | null;
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  onSend, 
  recipients, 
  replyTo 
}) => {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (replyTo) {
        setRecipient(replyTo.recipientId);
        setSubject(replyTo.subject);
        setContent(replyTo.content);
      } else {
        setRecipient("");
        setSubject("");
        setContent("");
      }
      setFiles([]);
    }
  }, [isOpen, replyTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;

    setSending(true);
    try {
      await onSend(recipient, subject, content, files);
      onClose();
    } catch (error) {
      // Błąd obsłużony w rodzicu
    } finally {
      setSending(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <h2 className={styles.detailSubject} style={{marginBottom: '20px'}}>
            {replyTo ? "Reply to Message" : "New Message"}
        </h2>
        <form onSubmit={handleSubmit}>
          
          {/* ZMIENIONA LOGIKA POLA ODBIORCY */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Recipient</label>
            {replyTo ? (
                // TRYB ODPOWIEDZI: Wyświetlamy nazwę na sztywno (readonly)
                // Dzięki temu możemy odpisać każdemu, kto do nas napisał
                <input 
                    type="text"
                    disabled
                    value={replyTo.recipientName}
                    className={styles.input}
                    style={{ backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}
                />
            ) : (
                // TRYB NOWEJ WIADOMOŚCI: Wybór z listy (tylko dozwoleni)
                <select
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className={styles.select}
                >
                  <option value="">-- Select recipient --</option>
                  {recipients.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.accountType})
                    </option>
                  ))}
                </select>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.input}
              placeholder="Message subject"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Content</label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea}
              placeholder="Type your message here..."
              // Auto-focus na treść przy odpowiedzi
              autoFocus={!!replyTo} 
            />
          </div>

          <div className={styles.formGroup}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px'}}>
                <label className={styles.label} style={{marginBottom: 0}}>Attachments</label>
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: 'transparent', border: '1px solid #cbd5e0',
                        padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                >
                    <Paperclip size={14} /> Add File
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
              onClick={onClose}
              className={styles.cancelButton}
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};