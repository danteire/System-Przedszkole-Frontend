import React, { useState } from 'react';
import { api } from '../utils/serviceAPI';

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

  // Pobierz dane z API
  React.useEffect(() => {
    const fetchPreschoolers = async () => {
      setLoading(true);
      setError(null);

      try {
        // API zwraca { data: Student[] }
        const response = await api.get<{ data: Student[] }>("/preschoolers");
        setPreschoolerData(response.data);
      } catch (err: any) {
        console.error('Failed to fetch preschoolers:', err);
        setError(err.message || 'Nie udało się załadować danych');
      } finally {
        setLoading(false);
      }
    };

    fetchPreschoolers();
  }, []);

  // Oblicz zakres elementów do wyświetlenia
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = preschoolerData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(preschoolerData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-4 shadow-lg rounded-lg bg-white">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Ładowanie danych...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error(error);
    return (
      <div className="max-w-4xl mx-auto my-8 p-4 shadow-lg rounded-lg bg-white">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-red-600 mb-4">❌ Błąd: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (preschoolerData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-4 shadow-lg rounded-lg bg-white">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Brak danych do wyświetlenia</div>
        </div>
      </div>
    );
  }

  // Data state
  return (
    <div className="max-w-4xl mx-auto my-8 p-4 shadow-lg rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Lista Przedszkolaków ({preschoolerData.length})
      </h2>

      <table className="table-auto w-full text-left border-collapse border border-gray-300">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-6 py-3 font-medium text-gray-700">ID</th>
            <th className="px-6 py-3 font-medium text-gray-700">Imię</th>
            <th className="px-6 py-3 font-medium text-gray-700">Nazwisko</th>
            <th className="px-6 py-3 font-medium text-gray-700">Grupa</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((student: Student) => (
            <tr key={student.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-3">{student.id}</td>
              <td className="px-6 py-3">{student.firstName}</td>
              <td className="px-6 py-3">{student.lastName}</td>
              <td className="px-6 py-3">
                {student.groupId ?? <span className="text-gray-400 italic">Brak</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Poprzednia
        </button>
        <div className="text-gray-700">
          Strona {currentPage} z {totalPages}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Następna
        </button>
      </div>
    </div>
  );
};

export default PaginatedTable;