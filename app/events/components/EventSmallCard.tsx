import { useState } from "react";
import styles from "../Events.module.css";
import { type AnnouncementDTO } from "../eventsTypes";
import { SecureAnnouncementImage } from "~/utils/SecureAnnouncementImage"; // Zaimportuj komponent

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
        {announcement.imagePath ? (
          // Używamy tego samego komponentu co w MainView
          <SecureAnnouncementImage 
            imagePath={announcement.imagePath} 
            alt={announcement.title}
            // Styl inline lub klasa z CSS, by obrazek wypełniał kartę
            className={styles.smallCardImage} 
            // Alternatywnie inline style, jeśli nie chcesz dodawać klasy do CSS:
            // style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <span className={styles.noImageTextSmall}>No Image</span>
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