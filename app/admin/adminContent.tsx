// app/routes/adminPanel/adminContent.tsx
import { useState } from "react";
import { X } from "lucide-react";
import { api } from "~/utils/serviceAPI";
import styles from "./adminModules.module.css";
import AddAccountForm from "./forms/AddAccountForm";
import AddPreschoolerForm from "./forms/AddPreschoolerForm";
// import AddGroupForm from "./forms/AddGroupForm";
import ViewTeachers from "./views/ViewAccounts";
import ViewPreschoolers from "./views/Viewpreschoolers";
// import ViewGroups from "./views/ViewGroups";

interface AdminContentProps {
  action: string;
  onClose: () => void;
}

export default function AdminContent({ action, onClose }: AdminContentProps) {
  const getTitle = () => {
    const titles: Record<string, string> = {
      "add-account": "Add New Account",
      "add-preschooler": "Add New Preschooler",
      "add-group": "Add New Group",
      "view-accounts": "All Accounts",
      "view-parents": "All Parents",
      "view-preschoolers": "All Preschoolers",
      "view-groups": "All Groups",
    };
    return titles[action] || "Content";
  };

  const renderContent = () => {
    switch (action) {
      case "add-account":
        return <AddAccountForm onSuccess={onClose} />;
      case "add-preschooler":
        return <AddPreschoolerForm onSuccess={onClose} />;
    //   case "add-group":
    //     return <AddGroupForm onSuccess={onClose} />;
        case "view-account":
          return <ViewTeachers />;
      case "view-preschoolers":
        return <ViewPreschoolers />;
    //   case "view-groups":
    //     return <ViewGroups />;
      default:
        return <div>Select an action from above</div>;
    }
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.contentCard}>
        <div className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>{getTitle()}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.contentBody}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}