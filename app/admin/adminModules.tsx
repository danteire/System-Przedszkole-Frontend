import React from "react";
import { Plus, Eye, Users, Baby, School } from "lucide-react";
import styles from "./adminModules.module.css";

interface ModulesProps {
  onAction: (action: string) => void;
  activeAction: string | null;
}

interface ModuleButton {
  label: string;
  action: string;
  icon: React.ElementType; // Poprawione typowanie dla ikon Lucide
  color: string;
}

export default function AdminModules({ onAction, activeAction }: ModulesProps) {
  
  const addModules: ModuleButton[] = [
    { label: "Add Account", action: "add-account", icon: Users, color: "primary" },
    { label: "Add Preschooler", action: "add-preschooler", icon: Baby, color: "info" },
    { label: "Add Group", action: "add-group", icon: School, color: "warning" },
  ];

  const viewModules: ModuleButton[] = [
    { label: "View Accounts", action: "view-account", icon: Users, color: "outline-success" },
    { label: "View Preschoolers", action: "view-preschoolers", icon: Baby, color: "outline-info" },
    { label: "View Groups", action: "view-groups", icon: School, color: "outline-warning" },
  ];

  const handleClick = (button: ModuleButton) => {
    // Jeśli kliknięto ten sam przycisk, wyłącz akcję (toggle off)
    if (activeAction === button.action) {
      onAction("");
    } else {
      onAction(button.action);
    }
  };

  return (
    <div className={styles.modulesWrapper}>
      
      {/* --- SEKCJA DODAWANIA (Pomarańczowa) --- */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Plus className={styles.sectionIcon} size={28} />
          <h2 className={styles.sectionTitle}>Create New</h2>
        </div>
        
        <div className={styles.moduleGrid}>
          {addModules.map((button) => {
            const Icon = button.icon;
            const isActive = activeAction === button.action;
            
            return (
              <button
                key={button.action}
                onClick={() => handleClick(button)}
                // Dodajemy klasę 'active' warunkowo
                className={`${styles.moduleCard} ${isActive ? styles.active : ''}`}
                // Przekazujemy kolor do CSS via data-attribute
                data-color={button.color}
                type="button"
              >
                <div className={styles.iconWrapper}>
                  <Icon size={32} />
                </div>
                <span className={styles.moduleLabel}>{button.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- SEKCJA PRZEGLĄDANIA (Biała) --- */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Eye className={styles.sectionIcon} size={28} />
          <h2 className={styles.sectionTitle}>View & Manage</h2>
        </div>
        
        <div className={styles.moduleGrid}>
          {viewModules.map((button) => {
            const Icon = button.icon;
            const isActive = activeAction === button.action;
            
            return (
              <button
                key={button.action}
                onClick={() => handleClick(button)}
                // CSS obsłuży wygląd tej sekcji dzięki selektorowi :nth-of-type(2)
                className={`${styles.moduleCard} ${isActive ? styles.active : ''}`}
                data-color={button.color}
                type="button"
              >
                <div className={styles.iconWrapper}>
                  <Icon size={32} />
                </div>
                <span className={styles.moduleLabel}>{button.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}