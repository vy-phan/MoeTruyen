import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReadingHistoryStore, type ReadingHistoryItem } from '../store/useReadingHistoryStore';
import { formatRelativeTimestamp } from '../utils/formatters';

// Component hiển thị từng mục lịch sử (dạng card ngang)
function HistoryCard({ item, onRemove }: { item: ReadingHistoryItem; onRemove: (id: number) => void }) {
  const chapterLink = `/chapters/${item.chapterId}`;
  const mangaLink = `/manga/${item.mangaId}`;
  const timeAgo = formatRelativeTimestamp(item.timestamp);

  const chapterLabel = item.chapterTitle
    ? `Chap ${item.chapterNumber}: ${item.chapterTitle}`
    : `Chap ${item.chapterNumber}`;

  return (
    <div className="card bg-base-100 border border-base-content/10 shadow-xs hover:shadow-md transition-all duration-300 group">
      <div className="card-body p-3 sm:p-4 flex flex-row items-center gap-3 sm:gap-4">

        {/* Icon/Avatar placeholder */}
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Tên truyện */}
          <Link
            to={mangaLink}
            className="font-bold text-sm sm:text-base line-clamp-1 hover:text-primary transition-colors group-hover:text-primary"
            title={item.mangaTitle}
          >
            {item.mangaTitle}
          </Link>

          {/* Chapter đang đọc dở */}
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link
              to={chapterLink}
              className="hover:underline truncate"
              title={`Tiếp tục đọc ${chapterLabel}`}
            >
              {chapterLabel}
            </Link>
          </div>

          {/* Thời gian đọc */}
          <p className="text-[11px] opacity-50 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeAgo}
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex-shrink-0 flex items-center gap-1.5">
          {/* Nút tiếp tục đọc */}
          <Link
            to={chapterLink}
            className="btn btn-primary btn-xs sm:btn-sm gap-1 hidden sm:flex"
            title="Tiếp tục đọc"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Đọc tiếp
          </Link>

          {/* Mobile: chỉ icon */}
          <Link
            to={chapterLink}
            className="btn btn-primary btn-circle btn-xs sm:hidden"
            title="Đọc tiếp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Nút xóa */}
          <button
            onClick={() => onRemove(item.mangaId)}
            className="btn btn-ghost btn-circle btn-xs text-error opacity-0 group-hover:opacity-100 transition-opacity"
            title="Xóa khỏi lịch sử"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { readingHistory, removeFromHistory, clearHistory } = useReadingHistoryStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRemove = (mangaId: number) => {
    removeFromHistory(mangaId);
  };

  const handleClearAll = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  return (
    <div className="container mx-auto p-3 sm:p-5 md:p-6 space-y-6 md:space-y-8">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-200 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
            <span className="text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Lịch Sử Đọc Truyện
          </h1>
          <p className="text-sm opacity-60">
            {readingHistory.length > 0
              ? `${readingHistory.length} bộ truyện đã đọc gần đây`
              : 'Chưa có lịch sử đọc truyện nào'}
          </p>
        </div>

        {/* Nút xóa tất cả */}
        {readingHistory.length > 0 && (
          <div className="flex-shrink-0">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xs font-medium opacity-70">Xóa tất cả?</span>
                <button
                  onClick={handleClearAll}
                  className="btn btn-error btn-xs"
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="btn btn-ghost btn-xs"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="btn btn-outline btn-error btn-sm gap-1.5"
                id="btn-clear-history"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa tất cả
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===== NỘI DUNG ===== */}
      {readingHistory.length === 0 ? (
        /* Trạng thái rỗng */
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold opacity-60">Chưa có lịch sử</h2>
            <p className="text-sm opacity-50 max-w-xs">
              Hãy bắt đầu đọc truyện để lịch sử của bạn xuất hiện tại đây nhé!
            </p>
          </div>
          <Link to="/" className="btn btn-primary rounded-xl px-6 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Khám phá truyện
          </Link>
        </div>
      ) : (
        /* Danh sách lịch sử */
        <div className="space-y-2.5">
          {readingHistory.map((item) => (
            <HistoryCard
              key={item.mangaId}
              item={item}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
