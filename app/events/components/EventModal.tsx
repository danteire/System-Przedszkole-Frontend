// app/routes/events/components/EventModal.tsx
import { useEffect } from "react";
import styles from "../Events.module.css";
import { type AnnouncementDTO } from "../eventsTypes";

interface Props {
  announcement: AnnouncementDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ announcement, isOpen, onClose }: Props) {
  // Zamknij modal klawiszem ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !announcement) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* stopPropagation zapobiega zamknięciu przy kliknięciu w treść okienka */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <div className={styles.modalBody}>
          <div className={styles.detailImage}>
            Nagłówek / Zdjęcie
          </div>
          
          <h1 className={styles.detailHeader}>{announcement.title}</h1>
          
          <div className={styles.cardMeta} style={{marginBottom: '1rem'}}>
             {new Date(announcement.publishedAt).toLocaleDateString('pl-PL')}
          </div>

          <p className={styles.detailContent}>
            {announcement.content}
          </p>

          <div className={styles.detailFooter}>
            <span>Autor ID: {announcement.authorId}</span>
            <span>
                Odbiorcy: {announcement.groupId ? `Grupa #${announcement.groupId}` : "Wszyscy"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}