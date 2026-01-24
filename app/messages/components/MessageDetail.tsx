import React from "react";
import type { MessageDTO, MessageAttachmentDTO } from "../messageTypes";
import styles from "../MessagesPage.module.css";
import { Paperclip, Download } from "lucide-react";

interface MessageDetailProps {
  message: MessageDTO | null;
  activeTab: "inbox" | "sent";
  onReply: (msg: MessageDTO) => void;
  onDownload: (attachment: MessageAttachmentDTO) => void;
  onClose: () => void;
  userMap: Record<number, string>; // NOWE
}

export const MessageDetail: React.FC<MessageDetailProps> = ({ 
  message, 
  activeTab, 
  onReply, 
  onDownload, 
  onClose,
  userMap // NOWE
}) => {
  
  if (!message) {
    return (
      <div className={`${styles.messageDetail} ${styles.emptyState}`} style={{background: 'white', border: 'none'}}>
        Select a message to read
      </div>
    );
  }

  const senderName = userMap[message.senderId] || message.senderName || message.senderId;
  const recipientName = userMap[message.recipientId] || message.recipientName || message.recipientId;

  return (
    <div className={styles.messageDetail}>
      <div className={styles.detailHeader}>
        <h2 className={styles.detailSubject}>{message.subject}</h2>
        <div className={styles.detailMeta}>
          <div>
            <p><strong>From:</strong> {senderName}</p>
            <p><strong>To:</strong> {activeTab === "inbox" ? "Me" : recipientName}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center'}}>
              <span className={styles.date}>
                  {new Date(message.sentAt).toLocaleString()}
              </span>
              <button onClick={() => onReply(message)} className={styles.replyButton}>
                  Reply
              </button>
              <button 
                  className="md:hidden"
                  style={{ 
                      marginLeft: '10px', border: '1px solid #e53e3e', color: '#e53e3e', 
                      background: 'white', padding: '0.4rem 1rem', borderRadius: '6px'
                  }}
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
              >
                  X
              </button>
          </div>
        </div>
      </div>
      <div className={styles.detailContent}>
        {message.content}
      </div>
      
      {message.attachments && message.attachments.length > 0 && (
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <strong style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px'}}>
                  <Paperclip size={16}/> Attachments ({message.attachments.length}):
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                 {message.attachments.map(att => (
                     <div 
                         key={att.id} 
                         onClick={() => onDownload(att)}
                         style={{
                             display: 'flex', alignItems: 'center', gap: '8px',
                             background: '#ebf8ff', border: '1px solid #bee3f8',
                             padding: '8px 12px', borderRadius: '6px',
                             cursor: 'pointer', transition: 'background 0.2s',
                             color: '#2b6cb0', fontSize: '0.9rem'
                         }}
                         title={`Download: ${att.fileName}`}
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
  );
};