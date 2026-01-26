import { useState, useEffect } from "react";
import styles from "./Events.module.css";
import { type AnnouncementDTO } from "./eventsTypes";
import EventSmallCard from "./components/EventSmallCard";
import EventMainView from "./components/EventDetailView";
import EventModal from "./components/EventModal";
import EventCreateModal from "./components/EventCreateModal";
import { api } from "~/utils/serviceAPI";
import DashBoard from "~/commons/dashboard";

interface GroupSimple {
  id: number;
  mainCaretakerId: number;
}

interface PreschoolerSimple {
  id: number;
  groupId: number; // Upewnij się, że backend zwraca dokładnie "groupID", a nie "groupId"
}

export function loader() {
  return null;
}

export default function EventsPage() {
    const [announcementsData, setAnnouncementsData] = useState<AnnouncementDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [userRole, setUserRole] = useState<string>("");

    // --- POPRAWIONA FUNKCJA resolveUserGroupIds ---
    const resolveUserGroupIds = async (user: any): Promise<number[]> => {
        try {
            if (user.accountType === "TEACHER") {
                const groups = await api.get<GroupSimple[]>("/groups");
                if (Array.isArray(groups)) {
                    const myGroup = groups.find(g => g.mainCaretakerId === user.id);
                    // Zwracamy ID tylko jeśli istnieje
                    return myGroup && myGroup.id ? [myGroup.id] : [];
                }
            } else if (user.accountType === "PARENT") {
                const children = await api.get<PreschoolerSimple[]>(`/preschoolers/parent/${user.id}`);
                
                if (Array.isArray(children) && children.length > 0) {
                    const validGroupIds = children
                        .map(child => child.groupId)
                        .filter(id => id !== undefined && id !== null);

                    const uniqueGroupIds = [...new Set(validGroupIds)];
                    return uniqueGroupIds;
                }
            }
        } catch (e) {
            console.error("Błąd pobierania grup użytkownika:", e);
        }
        return [];
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const user = api.getAccountInfo();
        const role = user?.accountType || "";
        setUserRole(role);

        let finalData: AnnouncementDTO[] = [];

        if (role === "ADMIN") {
            const response = await api.get<AnnouncementDTO[]>("/announcements");
            finalData = Array.isArray(response) ? response : [];
        } else {
            const generalPromise = api.get<AnnouncementDTO[]>("/announcements/general")
                .catch(() => []);
            const groupIds = await resolveUserGroupIds(user);
            const groupPromises = groupIds.map(id => 
                api.get<AnnouncementDTO[]>(`/announcements/group/${id}`).catch(() => [])
            );

            const [generalData, ...groupsDataResults] = await Promise.all([generalPromise, ...groupPromises]);

            const allGroupsData = groupsDataResults.flat();

            finalData = [
                ...(Array.isArray(generalData) ? generalData : []),
                ...(Array.isArray(allGroupsData) ? allGroupsData : [])
            ];

            finalData = Array.from(new Map(finalData.map(item => [item.id, item])).values());
        }

        const sorted = finalData.sort((a, b) => 
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        
        setAnnouncementsData(sorted);

      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const featuredEvent = announcementsData.length > 0 ? announcementsData[0] : null;
    const leftColumnItems = announcementsData.slice(1, 4);
    const bottomGridItems = announcementsData.slice(4);
    
    const canAddEvent = userRole === "ADMIN" || userRole === "TEACHER";

    const handleOpenModal = (announcement: AnnouncementDTO) => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAnnouncement(null);
    };

    const handleCreateSuccess = () => {
        fetchData();
    };

    return(
      <div className="w-full">          
          <div className={styles.pageWrapper}>
            
            {canAddEvent && (
                <div className={styles.headerBar}>
                    <button 
                        className={styles.addButton}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <span>+</span> Add Annoucement
                    </button>
                </div>
            )}

            {loading ? (
                <div style={{textAlign: 'center', padding: '2rem'}}>Loading announcements...</div>
            ) : error ? (
                 <div style={{textAlign: 'center', color: 'red', padding: '2rem'}}>Error: {error}</div>
            ) : announcementsData.length === 0 ? (
                <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                    No announcements for your group.
                </div>
            ) : (
                <>
                    <div className={styles.heroSection}>
                        <div className={styles.leftColumn}>
                            {leftColumnItems.map((item) => (
                                <EventSmallCard 
                                    key={item.id}
                                    announcement={item}
                                    isActive={false} 
                                    onClick={() => handleOpenModal(item)}
                                />
                            ))}
                            {leftColumnItems.length === 0 && !featuredEvent && (
                                <p style={{color: '#888'}}>No events to display.</p>
                            )}
                        </div>

                        <div 
                          style={{ flex: 1, cursor: featuredEvent ? 'pointer' : 'default' }} 
                          onClick={() => featuredEvent && handleOpenModal(featuredEvent)}
                          title={featuredEvent ? "Click to see details" : ""}
                        >
                            <EventMainView announcement={featuredEvent} />
                        </div>
                    </div>

                    {bottomGridItems.length > 0 && (
                        <div className={styles.bottomSection}>
                            <h2 className={styles.sectionTitle}>Rest of announcements</h2>
                            <div className={styles.eventsGrid}>
                                {bottomGridItems.map((item) => (
                                    <EventSmallCard 
                                        key={item.id}
                                        announcement={item}
                                        isActive={false}
                                        onClick={() => handleOpenModal(item)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
          </div>

          <EventModal 
            isOpen={isModalOpen}
            announcement={selectedAnnouncement}
            onClose={handleCloseModal}
          />

          <EventCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleCreateSuccess}
          />
      </div>
    );
}