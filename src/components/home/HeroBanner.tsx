import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { MangaItem } from '../../types/manga';
import { getCoverUrl } from '../../utils/getImageUrl';


interface HeroBannerProps {
  items: MangaItem[];
  isLoading: boolean;
  autoSlideInterval?: number; // 3000ms = 3s
}

export function HeroBanner({ items, isLoading, autoSlideInterval = 3000 }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 🔄 Tự động đổi slide 3s / lần
  useEffect(() => {
    if (!items || items.length <= 1 || isHovered) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, autoSlideInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items, isHovered, autoSlideInterval]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  if (isLoading) {
    return <div className="skeleton w-full h-[240px] sm:h-[280px] md:h-[310px] rounded-2xl" />;
  }

  if (!items || items.length === 0) return null;

  const currentManga = items[currentIndex];
  const coverSrc = getCoverUrl(currentManga);

  return (
    <div
      className="relative w-full h-[240px] sm:h-[280px] md:h-[310px] rounded-2xl overflow-hidden shadow-2xl border border-base-content/10 bg-base-100 text-base-content select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ==================== 1. NỀN ẢNH BÌA BLUR MÀU SẮC ĐỘNG + GRADIENT THEME ==================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Ảnh bìa phóng to, làm mờ sâu (Ambient Blur) giữ trọn tông màu rực rỡ của truyện */}
        <img
          src={coverSrc}
          alt={currentManga.title}
          className="w-full h-full object-cover filter blur-2xl md:blur-3xl scale-125 md:scale-150 opacity-65 transition-all duration-700 ease-out"
        />
      </div>

      {/* ==================== 2. NỘI DUNG CHÍNH (LAYOUT GỌN ĐẸP) ==================== */}
      <div className="relative z-20 h-full p-3.5 sm:p-5 md:p-6 flex items-center gap-3.5 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
        
        {/* BÊN TRÁI: ẢNH BÌA VIỀN TRẮNG SẮC NÉT + ĐỔ BÓNG NỔI BẬT TRÊN NỀN BLUR */}
        <div className="shrink-0 relative">
          <div className="w-[100px] sm:w-[130px] md:w-[165px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-white/90 bg-base-300 transform group-hover:scale-[1.02] transition-transform duration-300">
            <img
              src={coverSrc}
              alt={currentManga.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/300x400?text=No+Cover';
              }}
            />
          </div>
        </div>

        {/* BÊN PHẢI: THÔNG TIN TRUYỆN */}
        <div className="flex-1 space-y-1.5 sm:space-y-2.5 min-w-0 pr-1 sm:pr-24">
          
          {/* HÀNG BADGES TINH GỌN */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="badge badge-info badge-xs sm:badge-sm font-bold uppercase rounded-full px-2 py-0.5 text-[10px] sm:text-xs shadow-xs">
              {currentManga.status || 'ONGOING'}
            </span>

            {currentManga.genres?.slice(0, 3).map((g) => (
              <span
                key={g.id}
                className="badge bg-black/45 border border-white/20 text-white text-[9px] sm:text-[11px] font-medium uppercase rounded-full px-2 py-0.5 backdrop-blur-xs"
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* TIÊU ĐỀ TRUYỆN */}
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight line-clamp-1 sm:line-clamp-2 drop-shadow-sm">
            <Link to={`/manga/${currentManga.id}`} className="hover:text-primary transition-colors">
              {currentManga.title}
            </Link>
          </h2>

          {/* MÔ TẢ TRUYỆN */}
          <p className="text-[11px] sm:text-xs md:text-sm opacity-80 line-clamp-2 leading-relaxed font-normal ">
            {currentManga.description || 'Khám phá ngay bộ truyện nổi bật đang được quan tâm nhiều nhất tại MoeTruyen.'}
          </p>

          {/* TÁC GIẢ */}
          {currentManga.author && (
            <p className="text-[10px] sm:text-xs italic opacity-75 font-normal truncate">
              Tác giả: <span className="font-semibold text-primary">{currentManga.author}</span>
            </p>
          )}

          {/* CÁC NÚT BẤM TINH TẾ */}
          <div className="pt-1 flex items-center gap-2">
            <Link
              to={`/manga/${currentManga.id}`}
              className="btn btn-primary btn-xs sm:btn-sm shadow-md font-bold gap-1.5 px-3.5 sm:px-4 rounded-lg"
            >
              {/* Play SVG Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Đọc Ngay
            </Link>

            <Link
              to={`/manga/${currentManga.id}`}
              className="btn btn-ghost border border-base-content/20 hover:bg-base-content/10 btn-xs sm:btn-sm gap-1 px-3 rounded-lg backdrop-blur-md"
            >
              {/* Info SVG Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chi Tiết
            </Link>
          </div>
        </div>
      </div>

      {/* ==================== 3. BỘ ĐIỀU KHIỂN CHUYỂN SLIDE (NO.1 < >) ==================== */}
      <div className="absolute bottom-2.5 right-3 sm:bottom-3 sm:right-4 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-lg text-white">
        {/* Số Slide */}
        <span className="text-[10px] sm:text-xs font-bold tracking-wider text-white/90">
          NO.{currentIndex + 1}
        </span>

        <span className="w-[1px] h-3 bg-white/30" />

        {/* Nút Prev SVG */}
        <button
          onClick={handlePrev}
          className="hover:text-primary transition-colors p-0.5"
          title="Trang trước"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Nút Next SVG */}
        <button
          onClick={handleNext}
          className="hover:text-primary transition-colors p-0.5"
          title="Trang sau"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  );
}