import { useEffect } from "react";
import styles from "../Events.module.css";
import { type AnnouncementDTO } from "../eventsTypes";
import { SecureAnnouncementImage } from "~/utils/SecureAnnouncementImage"; 
import { X, Calendar, User, Users } from "lucide-react"; 

interface Props {
  announcement: AnnouncementDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ announcement, isOpen, onClose }: Props) {
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
        window.addEventListener("keydown", handleEsc);
        document.body.style.overflow = 'hidden'; // Blokada scrollowania strony
    }

    return () => {
        window.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !announcement) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        {/* Usunąłem padding z body, żeby obrazek dotykał krawędzi */}
        <div className={styles.modalBodyNoPadding}>
          
          {/* SEKCJA ZDJĘCIA */}
          {announcement.imagePath && (
             <div className={styles.modalImageContainer}>
                <SecureAnnouncementImage 
                  imagePath={announcement.imagePath} 
                  alt={announcement.title}
                  // Obrazek skaluje się do szerokości (width: 100%), wysokość auto
                  className={styles.modalImageFull}
                />
             </div>
          )}
          
          {/* TREŚĆ */}
          <div className={styles.modalTextContent}>
              <h1 className={styles.detailHeader}>{announcement.title}</h1>
              
              <div className={styles.cardMeta} style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#718096'}}>
                 <Calendar size={16} />
                 {new Date(announcement.publishedAt).toLocaleDateString('en-US', {
                     year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                 })}
              </div>

              <p className={styles.detailContent}>
                {announcement.content}
              </p>

              <div className={styles.detailFooter}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={16}/> Author ID: {announcement.authorId}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={16}/> Recipients: {announcement.groupId ? `Group #${announcement.groupId}` : "Everyone"}
                </span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}