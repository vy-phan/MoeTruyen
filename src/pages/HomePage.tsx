import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mangaApi } from '../services/mangaApi';
import { MangaCard } from '../components/manga/MangaCard';
import { SidebarBXH } from '../components/home/SidebarBXH';
import { HeroBanner } from '../components/home/HeroBanner';
import { Pagination } from '../components/common/Pagination';

export default function HomePage() {
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Banner
  const { data: bannerData, isLoading: isBannerLoading } = useQuery({
    queryKey: ['bannerManga'],
    queryFn: () => mangaApi.getBannerManga(5),
  });

  // 2. Fetch Truyện Mới Cập Nhật
  const { data: latestData, isLoading: isLatestLoading } = useQuery({
    queryKey: ['latestManga', page],
    queryFn: () => mangaApi.getLatestManga(page, 16),
  });

  const mangaList = latestData?.data || [];
  const meta = latestData?.meta;
  const pagination = (meta as any)?.pagination || meta;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 1;

  // Cuộn lên đầu danh sách khi chuyển trang
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-5 md:p-6 space-y-6 md:space-y-8">
      {/* 1. HERO BANNER */}
      <HeroBanner items={bannerData?.data || []} isLoading={isBannerLoading} />

      {/* 2. THÂN TRANG CHỦ */}
      <div ref={listRef} className="grid grid-cols-1 lg:grid-cols-4 gap-6 scroll-mt-20">
        
        {/* CỘT TRÁI: DANH SÁCH TRUYỆN */}
        <section className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center border-b border-base-200 pb-3">
            <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-warning fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Truyện Mới Cập Nhật
            </h2>
          </div>

          {/* GRID 5 CARDS TRÊN PC (xl:grid-cols-5) */}
          {isLatestLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="skeleton aspect-[3/4] w-full rounded-xl" />
                  <div className="skeleton h-4 w-3/4 rounded-md" />
                  <div className="skeleton h-3 w-1/2 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {mangaList.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          )}

          {/* 🌸 COMPONENT PHÂN TRANG DAISYUI RADIO MỚI */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>

        {/* CỘT PHẢI: BẢNG XẾP HẠNG */}
        <div className="lg:col-span-1">
          <SidebarBXH />
        </div>

      </div>
    </div>
  );
}