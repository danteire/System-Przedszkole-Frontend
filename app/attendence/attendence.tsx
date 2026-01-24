// app/routes/attendance/attendance.tsx
import { useState, useEffect } from "react";
import DashBoard from "~/commons/dashboard";
import { api } from "~/utils/serviceAPI"; 
import GroupsList from "./GroupsList"; 
import AttendanceView from "./AttendanceView";
import ParentAttendanceView from "./ParentAttendanceView"; 
import { RefreshCw, AlertCircle } from "lucide-react";

// Definicja interfejsu Group (jeśli nie jest eksportowana z types)
interface Group {
  id: number;
  groupName: string;
  mainCaretakerId: number;
}

export async function clientLoader() {
  return {};
}

export default function AttendancePage() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [teacherHasNoGroup, setTeacherHasNoGroup] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const role = api.getAccountType(); // 'ADMIN', 'TEACHER', 'PARENT'
      setUserRole(role || "");

      if (role === 'TEACHER') {
        try {
          const accountInfo = api.getAccountInfo();
          if (accountInfo?.id) {
            // Pobieramy grupy i szukamy tej przypisanej do nauczyciela
            // Zakładamy endpoint GET /groups zwracający tablicę
            const allGroups = await api.get<Group[]>("/groups");
            
            const myGroup = allGroups.find(g => g.mainCaretakerId === accountInfo.id);
            
            if (myGroup) {
              setSelectedGroupId(myGroup.id);
            } else {
              setTeacherHasNoGroup(true);
            }
          }
        } catch (error) {
          console.error("Failed to fetch teacher's group:", error);
          setTeacherHasNoGroup(true);
        }
      }
      
      setLoading(false);
    };

    initPage();
  }, []);

  const handleGroupSelect = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  const handleBackToGroups = () => {
    // Admin może wrócić do listy, Nauczyciel nie powinien (bo ma tylko jedną grupę)
    if (userRole === 'ADMIN') {
        setSelectedGroupId(null);
    }
  };

  if (loading) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="text-center text-gray-500 flex flex-col items-center gap-3">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
                <span>Loading attendance module...</span>
            </div>
        </div>
      );
  }

  // Renderowanie widoku w zależności od roli
  const renderContent = () => {
    // 1. RODZIC
    if (userRole === 'PARENT') {
        return <ParentAttendanceView />;
    }

    // 2. NAUCZYCIEL
    if (userRole === 'TEACHER') {
        if (teacherHasNoGroup) {
            return (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-lg mx-auto mt-10">
                    <AlertCircle size={48} className="text-orange-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Group Assigned</h2>
                    <p className="text-gray-600">
                        You are not currently assigned as a main caretaker for any group. 
                        Please contact the administrator to assign you to a group.
                    </p>
                </div>
            );
        }
        
        // Jeśli ma grupę, wyświetl widok obecności (bez przycisku powrotu)
        return selectedGroupId ? (
            <AttendanceView 
                groupId={selectedGroupId} 
                onBack={() => {}}
            />
        ) : null;
    }

    // 3. ADMIN (Domyślny widok z wyborem grupy)
    return (
        <>
            {selectedGroupId === null ? (
                <GroupsList onGroupSelect={handleGroupSelect} />
            ) : (
                <AttendanceView 
                    groupId={selectedGroupId} 
                    onBack={handleBackToGroups} 
                />
            )}
        </>
    );
  };

  return (
    <>
      <div className="container mx-auto max-w-4xl">
        <DashBoard />
      </div>

      <div className="container mx-auto max-w-6xl mt-6 px-4">
        {renderContent()}
      </div>
    </>
  );
}