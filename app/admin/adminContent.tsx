// app/routes/adminPanel/adminContent.tsx
import { useState } from "react";
import { X } from "lucide-react";
import { api } from "~/utils/serviceAPI";
import styles from "./adminModules.module.css";
import AddTeacherForm from "./forms/AddTeacherForm";
import AddParentForm from "./forms/AddParentForm";
// import AddPreschoolerForm from "./forms/AddPreschoolerForm";
// import AddGroupForm from "./forms/AddGroupForm";
import ViewTeachers from "./views/ViewTeachers";
import ViewParents from "./views/ViewParents";
// import ViewPreschoolers from "./views/ViewPreschoolers";
// import ViewGroups from "./views/ViewGroups";

interface AdminContentProps {
  action: string;
  onClose: () => void;
}

export default function AdminContent({ action, onClose }: AdminContentProps) {
  const getTitle = () => {
    const titles: Record<string, string> = {
      "add-teacher": "Add New Teacher",
      "add-parent": "Add New Parent",
      "add-preschooler": "Add New Preschooler",
      "add-group": "Add New Group",
      "view-teachers": "All Teachers",
      "view-parents": "All Parents",
      "view-preschoolers": "All Preschoolers",
      "view-groups": "All Groups",
    };
    return titles[action] || "Content";
  };

  const renderContent = () => {
    switch (action) {
      case "add-teacher":
        return <AddTeacherForm onSuccess={onClose} />;
      case "add-parent":
        return <AddParentForm onSuccess={onClose} />;
    //   case "add-preschooler":
    //     return <AddPreschoolerForm onSuccess={onClose} />;
    //   case "add-group":
    //     return <AddGroupForm onSuccess={onClose} />;
      case "view-teachers":
        return <ViewTeachers />;
      case "view-parents":
        return <ViewParents />;
    //   case "view-preschoolers":
    //     return <ViewPreschoolers />;
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