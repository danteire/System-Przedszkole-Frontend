// app/routes/events/components/EventSmallCard.tsx
import { useState } from "react";
import styles from "../Events.module.css";
import { type AnnouncementDTO } from "../eventsTypes";
import { api } from "~/utils/serviceAPI";

interface Props {
  announcement: AnnouncementDTO;
  isActive: boolean;
  onClick: () => void;
}

export default function EventSmallCard({ announcement, isActive, onClick }: Props) {
  const dateStr = new Date(announcement.publishedAt).toLocaleDateString('pl-PL');
  const imageUrl = api.getAnnouncementImageUrl(announcement.imagePath);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`${styles.smallCard} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardImagePlaceholder}>
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span>Image</span>
        )}
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{announcement.title}</h3>
        <div className={styles.cardMeta}>
          <span>{dateStr}</span>
          <span>Group: {announcement.groupId ?? "All"}</span>
        </div>
      </div>
    </div>
  );
}