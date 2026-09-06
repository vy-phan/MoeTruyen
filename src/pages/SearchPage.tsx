import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mangaApi } from '../services/mangaApi';
import { MangaCard } from '../components/manga/MangaCard';
import { Pagination } from '../components/common/Pagination';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [filters, setFilters] = useState({
    status: '',
    sort: 'relevance' as 'relevance' | 'updatedAt' | 'views' | 'rating',
  });
  const [page, setPage] = useState(1);

  // Update search query when URL params change
  useEffect(() => {
    setSearchQuery(queryParam);
    setPage(1);
  }, [queryParam]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const newParams = new URLSearchParams();
        newParams.set('q', searchQuery.trim());
        setSearchParams(newParams);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchParams]);

  // Search API call
  const { data: searchData, isLoading, isError } = useQuery({
    queryKey: ['searchManga', searchQuery, filters, page],
    queryFn: () => mangaApi.searchManga(searchQuery, {
      status: filters.status,
      sort: filters.sort,
      page,
      limit: 20,
    }),
    enabled: searchQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });

  const mangaList = searchData?.data || [];
  const meta = searchData?.meta;
  const pagination = (meta as any)?.pagination || meta;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 1;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams();
      newParams.set('q', searchQuery.trim());
      setSearchParams(newParams);
      setPage(1);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Tìm kiếm truyện</h1>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="join w-full">
            <input
              type="text"
              placeholder="Nhập tên truyện, tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered join-item flex-1"
            />
            <button
              type="submit"
              className="btn btn-primary join-item"
              disabled={!searchQuery.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm kiếm
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ongoing">Đang tiến hành</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="hiatus">Tạm ngưng</option>
              <option value="dropped">Đã hủy</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="relevance">Liên quan nhất</option>
              <option value="updatedAt">Mới cập nhật</option>
              <option value="views">Lượt xem</option>
              <option value="rating">Đánh giá</option>
            </select>
          </div>
        </form>
      </div>

      {/* Results */}
      {searchQuery.trim().length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium opacity-70">Nhập từ khóa để tìm kiếm truyện</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="skeleton aspect-[3/4] w-full rounded-xl" />
              <div className="skeleton h-4 w-3/4 rounded-md" />
              <div className="skeleton h-3 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-error font-medium">Có lỗi xảy ra khi tìm kiếm</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline btn-error"
          >
            Thử lại
          </button>
        </div>
      ) : mangaList.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-lg font-medium opacity-70">Không tìm thấy kết quả nào</p>
          <p className="text-sm opacity-50">Thử từ khóa khác hoặc điều chỉnh bộ lọc</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center border-b border-base-200 pb-3">
            <p className="text-sm opacity-70">
              Tìm thấy <span className="font-bold">{mangaList.length}</span> kết quả
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {mangaList.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}