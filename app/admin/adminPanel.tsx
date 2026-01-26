import { useState } from "react";
import DashBoard from "~/commons/dashboard";
import AdminModules from "./adminModules";
import AdminContent from "./adminContent";
import styles from "./adminModules.module.css";

export function loader() {
  return null;
}

export default function AdminPanelPage() {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = (action: string) => {
    // Jeśli kliknięto w tę samą akcję (np. żeby ją zamknąć w Modules), obsłuż to
    if (action === "") {
        setActiveAction(null);
    } else {
        setActiveAction(action);
    }
    console.log(`Action triggered: ${action}`);
  };

  const handleClose = () => {
    setActiveAction(null);
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Wrapper dla Dashboardu - używa tej samej szerokości co reszta */}
        <DashBoard />
      
      {/* Kontener Panelu Admina */}
      <div className={styles.adminPanelContainer}>
        
        {/* Moduły (Kafelki) */}
        <AdminModules 
            onAction={handleAction} 
            activeAction={activeAction} 
        />
        
        {/* Treść (Formularze/Tabele) - renderowana warunkowo */}
        {activeAction && (
          <AdminContent 
            action={activeAction} 
            onClose={handleClose} 
          />
        )}
      </div>
    </div>
  );
}