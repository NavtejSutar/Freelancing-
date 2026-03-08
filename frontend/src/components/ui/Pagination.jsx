import { useSearchParams } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function Pagination({ totalPages, currentPage, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <HiChevronLeft className="w-5 h-5" />
      </button>
      {start > 0 && (
        <>
          <button onClick={() => onPageChange(0)} className="px-3 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-100">1</button>
          {start > 1 && <span className="px-1 text-gray-400">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            p === currentPage ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {p + 1}
        </button>
      ))}
      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="px-1 text-gray-400">...</span>}
          <button onClick={() => onPageChange(totalPages - 1)} className="px-3 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-100">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <HiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
