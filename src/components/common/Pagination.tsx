import { useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // State cho dialog nhập trang
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputPage, setInputPage] = useState('');
  const [inputError, setInputError] = useState('');

  // Xử lý khi submit form nhập trang
  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage);

    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      setInputError(`Vui lòng nhập số từ 1 đến ${totalPages}`);
      return;
    }

    setInputError('');
    onPageChange(pageNum);
    setIsDialogOpen(false);
    setInputPage('');
  };

  // Reset input khi mở dialog
  const handleOpenDialog = () => {
    setInputPage(currentPage.toString());
    setInputError('');
    setIsDialogOpen(true);
  };

  // 🌸 Logic thông minh hiển thị pagination với ellipsis và trang cuối
  const getVisiblePages = () => {
    // Nếu ít trang, hiển thị tất cả
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // Luôn hiển thị trang 1
    pages.push(1);

    // Hiển thị ellipsis nếu cần
    if (currentPage > 3) {
      pages.push('...');
    }

    // Hiển thị các trang xung quanh trang hiện tại
    const startRange = Math.max(2, currentPage - 1);
    const endRange = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startRange; i <= endRange; i++) {
      pages.push(i);
    }

    // Hiển thị ellipsis nếu cần
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Luôn hiển thị trang cuối
    pages.push(totalPages);

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center pt-6 select-none">
      {/* Giao diện Join đồng nhất 100% trên cả PC và Mobile */}
      <div className="join shadow-xs border border-base-content/10 bg-base-100 rounded-xl p-1">
        
        {/* ⬅️ Nút Trang Trước (Dùng SVG Icon) */}
        <button
          className="join-item btn btn-square btn-ghost btn-sm sm:btn-md"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Trang trước"
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 🔢 Nút Số Trang với Ellipsis Clickable */}
        {visiblePages.map((p, index) => {
          if (p === '...') {
            return (
              <button
                key={`ellipsis-${index}`}
                className="join-item btn btn-square btn-sm sm:btn-md btn-ghost"
                onClick={handleOpenDialog}
                title="Nhảy đến trang..."
              >
                ...
              </button>
            );
          }

          return (
            <input
              key={p}
              className="join-item btn btn-square btn-sm sm:btn-md"
              type="radio"
              name="pagination-options"
              aria-label={p.toString()}
              checked={currentPage === p}
              onChange={() => onPageChange(p as number)}
            />
          );
        })}

        {/* ➡️ Nút Trang Sau (Dùng SVG Icon) */}
        <button
          className="join-item btn btn-square btn-ghost btn-sm sm:btn-md"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Trang sau"
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>

      {/* Dialog nhập trang */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-center">Nhảy đến trang</h3>

            <form onSubmit={handlePageJump} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nhập số trang (1 - {totalPages})
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={inputPage}
                  onChange={(e) => setInputPage(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder={`Nhập số từ 1 đến ${totalPages}`}
                  autoFocus
                />
                {inputError && (
                  <p className="text-error text-xs mt-1">{inputError}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="btn btn-ghost"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Đi đến trang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}