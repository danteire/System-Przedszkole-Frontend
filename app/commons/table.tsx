import React, { useState } from 'react';

{
  "firstName":"Jan"
  "lastName":"Kowalski"
  "parentId": 1
}

interface Student{
  firstName: String;
  lastName: String;
  parentID: number;
}

const PaginatedTable = () => {
  const preschoolerData = api.get("");
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-4 shadow-lg rounded-lg bg-white">
      <table className="table-auto w-full text-left border-collapse border border-gray-300">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-6 py-3 font-medium text-gray-700">ID</th>
            <th className="px-6 py-3 font-medium text-gray-700">Name</th>
            <th className="px-6 py-3 font-medium text-gray-700">Age</th>
            <th className="px-6 py-3 font-medium text-gray-700">Job</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((person) => (
            <tr key={person.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-3">{person.id}</td>
              <td className="px-6 py-3">{person.name}</td>
              <td className="px-6 py-3">{person.age}</td>
              <td className="px-6 py-3">{person.job}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
        >
          Previous
        </button>
        <div className="text-gray-700">
          Page {currentPage} of {Math.ceil(data.length / itemsPerPage)}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginatedTable;