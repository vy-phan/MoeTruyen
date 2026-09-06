import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChapterItem } from '../../types/manga';
import { formatRelativeTime } from '../../utils/formatters';
import { Pagination } from '../common/Pagination';
import { useReadingHistoryStore } from '../../store/useReadingHistoryStore';

interface ChapterListProps {
  chapters: ChapterItem[];
  isLoading: boolean;
  chapterOrder: 'asc' | 'desc';
  setChapterOrder: (order: 'asc' | 'desc') => void;
  chapterPage: number;
  setChapterPage: (page: number) => void;
  totalPages: number;
  mangaId: number;
}

export function ChapterList({ chapters, isLoading, chapterOrder, setChapterOrder, chapterPage, setChapterPage, totalPages, mangaId }: ChapterListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const getLatestChapter = useReadingHistoryStore((state) => state.getLatestChapter);
  const currentReadingChapter = getLatestChapter(mangaId);

  const filteredChapters = chapters.filter((chap) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const num = (chap.number ?? '').toString().toLowerCase();
    const title = (chap.title || '').toLowerCase();
    return num.includes(q) || title.includes(q);
  });

  return (
    <div className="card bg-base-100 border border-base-content/10 shadow-sm p-4 sm:p-7 space-y-5 rounded-3xl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-200 pb-4">
        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          <h3 className="text-lg font-bold">Danh Sách Chương</h3>
          <span className="badge badge-primary badge-sm font-bold ml-1">{filteredChapters.length}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              placeholder="Tìm số chap..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm input-bordered w-full pr-8 rounded-xl bg-base-200/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setChapterOrder(chapterOrder === 'desc' ? 'asc' : 'desc')}
            className="btn btn-sm btn-outline border-base-content/20 gap-1.5 rounded-xl font-bold"
            title="Đảo thứ tự"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            {chapterOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-14 w-full rounded-2xl" />)}
        </div>
      ) : filteredChapters.length === 0 ? (
        <div className="text-center py-16 opacity-50 text-sm">
          {searchQuery ? 'Không tìm thấy chương phù hợp.' : 'Chưa có chương nào được cập nhật.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredChapters.map((chap) => {
            const isCurrentReading = currentReadingChapter?.chapterId === chap.id;

            return (
              <Link
                key={chap.id}
                to={`/chapters/${chap.id}`}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 group ${
                  isCurrentReading
                    ? 'border-warning bg-warning/10 shadow-sm'
                    : 'border-base-content/10 bg-base-100 hover:border-primary hover:bg-base-200/50 hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-3 gap-0.5">
                  <span className={`font-bold text-sm sm:text-base transition-colors truncate ${
                    isCurrentReading
                      ? 'text-warning'
                      : 'text-base-content group-hover:text-primary'
                  }`}>
                    Chap {chap.number} {chap.title && <span className="opacity-70 font-medium"> - {chap.title}</span>}
                  </span>
                  <span className="text-[11px] opacity-60 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {formatRelativeTime(chap.date)}
                    </span>
                    {chap.viewCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {chap.viewCount.toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                    isCurrentReading
                      ? 'bg-warning/20 text-warning'
                      : 'bg-base-200/50 text-primary group-hover:bg-primary group-hover:text-primary-content'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <Pagination currentPage={chapterPage} totalPages={totalPages} onPageChange={setChapterPage} />
      )}
    </div>
  );
}