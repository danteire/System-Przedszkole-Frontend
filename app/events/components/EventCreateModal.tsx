import { useState, useEffect } from "react";
import styles from "../Events.module.css";
import { api } from "~/utils/serviceAPI";
import { Upload } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventCreateModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [groupId, setGroupId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null); // New state for file
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset formularza przy otwarciu
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      setGroupId("");
      setFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = api.getAccountInfo();

      const newAnnouncement = {
        title,
        content,
        authorId: user?.id,
        groupId: groupId ? parseInt(groupId) : null,
      };

      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(newAnnouncement)], { type: "application/json" });
      formData.append("announcement", jsonBlob); // Key 'announcement' as per controller

      if (file) {
        formData.append("file", file); // Key 'file' as per controller
      }

      console.log("Wysyłanie:", newAnnouncement);

      const response = await api.upload("/announcements", formData); // Use upload helper
      console.log("Odpowiedź serwera:", response);

      await new Promise(resolve => setTimeout(resolve, 500));

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Błąd dodawania ogłoszenia:", error);
      alert("Nie udało się dodać ogłoszenia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>

        <div className={styles.modalBody}>
          <h2 className={styles.detailHeader}>Dodaj nowe ogłoszenie</h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tytuł</label>
              <input
                type="text"
                className={styles.formInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Np. Wycieczka do ZOO"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Treść ogłoszenia</label>
              <textarea
                className={styles.formTextarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Wpisz szczegóły wydarzenia..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Adresaci (ID Grupy)</label>
              <input
                type="number"
                className={styles.formInput}
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="Zostaw puste dla wszystkich grup"
              />
              <small style={{ color: '#666' }}>Wpisz ID grupy lub zostaw puste, aby wysłać do wszystkich.</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Zdjęcie (opcjonalne)</label>
              <div style={{
                border: '2px dashed #EEE', borderRadius: '8px', padding: '15px',
                textAlign: 'center', background: '#F8FAFC', cursor: 'pointer', position: 'relative'
              }}>
                <Upload size={20} style={{ color: '#64748B', marginBottom: '5px' }} />
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>Kliknij aby dodać zdjęcie</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                {file && <p style={{ marginTop: '5px', fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.9rem' }}>{file.name}</p>}
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Anuluj
              </button>
              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? "Wysyłanie..." : "Dodaj Ogłoszenie"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}