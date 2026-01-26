import styles from "../Events.module.css";
import { type AnnouncementDTO } from "../eventsTypes";
import { SecureAnnouncementImage } from "~/utils/SecureAnnouncementImage";

interface Props {
  announcement: AnnouncementDTO | null;
}

export default function EventMainView({ announcement }: Props) {
  if (!announcement) {
    return (
      <div className={styles.mainView}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>
          Select an event to view details.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainView}>
      {/* Kontener obrazka ma stałą wysokość zdefiniowaną w CSS (.detailImage) */}
      <div className={styles.detailImage}>
        {announcement.imagePath ? (
          <SecureAnnouncementImage 
            imagePath={announcement.imagePath} 
            alt={announcement.title}
            // Klasa wymusza wypełnienie kontenera i przycięcie nadmiaru (cover)
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
        <span>Author ID: {announcement.authorId}</span>
        <span>
          Recipients: {announcement.groupId ? `Group #${announcement.groupId}` : "Everyone"}
        </span>
      </div>
    </div>
  );
}