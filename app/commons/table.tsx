import React, { useState } from 'react';

const PaginatedTable = () => {
  const data = [
    { id: 1, name: 'Amit Sharma', age: 28, job: 'Software Developer' },
    { id: 2, name: 'Priya Singh', age: 34, job: 'Product Manager' },
    { id: 3, name: 'Ravi Kumar', age: 23, job: 'UI/UX Designer' },
    { id: 4, name: 'Anjali Patel', age: 45, job: 'Project Manager' },
    { id: 5, name: 'Vikram Yadav', age: 40, job: 'Engineer' },
    { id: 6, name: 'Neha Gupta', age: 32, job: 'Data Scientist' },
    { id: 7, name: 'Suresh Reddy', age: 38, job: 'Scientist' },
    { id: 8, name: 'Pooja Desai', age: 35, job: 'Architect' },
    { id: 9, name: 'Rahul Mehta', age: 29, job: 'Manager' },
    { id: 10, name: 'Sonia Kapoor', age: 31, job: 'HR Specialist' },
  ];
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