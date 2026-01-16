// app/routes/attendance/attendance.tsx
import { useState } from "react";
import DashBoard from "~/commons/dashboard";
import GroupsList from "./GroupsList";
import AttendanceView from "./AttendanceView";

export async function clientLoader() {
  return {};
}

export default function AttendancePage() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleGroupSelect = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  const handleBackToGroups = () => {
    setSelectedGroupId(null);
  };

  return (
    <>
      <div className="container mx-auto max-w-4xl">
        <DashBoard />
      </div>

      <div className="container mx-auto max-w-6xl mt-4">
        {selectedGroupId === null ? (
          <GroupsList onGroupSelect={handleGroupSelect} />
        ) : (
          <AttendanceView 
            groupId={selectedGroupId} 
            onBack={handleBackToGroups} 
          />
        )}
      </div>
    </>
  );
}