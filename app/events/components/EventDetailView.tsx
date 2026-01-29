import styles from "../Events.module.css";
import { type AnnouncementDTO } from "../eventsTypes";
import { SecureAnnouncementImage } from "~/utils/SecureAnnouncementImage";

interface Props {
  announcement: AnnouncementDTO | null;
  // Nowe propsy
  authorMap: Record<number, string>;
  groupMap: Record<number, string>;
}

export default function EventMainView({ announcement, authorMap, groupMap }: Props) {
  if (!announcement) {
    return (
      <div className={styles.mainView}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>
          Select an event to view details.
        </div>
      </div>
    );
  }

  // Pobieranie czytelnych nazw
  const authorName = authorMap[announcement.authorId] || `ID: ${announcement.authorId}`;
  const groupName = announcement.groupId 
    ? (groupMap[announcement.groupId] || `Group #${announcement.groupId}`) 
    : "Everyone";

  return (
    <div className={styles.mainView}>
      <div className={styles.detailImage}>
        {announcement.imagePath ? (
          <SecureAnnouncementImage 
            imagePath={announcement.imagePath} 
            alt={announcement.title}
            className={styles.mainViewImage} 
          />
        ) : (
          <span className={styles.noImageText}>No image available</span>
        )}
      </div>

      <h1 className={styles.detailHeader}>{announcement.title}</h1>

      <p className={styles.detailContent}>
        {announcement.content}
      </p>

      <div className={styles.detailFooter}>
        <span>Author: <strong>{authorName}</strong></span>
        <span>
          Recipients: <strong>{groupName}</strong>
        </span>
      </div>
    </div>
  );
}