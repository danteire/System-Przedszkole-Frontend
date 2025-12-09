import React, { useState } from 'react';
import { api } from '../utils/serviceAPI';
import styles from '../commons/PaginatedTable.module.css';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  parentId: number;
  groupId: number | null;
}

const PaginatedTable = () => {
  const [preschoolerData, setPreschoolerData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  React.useEffect(() => {
    const fetchPreschoolers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<Student[]>("/preschoolers");
        const fetchedData = response;

        if (Array.isArray(fetchedData)) {
          setPreschoolerData(fetchedData);
        } else {
          setError('Nieprawidłowy format danych z serwera.');
          setPreschoolerData([]);
        }
      } catch (err: any) {
        setError(err.message || 'Nie udało się załadować danych');
        setPreschoolerData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPreschoolers();
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

  const totalPages = Math.ceil(preschoolerData.length / itemsPerPage);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = preschoolerData.slice(indexOfFirstItem, indexOfLastItem);

  if (preschoolerData.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div style={{ height: "80px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          Brak danych do wyświetlenia
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>
        Lista Przedszkolaków ({preschoolerData.length})
      </h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Imię</th>
            <th>Nazwisko</th>
            <th>ID Rodzica</th>
            <th>Grupa</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((student: Student) => (
            <tr key={student.id} className={styles.row}>
              <td>{student.id}</td>
              <td>{student.firstName}</td>
              <td>{student.lastName}</td>
              <td>{student.parentId}</td>
              <td>
                {student.groupId ?? <span style={{ color: "#999", fontStyle: "italic" }}>Brak</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.button}
        >
          Poprzednia
        </button>

        <div className={styles.pageInfo}>
          Strona {currentPage} z {totalPages}
        </div>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.button}
        >
          Następna
        </button>
      </div>
    </div>
  );
};

export default PaginatedTable;
