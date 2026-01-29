import styles from "../Events.module.css";
import { type AnnouncementDTO } from "../eventsTypes";
import { SecureAnnouncementImage } from "~/utils/SecureAnnouncementImage"; 

interface Props {
  announcement: AnnouncementDTO;
  isActive: boolean;
  onClick: () => void;
  // Nowe propsy
  groupMap: Record<number, string>;
}

export default function EventSmallCard({ announcement, isActive, onClick, groupMap }: Props) {
  const dateStr = new Date(announcement.publishedAt).toLocaleDateString('pl-PL');
  
  // Pobieranie nazwy grupy
  const groupName = announcement.groupId 
    ? (groupMap[announcement.groupId] || `Group #${announcement.groupId}`) 
    : "All";

  return (
    <div
      className={`${styles.smallCard} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardImagePlaceholder}>
        {announcement.imagePath ? (
          <SecureAnnouncementImage 
            imagePath={announcement.imagePath} 
            alt={announcement.title}
            className={styles.smallCardImage} 
          />
        ) : (
          <span className={styles.noImageTextSmall}>No Image</span>
        )}
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{announcement.title}</h3>
        <div className={styles.cardMeta}>
          <span>{dateStr}</span>
          <span>To: <strong>{groupName}</strong></span>
        </div>
      </div>
    </div>
  );
}