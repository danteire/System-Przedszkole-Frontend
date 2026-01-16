import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { api } from '../utils/serviceAPI';
import styles from '../commons/PaginatedTable.module.css';
import NewGroupModal from './groupsModal';

// Import komponentu podrzędnego
import PreschoolersList from './PreschoolersList';

interface Group {
  id: number;
  groupName: string;
  mainCaretakerId: number;
}

interface Teacher {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

const GroupsTable = () => {
  const [groupsData, setGroupsData] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  
  // Stan wybranej grupy do drill-down
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const itemsPerPage = 5;

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [groupsRes, teachersRes] = await Promise.all([
        api.get<Group[]>("/groups"),
        api.get<Teacher[]>("/accounts/teachers")
      ]);

      setGroupsData(Array.isArray(groupsRes) ? groupsRes : []);
      setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
      
    } catch (err: any) {
      console.error(err);
      setError('Nie udało się załadować danych.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- RENDEROWANIE WARUNKOWE ---
  if (selectedGroup) {
    return (
      <PreschoolersList 
        groupId={selectedGroup.id} 
        groupName={selectedGroup.groupName}
        onBack={() => setSelectedGroup(null)} 
      />
    );
  }

  // --- STANDARDOWE RENDEROWANIE TABELI GRUP ---
  
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div style={{ height: "80px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          Ładowanie danych...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div style={{ textAlign: "center", color: "red" }}>
          ❌ Błąd: {error}
          <br/>
          <button onClick={() => window.location.reload()} className={styles.button} style={{marginTop: '10px'}}>
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  // Paginacja
  const totalPages = Math.ceil(groupsData.length / itemsPerPage);
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = groupsData.slice(indexOfFirstItem, indexOfLastItem);
  
  const occupiedCaretakerIds = groupsData.map(group => group.mainCaretakerId);

  const getCaretakerName = (id: number) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : `ID: ${id}`;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Lista Grup</h2>
        <Button className={styles.newGroupButton} variant="success" onClick={() => setShowModal(true)}>
          + Nowa Grupa
        </Button>
      </div>
      
      {groupsData.length === 0 ? (
         <div style={{ padding: "20px", textAlign: "center" }}>Brak danych do wyświetlenia</div>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Nazwa Grupy</th>
                <th className={styles.th}>Główny Opiekun</th>
                <th className={styles.th} style={{ textAlign: 'center' }}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((group) => (
                <tr key={group.id}>
                  <td className={styles.td}>{group.id}</td>
                  <td className={styles.td}>{group.groupName}</td>
                  <td className={styles.td}>
                    <strong>{getCaretakerName(group.mainCaretakerId)}</strong>
                  </td>
                  <td className={styles.td} style={{ textAlign: 'center' }}>
                    
                    {/* --- ZMIANA: PRZYCISK ZAMIAST LINKU --- */}
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setSelectedGroup(group)}
                      title="Pokaż listę dzieci w tej grupie"
                    >
                      👥 Zobacz Listę
                    </Button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Poprzednia
            </button>
            <span className={styles.pageInfo}>
              Strona {currentPage} z {totalPages}
            </span>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Następna
            </button>
          </div>
        </>
      )}

      <NewGroupModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          fetchData();
        }}
        occupiedIds={occupiedCaretakerIds}
      />
    </div>
  );
}

export default GroupsTable;