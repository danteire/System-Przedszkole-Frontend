import { useState, useEffect } from "react";
import styles from "../Events.module.css";
import { api } from "~/utils/serviceAPI";
import { Upload, Users } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Group {
  id: number;
  groupName: string;
}

export default function EventCreateModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      setSelectedGroups([]);
      setFile(null);
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const response = await api.get<Group[]>("/groups");
      const groups = Array.isArray(response) ? response : (response as any).data || [];
      setAvailableGroups(groups);
    } catch (error) {
      console.error("Failed to load groups:", error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleGroupToggle = (groupId: number) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = api.getAccountInfo();
      const targets = selectedGroups.length > 0 ? selectedGroups : [null];

      await Promise.all(targets.map(async (targetGroupId) => {
          const newAnnouncement = {
            title,
            content,
            authorId: user?.id,
            groupId: targetGroupId,
          };

          const formData = new FormData();
          const jsonBlob = new Blob([JSON.stringify(newAnnouncement)], { type: "application/json" });
          formData.append("announcement", jsonBlob);

          if (file) {
            formData.append("file", file);
          }

          return api.upload("/announcements", formData);
      }));

      await new Promise(resolve => setTimeout(resolve, 500));
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Błąd dodawania ogłoszenia:", error);
      alert("Failed to create announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funkcja pomocnicza do ustawiania angielskiego komunikatu
  const handleInvalid = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.setCustomValidity("Please fill out this field.");
  };

  // Funkcja pomocnicza do czyszczenia komunikatu, gdy użytkownik zaczyna pisać
  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.setCustomValidity("");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>

        <div className={styles.modalBody}>
          <h2 className={styles.detailHeader}>Add new announcement</h2>

          <form onSubmit={handleSubmit}>
            {/* TITLE */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Title</label>
              <input
                type="text"
                className={styles.formInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="E.g. Trip to Zoo"
                // ZMIANA: Obsługa walidacji po angielsku
                onInvalid={handleInvalid}
                onInput={handleInput}
              />
            </div>

            {/* DESCRIPTION */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Announcement Description</label>
              <textarea
                className={styles.formTextarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Write announcement description..."
                // ZMIANA: Obsługa walidacji po angielsku
                onInvalid={handleInvalid}
                onInput={handleInput}
              />
            </div>

            {/* GROUP SELECTOR */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Recipients (Select Groups)</label>
              
              {isLoadingGroups ? (
                  <div style={{color: '#666', fontSize: '0.9rem'}}>Loading groups...</div>
              ) : (
                  <div className={styles.groupSelectorGrid}>
                      {availableGroups.map(group => (
                          <label key={group.id} className={styles.groupOption}>
                              <input 
                                  type="checkbox" 
                                  checked={selectedGroups.includes(group.id)}
                                  onChange={() => handleGroupToggle(group.id)}
                                  className={styles.groupCheckbox}
                              />
                              <span className={styles.groupName}>
                                {group.groupName}
                              </span>
                          </label>
                      ))}
                  </div>
              )}
              
              <div className={styles.groupSummary}>
                 <Users size={14}/>
                 {selectedGroups.length === 0 
                    ? "No specific groups selected. This announcement will be sent to ALL groups." 
                    : `Selected recipients: ${selectedGroups.length} group(s)`}
              </div>
            </div>

            {/* PHOTO UPLOAD */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Photo (optional)</label>
              <div className={styles.uploadArea}>
                <Upload size={24} style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Click to select photo</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  className={styles.uploadInput}
                />
                {file && <span className={styles.fileName}>{file.name}</span>}
              </div>
            </div>

            {/* ACTIONS */}
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Add Announcement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}