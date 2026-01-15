import React, { useState } from 'react';
import { api } from '../utils/serviceAPI';
import styles from '../commons/PaginatedTable.module.css';
import { Button } from 'react-bootstrap';
import NewGroupModal from './groupsModal';

interface Group {
  id: number;
  groupName: string;
  mainCaretakerId: number;
}

const GroupsTable = () => {
   const [groupsData, setGroupsData] = useState<Group[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const [showModal, setShowModal] = useState(false);
 
   const itemsPerPage = 5;
 
   React.useEffect(() => {
     const fetchGroups = async () => {
       setLoading(true);
       setError(null);
 
       try {
         const response = await api.get<Group[]>("/groups");
         const fetchedData = response;
 
         if (Array.isArray(fetchedData)) {
           setGroupsData(fetchedData);
         } else {
           setError('Nieprawidłowy format danych z serwera.');
           setGroupsData([]);
         }
       } catch (err: any) {
         setError(err.message || 'Nie udało się załadować danych');
         setGroupsData([]);
       } finally {
         setLoading(false);
       }
     };
 
     fetchGroups();
   }, []);

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
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "red", marginBottom: "1rem" }}>❌ Błąd: {error}</div>
          <button onClick={() => window.location.reload()} className={styles.button}>
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  if (groupsData.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div style={{ height: "80px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          Brak danych do wyświetlenia
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(groupsData.length / itemsPerPage);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
    
  }
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = groupsData.slice(indexOfFirstItem, indexOfLastItem);

  const refreshGroupsData = async () => {
       // Ponownie uruchomienie fetchGroups, aby pobrać najnowsze dane
       // Dla uproszczenia, w tym przykładzie po prostu zamknijmy modal
       setShowModal(false);
       // W prawdziwej aplikacji powinieneś wywołać ponownie fetchGroups
       // lub zaktualizować stan groupsData nowym elementem.
   };
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Lista Grup</h2>
        <Button className={styles.newGroupButton} variant="primary" onClick={() => setShowModal(true)}>Nowa Grupa</Button>
      </div>  
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>Nazwa Grupy</th>
            <th className={styles.th}>ID Głównego Opiekuna</th>
            <th className={styles.th}>Obecności</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((group) => (
            <tr key={group.id}>
              <td className={styles.td}>{group.id}</td>
              <td className={styles.td}>{group.groupName}</td>
              <td className={styles.td}>{group.mainCaretakerId}</td>
              <td className={styles.td}>
                <a href={`/attendence?groupId=${group.id}`} className={styles.link}>
                  Zobacz Obecności
                </a>
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
      <NewGroupModal
      show={showModal}
      onHide={() => setShowModal(false)}
      />
    </div>
  );
}
export default GroupsTable;
