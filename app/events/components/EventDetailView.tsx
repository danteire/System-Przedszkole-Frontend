import styles from "../Events.module.css";
import { type AnnouncementDTO } from "../eventsTypes";
import { api } from "~/utils/serviceAPI";

interface Props {
  announcement: AnnouncementDTO | null;
}

export default function EventMainView({ announcement }: Props) {
  if (!announcement) {
    return (
      <div className={styles.mainView}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>
          Wybierz wydarzenie, aby zobaczyć szczegóły.
        </div>
      </div>
    );
  }

  const imageUrl = api.getAnnouncementImageUrl(announcement.imagePath);

  return (
    <div className={styles.mainView}>
      <div className={styles.detailImage}>
        {imageUrl ? (
          <img src={imageUrl} alt={announcement.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
        ) : (
          <span>Brak zdjęcia</span>
        )}
      </div>

      <h1 className={styles.detailHeader}>{announcement.title}</h1>

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
  );
}