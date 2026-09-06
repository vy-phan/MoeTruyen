import { Link } from 'react-router-dom';
import type { MangaItem } from '../../types/manga';
import { formatStatus, formatRelativeTime } from '../../utils/formatters';
import { getCoverUrl } from '../../utils/getImageUrl';

interface MangaCardProps {
  manga: MangaItem;
}

export function MangaCard({ manga }: MangaCardProps) {
  const coverSrc = getCoverUrl(manga);
  const statusInfo = formatStatus(manga.status);

  // Lấy thông tin chapter mới nhất & ID để click xem nhanh
  const latestChapNum = manga.latestChapterNumber ?? manga.latestChapter?.chapterNumber;
  const latestChapId = manga.latestChapter?.id;

  // Lấy thời gian cập nhật tương đối (2 giờ trước, 3 ngày trước...)
  const updatedAt = manga.latestChapter?.updatedAt || manga.updatedAt;
  const timeAgo = formatRelativeTime(updatedAt);

  // Link chính: Nếu có chapter mới nhất thì vào chapter, nếu không thì vào trang chi tiết manga
  const mainLink = latestChapId ? `/chapters/${latestChapId}` : `/manga/${manga.id}`;

  return (
    <div className="card bg-base-100 shadow-xs hover:shadow-xl transition-all duration-300 border border-base-content/10 group overflow-hidden rounded-2xl flex flex-col justify-between">
      
      {/* 1. THUMBNAIL / ẢNH BÌA VỚI THẺ BADGE TRẠNG THÁI TIẾNG VIỆT */}
      <figure className="relative aspect-[3/4] overflow-hidden bg-base-300">
        <Link to={mainLink} className="w-full h-full block">
          <img
            src={coverSrc}
            alt={manga.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/300x400?text=No+Cover';
            }}
          />
          {/* Layer Gradient mờ ở chân ảnh */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        </Link>

        {/* Badge Trạng thái Tiếng Việt */}
        <div className="absolute top-2 left-2 z-10">
          <span className={`badge ${statusInfo.colorClass} badge-sm font-bold shadow-md text-[10px] sm:text-[11px] px-2 py-0.5`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Lượt xem (nếu có) */}
        {manga.views && (
          <div className="absolute bottom-1.5 left-2 z-10 flex items-center gap-1 text-[10px] text-white/90 font-medium bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {manga.views.toLocaleString()}
          </div>
        )}
      </figure>

      {/* 2. NỘI DUNG CARD */}
      <div className="card-body p-3 gap-1.5 flex-1 flex flex-col justify-between">
        
        {/* Tên truyện */}
        <h3 className="card-title text-xs sm:text-sm line-clamp-2 font-bold leading-snug group-hover:text-primary transition-colors" title={manga.title}>
          <Link to={mainLink}>
            {manga.title}
          </Link>
        </h3>

        {/* LINK XEM CHAPTER NHANH & THỜI GIAN CẬP NHẬT TƯƠNG ĐỐI */}
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-base-content/10 gap-1 mt-auto">
          {latestChapNum !== undefined && latestChapNum !== null ? (
            <Link
              to={latestChapId ? `/chapters/${latestChapId}` : `/manga/${manga.id}`}
              className="font-bold text-primary hover:underline hover:text-primary-focus truncate text-[11px] sm:text-xs"
              title={`Đọc Chap ${latestChapNum}`}
            >
              Chap {latestChapNum}
            </Link>
          ) : (
            <span className="text-[11px] opacity-50 italic">Chưa có chap</span>
          )}

          {/* Thời gian cập nhật tương đối (VD: 2 giờ trước) */}
          {timeAgo && (
            <span className="text-[10px] sm:text-[11px] opacity-70 whitespace-nowrap font-normal">
              {timeAgo}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}