import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mangaApi } from '../services/mangaApi';

// Import các Component con đã tách
import { MangaDetailSkeleton } from '../components/manga/MangaDetailSkeleton';
import { MangaDetailHeader } from '../components/manga/MangaDetailHeader';
import { MangaDescription } from '../components/manga/MangaDescription';
import { ChapterList } from '../components/manga/ChapterList';

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [chapterOrder, setChapterOrder] = useState<'desc' | 'asc'>('desc');
  const [chapterPage, setChapterPage] = useState(1);

  // 1. Fetch Truyện
  const { data: detailData, isLoading: isDetailLoading, isError } = useQuery({
    queryKey: ['mangaDetail', id],
    queryFn: () => mangaApi.getMangaDetail(id!),
    enabled: !!id,
  });

  // 2. Fetch Chapters
  const { data: chaptersData, isLoading: isChaptersLoading } = useQuery({
    queryKey: ['mangaChapters', id, chapterPage, chapterOrder],
    queryFn: () => mangaApi.getMangaChapters(id!, chapterPage, 100, chapterOrder),
    enabled: !!id,
  });

  if (isDetailLoading) return <MangaDetailSkeleton />;

  const manga = detailData?.data;
  if (isError || !manga) {
    return (
      <div className="container mx-auto p-4 text-center py-20 space-y-4">
        <h2 className="text-3xl font-extrabold text-error">Không tìm thấy bộ truyện!</h2>
        <p className="opacity-70">Truyện này không tồn tại hoặc đã bị gỡ khỏi hệ thống.</p>
        <Link to="/" className="btn btn-primary rounded-xl px-6">Quay về Trang Chủ</Link>
      </div>
    );
  }

  // Tiền xử lý Dữ liệu Chapters an toàn
  const rawChapters = (chaptersData?.data as any)?.chapters || (Array.isArray(chaptersData?.data) ? chaptersData?.data : []);
  const chapters = Array.isArray(rawChapters) ? rawChapters : [];
  const meta = chaptersData?.meta;
  const pagination = (meta as any)?.pagination || meta;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="container mx-auto p-3 sm:p-5 md:p-6 space-y-6 md:space-y-8 animate-fade-in">
      
      {/* Cụm Header Ảnh bìa & Thông tin */}
      <MangaDetailHeader
        manga={manga}
        chapters={chapters}
        chapterOrder={chapterOrder}
      />

      {/* Tóm tắt nội dung */}
      <MangaDescription
        text={manga.description}
      />

      {/* Danh sách chương + Lọc + Phân trang */}
      <ChapterList
        chapters={chapters}
        isLoading={isChaptersLoading}
        chapterOrder={chapterOrder}
        setChapterOrder={setChapterOrder}
        chapterPage={chapterPage}
        setChapterPage={setChapterPage}
        totalPages={totalPages}
        mangaId={manga.id}
      />
      
    </div>
  );
}