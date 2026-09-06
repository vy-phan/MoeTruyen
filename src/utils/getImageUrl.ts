import type { MangaItem } from "../types/manga";


// Hàm hỗ trợ lấy URL ảnh bìa an toàn tuyệt đối
export const getCoverUrl = (manga?: MangaItem | string | null): string => {
  if (!manga) return 'https://placehold.co/300x400?text=No+Cover';

  // Trường hợp người dùng truyền vào 1 chuỗi string URL
  if (typeof manga === 'string') {
    if (manga.startsWith('http')) return manga;
    return `https://moe.suicaodex.com${manga}`;
  }

  // Trường hợp truyền vào đối tượng MangaItem
  if (manga.coverUrl) return manga.coverUrl;
  if (manga.coverImage) return manga.coverImage;
  if (manga.cover) {
    if (manga.cover.startsWith('http')) return manga.cover;
    return `https://moe.suicaodex.com${manga.cover}`;
  }

  return 'https://placehold.co/300x400?text=No+Cover';
};