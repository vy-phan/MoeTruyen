import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mangaApi } from '../services/mangaApi';
import { ReaderImage } from '../components/reader/ReaderImage';
import { decodeImgxToWebp, isImgxUrl } from '../utils/imgx';
import { useReadingHistoryStore } from '../store/useReadingHistoryStore';

export default function ChapterReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Reading history store
  const addToHistory = useReadingHistoryStore((state) => state.addToHistory);
  const removeFromHistory = useReadingHistoryStore((state) => state.removeFromHistory);

  // Chế độ đọc: 'vertical' (Cuộn dọc) | 'single' (Từng trang)
  const [readMode, setReadMode] = useState<'vertical' | 'single'>('vertical');
  const [singlePageIndex, setSinglePageIndex] = useState(0);
  const [maxWidth, setMaxWidth] = useState<'normal' | 'large' | 'full'>('normal');

  // State cho ảnh đã giải mã
  const [decodedPageUrls, setDecodedPageUrls] = useState<Record<number, string>>({});
  const [isDecoding, setIsDecoding] = useState(false);

  // 🌸 GỌI API LẤY CHI TIẾT CHƯƠNG
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['chapterDetail', id],
    queryFn: () => mangaApi.getChapterDetail(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  const data = response?.data;
  const manga = data?.manga;
  const chapter = data?.chapter;
  const pages: string[] = data?.pageUrls || (data as any)?.pages || [];
  const prevChapter = data?.prevChapter;
  const nextChapter = data?.nextChapter;
  const totalPages = pages.length;

  // Kiểm tra xem chapter hiện tại này đã được người dùng bấm lưu hay chưa
  const isBookmarked = useReadingHistoryStore((state) =>
    Boolean(chapter?.id && state.readingHistory.some((item) => item.chapterId === chapter.id))
  );

  // Toggle bookmark khi người dùng tự click
  const handleToggleBookmark = () => {
    if (!manga || !chapter) return;

    if (isBookmarked) {
      removeFromHistory(manga.id);
    } else {
      addToHistory({
        mangaId: manga.id,
        mangaTitle: manga.title,
        mangaSlug: manga.slug,
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title || undefined,
        timestamp: Date.now(),
      });
    }
  };

  // Hàm giải mã một trang ảnh
  const decodeImgxPage = useCallback(async (
    source: string,
    grant: any,
    storageKey: string
  ): Promise<string> => {
    try {
      const response = await fetch(source);
      const arrayBuffer = await response.arrayBuffer();

      const decoded = await decodeImgxToWebp(arrayBuffer, grant, storageKey);

      const blob = new Blob([Uint8Array.from(decoded.webp).buffer], {
        type: "image/webp",
      });

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error decoding IMGX page:', error);
      throw error;
    }
  }, []);

  // Hàm tải và giải mã ảnh theo batch
  const loadAndDecodePages = useCallback(async (chapterId: number, pageUrls: string[]) => {
    if (!chapterId || pageUrls.length === 0) return;

    setIsDecoding(true);
    const batchSize = 5;
    const newDecodedUrls: Record<number, string> = {};

    try {
      for (let i = 0; i < pageUrls.length; i += batchSize) {
        const pageIndexes = Array.from(
          { length: Math.min(batchSize, pageUrls.length - i) },
          (_, idx) => i + idx
        );

        const pageAccess = await mangaApi.getChapterPageAccess(
          chapterId,
          pageIndexes
        );

        for (const page of pageAccess.data.pages) {
          try {
            const decodedUrl = await decodeImgxPage(
              pageUrls[page.pageIndex],
              page.grant,
              page.storageKey
            );
            newDecodedUrls[page.pageIndex] = decodedUrl;
          } catch (error) {
            console.error(`Failed to decode page ${page.pageIndex}:`, error);
            newDecodedUrls[page.pageIndex] = pageUrls[page.pageIndex];
          }
        }

        setDecodedPageUrls(prev => ({ ...prev, ...newDecodedUrls }));
      }
    } catch (error) {
      console.error('Error loading page access:', error);
    } finally {
      setIsDecoding(false);
    }
  }, [decodeImgxPage]);

  // Chỉ giải mã ảnh (ĐÃ BỎ ĐOẠN TỰ ĐỘNG LƯU VÀO HISTORY TẠI ĐÂY)
  useEffect(() => {
    if (id && pages.length > 0) {
      const hasImgxUrls = pages.some(url => isImgxUrl(url));
      if (hasImgxUrls) {
        loadAndDecodePages(Number(id), pages);
      }
    }
  }, [id, pages, loadAndDecodePages]);

  // Bắt sự kiện bàn phím chuyển trang/chap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readMode === 'single') {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          if (singlePageIndex < totalPages - 1) setSinglePageIndex((prev) => prev + 1);
          else if (nextChapter?.id) navigate(`/chapters/${nextChapter.id}`);
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          if (singlePageIndex > 0) setSinglePageIndex((prev) => prev - 1);
          else if (prevChapter?.id) navigate(`/chapters/${prevChapter.id}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readMode, singlePageIndex, totalPages, prevChapter, nextChapter, navigate]);

  // Cuộn lên đầu khi chuyển chapter
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSinglePageIndex(0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="loading loading-spinner loading-lg text-primary" />
        <p className="text-sm opacity-70 animate-pulse font-medium">Đang tải chương truyện...</p>
      </div>
    );
  }

  if (isError || !data || !chapter) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-error">Không thể tải chương truyện!</h2>
        <p className="opacity-70">Chương này không tồn tại hoặc đã bị khóa.</p>
        <Link to="/" className="btn btn-primary rounded-xl px-6">Quay về Trang Chủ</Link>
      </div>
    );
  }

  const containerWidthClass =
    maxWidth === 'normal'
      ? 'max-w-3xl'
      : maxWidth === 'large'
        ? 'max-w-5xl'
        : 'max-w-full';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pb-20 select-none">

      {/* ==================== 1. FLOATING HEADER ==================== */}
      <header className="sticky top-0 z-50 w-full bg-neutral-900/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xl">

        {/* Nút Quay lại & Tên truyện */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to={manga?.id ? `/manga/${manga.id}` : '/'}
            className="btn btn-circle btn-ghost btn-sm text-white"
            title="Quay lại chi tiết truyện"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold truncate">
              {manga?.title || 'Đọc Truyện'}
            </h1>
            <p className="text-[11px] text-primary font-extrabold truncate">
              Chap {chapter.number} {chapter.title && <span className="opacity-80 font-normal">- {chapter.title}</span>}
            </p>
          </div>
        </div>

        {/* Tùy chỉnh chế độ đọc, Đổi chap & Bookmark */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Indicator giải mã */}
          {isDecoding && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/20 rounded-lg">
              <div className="loading loading-spinner loading-xs text-primary" />
              <span className="text-[10px] text-primary font-medium">Đang giải mã...</span>
            </div>
          )}

          {/* Đổi Chế độ: Cuộn dọc vs Từng trang */}
          <button
            onClick={() => setReadMode((prev) => (prev === 'vertical' ? 'single' : 'vertical'))}
            className="btn btn-xs sm:btn-sm btn-ghost border border-white/15 rounded-lg text-white font-medium gap-1"
          >
            {readMode === 'vertical' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                <span className="hidden sm:inline">Cuộn dọc</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <span className="hidden sm:inline">Từng trang</span>
              </>
            )}
          </button>

          {/* Độ Rộng Khung Hình */}
          <button
            onClick={() => setMaxWidth((prev) => (prev === 'normal' ? 'large' : prev === 'large' ? 'full' : 'normal'))}
            className="btn btn-xs sm:btn-sm btn-ghost border border-white/15 rounded-lg text-white font-medium hidden md:inline-flex"
          >
            {maxWidth === 'normal' ? 'Chuẩn' : maxWidth === 'large' ? 'Rộng' : 'Tràn viền'}
          </button>

          {/* Chuyển Chap Nhanh */}
          <div className="flex items-center gap-1 pl-1 border-l border-white/15">
            <button
              disabled={!prevChapter}
              onClick={() => navigate(`/chapters/${prevChapter?.id}`)}
              className="btn btn-circle btn-ghost btn-xs sm:btn-sm disabled:opacity-20 text-white"
              title="Chapter trước"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              disabled={!nextChapter}
              onClick={() => navigate(`/chapters/${nextChapter?.id}`)}
              className="btn btn-circle btn-ghost btn-xs sm:btn-sm disabled:opacity-20 text-white"
              title="Chapter sau"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* ==================== BOOKMARK TOGGLE (DAISYUI SWAP) ==================== */}
          <label
            className="btn btn-circle btn-ghost btn-xs sm:btn-sm swap swap-rotate text-warning hover:bg-white/10"
            title={isBookmarked ? 'Đã lưu (Bấm để hủy lưu)' : 'Chưa lưu (Bấm để lưu bookmark)'}
          >
            <input
              type="checkbox"
              checked={isBookmarked}
              onChange={handleToggleBookmark}
            />

            {/* swap-on: ĐÃ LƯU -> Màu vàng tô kín */}
            <svg
              className="swap-on w-4 h-4 fill-warning stroke-warning"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>

            {/* swap-off: CHƯA LƯU -> Viền xám rỗng, KHÔNG có màu vàng */}
            <svg
              className="swap-off w-4 h-4 fill-none stroke-current text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </label>

        </div>
      </header>

      {/* ==================== 2. KHU VỰC ĐỌC ẢNH ==================== */}
      <main className={`w-full ${containerWidthClass} transition-all duration-300 mt-2 sm:mt-4`}>

        {pages.length === 0 ? (
          <div className="text-center py-28 space-y-3">
            <p className="text-gray-400 text-sm">Chương này chưa có trang ảnh nào.</p>
          </div>
        ) : readMode === 'vertical' ? (

          /* CHẾ ĐỘ 1: CUỘN DỌC (LONG STRIP) */
          <div className="flex flex-col items-center space-y-0.5">
            {pages.map((url, idx) => {
              const decodedUrl = decodedPageUrls[idx];
              const needsDecoding = isImgxUrl(url);
              const finalUrl = needsDecoding ? decodedUrl : url;

              return (
                <ReaderImage
                  key={`${url}-${idx}`}
                  src={finalUrl}
                  pageIndex={idx}
                  alt={`${manga?.title || 'Manga'} - Chap ${chapter.number} - Trang ${idx + 1}`}
                />
              );
            })}
          </div>

        ) : (

          /* CHẾ ĐỘ 2: TỪNG TRANG (SINGLE PAGE) */
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full relative flex items-center justify-center">
              {(() => {
                const decodedUrl = decodedPageUrls[singlePageIndex];
                const currentUrl = pages[singlePageIndex];
                const needsDecoding = isImgxUrl(currentUrl);
                const finalUrl = needsDecoding ? decodedUrl : currentUrl;

                return (
                  <ReaderImage
                    key={`${currentUrl}-${singlePageIndex}`}
                    src={finalUrl}
                    pageIndex={singlePageIndex}
                    alt={`${manga?.title || 'Manga'} - Trang ${singlePageIndex + 1}`}
                  />
                );
              })()}
            </div>

            {/* Thanh lật trang */}
            <div className="flex items-center gap-4 bg-neutral-900/90 border border-white/10 px-5 py-2 rounded-full shadow-lg">
              <button
                disabled={singlePageIndex <= 0}
                onClick={() => setSinglePageIndex((prev) => Math.max(0, prev - 1))}
                className="btn btn-circle btn-ghost btn-sm disabled:opacity-20 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>

              <span className="text-xs font-bold tracking-wider">
                {singlePageIndex + 1} / {totalPages}
              </span>

              <button
                disabled={singlePageIndex >= totalPages - 1}
                onClick={() => setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                className="btn btn-circle btn-ghost btn-sm disabled:opacity-20 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

        )}

      </main>

      {/* ==================== 3. FOOTER CHUYỂN CHƯƠNG ==================== */}
      <footer className="w-full max-w-xl mx-auto p-6 mt-12 flex flex-col items-center gap-4 border-t border-white/10">
        <p className="text-xs text-gray-400 text-center">
          Bạn vừa đọc xong <span className="text-white font-bold">Chap {chapter.number}</span>
        </p>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            disabled={!prevChapter}
            onClick={() => navigate(`/chapters/${prevChapter?.id}`)}
            className="btn btn-outline border-white/20 text-white hover:bg-white/10 disabled:opacity-20 rounded-xl font-bold gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            {prevChapter ? `Chap ${prevChapter.number}` : 'Hết chap trước'}
          </button>

          <button
            disabled={!nextChapter}
            onClick={() => navigate(`/chapters/${nextChapter?.id}`)}
            className="btn btn-primary shadow-lg shadow-primary/30 disabled:opacity-20 rounded-xl font-bold gap-2"
          >
            {nextChapter ? `Chap ${nextChapter.number}` : 'Hết chap sau'}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <Link
          to={manga?.id ? `/manga/${manga.id}` : '/'}
          className="text-xs text-primary hover:underline font-medium mt-2"
        >
          Quay lại danh sách chương truyện
        </Link>
      </footer>

    </div>
  );
}