// app/routes/events/components/EventSmallCard.tsx
import styles from "../Events.module.css";
import { type AnnouncementDTO } from "../eventsTypes";

interface Props {
  announcement: AnnouncementDTO;
  isActive: boolean;
  onClick: () => void;
}

export default function EventSmallCard({ announcement, isActive, onClick }: Props) {
  const dateStr = new Date(announcement.publishedAt).toLocaleDateString('pl-PL');

  return (
    <div 
      className={`${styles.smallCard} ${isActive ? styles.active : ''}`} 
      onClick={onClick}
    >
      <div className={styles.cardImagePlaceholder}>
        <span>Obrazek</span>
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{announcement.title}</h3>
        <div className={styles.cardMeta}>
          <span>{dateStr}</span>
          <span>Grupa: {announcement.groupId ?? "Wszystkie"}</span>
        </div>
      </div>
    </div>
  );
}