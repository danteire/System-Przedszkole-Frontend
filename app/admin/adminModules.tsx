// app/routes/adminPanel/adminModules.tsx
import { Plus, Eye, Users, Baby, School, UserCheck } from "lucide-react";
import styles from "./adminModules.module.css";

interface ModulesProps {
  onAction: (action: string) => void;
  activeAction: string | null;
}

interface ModuleButton {
  label: string;
  action: string;
  icon: any;
  color: string;
}

export default function AdminModules({ onAction, activeAction }: ModulesProps) {
  const addModules: ModuleButton[] = [
    // { label: "Add Teacher", action: "add-teacher", icon: UserCheck, color: "primary" },
    { label: "Add Account", action: "add-account", icon: Users, color: "primary" },
    { label: "Add Preschooler", action: "add-preschooler", icon: Baby, color: "info" },
    { label: "Add Group", action: "add-group", icon: School, color: "warning" },
  ];

  const viewModules: ModuleButton[] = [
    // { label: "View Teachers", action: "view-teachers", icon: UserCheck, color: "outline-primary" },
    { label: "View Account", action: "view-account", icon: Users, color: "outline-success" },
    { label: "View Preschoolers", action: "view-preschoolers", icon: Baby, color: "outline-info" },
    { label: "View Groups", action: "view-groups", icon: School, color: "outline-warning" },
  ];

  const handleClick = (button: ModuleButton) => {
    // Jeśli kliknięto ten sam przycisk, wyłącz akcję
    if (activeAction === button.action) {
      onAction("");
    } else {
      onAction(button.action);
    }
  };

  return (
    <div className={styles.modulesWrapper}>
      {/* Sekcja dodawania */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Plus className={styles.sectionIcon} size={24} />
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
                className={`${styles.moduleCard} ${isActive ? styles.active : ''}`}
                data-color={button.color}
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

      {/* Sekcja przeglądania */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Eye className={styles.sectionIcon} size={24} />
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
                className={`${styles.moduleCard} ${styles.viewCard} ${isActive ? styles.active : ''}`}
                data-color={button.color}
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