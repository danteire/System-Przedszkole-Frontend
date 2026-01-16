// app/routes/adminPanel/adminPanel.tsx
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
    setActiveAction(action);
    console.log(`Action triggered: ${action}`);
  };

  const handleClose = () => {
    setActiveAction(null);
  };

  return (
    <>
      <div className="container mx-auto max-w-4xl">
        <DashBoard />
      </div>
      
      <div className={styles.adminPanelContainer}>
        <AdminModules onAction={handleAction} activeAction={activeAction} />
        
        {activeAction && (
          <AdminContent action={activeAction} onClose={handleClose} />
        )}
      </div>
    </>
  );
}