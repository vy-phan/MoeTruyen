import { Link } from 'react-router-dom';
import type { MangaItem, ChapterItem } from '../../types/manga';
import { formatStatus, formatRelativeTime } from '../../utils/formatters';
import { getCoverUrl } from '../../utils/getImageUrl';
import { useReadingHistoryStore } from '../../store/useReadingHistoryStore';

interface HeaderProps {
  manga: MangaItem;
  chapters: ChapterItem[];
  chapterOrder: 'asc' | 'desc';
}

export function MangaDetailHeader({ manga, chapters, chapterOrder }: HeaderProps) {
  const coverSrc = getCoverUrl(manga);
  const statusInfo = formatStatus(manga.status);
  const getLatestChapter = useReadingHistoryStore((state) => state.getLatestChapter);
  const savedChapter = getLatestChapter(manga.id);

  const firstChapter = chapters.length > 0 ? (chapterOrder === 'asc' ? chapters[0] : chapters[chapters.length - 1]) : null;
  const latestChapter = chapters.length > 0 ? (chapterOrder === 'desc' ? chapters[0] : chapters[chapters.length - 1]) : null;

  // Use saved chapter if available, otherwise use first chapter
  const continueChapter = savedChapter ? chapters.find(ch => ch.id === savedChapter.chapterId) : firstChapter;

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-base-content/10 shadow-2xl bg-base-100">
      {/* Nền Ambient Gradient Modern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={coverSrc}
          alt={manga.title}
          className="w-full h-full object-cover filter blur-3xl scale-150 opacity-20 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-base-100/95 via-base-100/90 to-base-100/70" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">
        {/* Top Section: Cover + Basic Info (Mobile-First) */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
          {/* Ảnh Bìa - Optimized for Mobile */}
          <div className="shrink-0 relative group">
            <div className="w-32 sm:w-40 md:w-48 lg:w-56 aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-2 sm:border-4 border-white/80 bg-base-300 transform group-hover:scale-[1.02] transition-transform duration-300">
              <img
                src={coverSrc}
                alt={manga.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x400?text=No+Cover'; }}
              />
            </div>
          </div>

          {/* Basic Info Column */}
          <div className="flex-1 text-center sm:text-left min-w-0 w-full space-y-3 sm:space-y-4">
            {/* Tiêu đề - Mobile Optimized */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-base-content leading-tight drop-shadow-sm">
                {manga.title}
              </h1>
              {manga.altTitles && manga.altTitles.length > 0 && (
                <p className="text-[10px] sm:text-xs opacity-70 italic mt-1.5 line-clamp-1 sm:line-clamp-2">
                  {manga.altTitles.join(' • ')}
                </p>
              )}
            </div>

            {/* Badges - Compact Mobile */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              <span className={`badge ${statusInfo.colorClass} badge-sm sm:badge-md font-bold shadow-xs px-2 sm:px-3 py-2 sm:py-3`}>
                {statusInfo.label}
              </span>
              {manga.groupName && (
                <span className="badge badge-neutral text-neutral-content border-none text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-2 sm:py-3 gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  {manga.groupName}
                </span>
              )}
            </div>

            {/* Stats - Compact Grid for Mobile */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center sm:justify-start gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 py-2 sm:py-3 border-y border-base-content/10 text-[11px] sm:text-sm opacity-90">
              <div className="flex items-center gap-1 sm:gap-1.5 justify-center sm:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="font-semibold truncate">{manga.author || 'Đang cập nhật'}</span>
              </div>
              {/* <div className="flex items-center gap-1 sm:gap-1.5 justify-center sm:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                <span className="font-semibold">{manga.chapterCount || chapters.length} chương</span>
              </div> */}
                            <div className="flex items-center gap-1 sm:gap-1.5 justify-center sm:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                <span className="font-semibold">{formatRelativeTime(manga.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Full Width on Mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 pt-1 sm:pt-2">
          {continueChapter && (
            <Link
              to={`/chapters/${continueChapter.id}`}
              className="btn btn-primary shadow-lg shadow-primary/30 font-bold gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-none w-full sm:w-auto text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="truncate">Tiếp Tục Đọc (Chap {continueChapter.number})</span>
            </Link>
          )}
          {firstChapter && continueChapter?.id !== firstChapter.id && (
            <Link
              to={`/chapters/${firstChapter.id}`}
              className="btn btn-neutral border border-base-content/20 font-bold gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl backdrop-blur-md w-full sm:w-auto text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span className="truncate">Đọc Từ Đầu (Chap {firstChapter.number})</span>
            </Link>
          )}
          {latestChapter && latestChapter.id !== continueChapter?.id && latestChapter.id !== firstChapter?.id && (
            <Link
              to={`/chapters/${latestChapter.id}`}
              className="btn btn-neutral border border-base-content/20 font-bold gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl backdrop-blur-md w-full sm:w-auto text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="truncate">Mới Nhất (Chap {latestChapter.number})</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}