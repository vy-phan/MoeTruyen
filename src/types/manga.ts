export interface Genre {
  id: number | string;
  name: string;
  slug: string;
}

export interface Author {
  id: number | string;
  name: string;
  slug?: string;
  role?: 'author' | 'artist' | string;
}


export interface MangaRanking {
  rank?: number;
  sortBy?: string;
  time?: string;
  value?: number;
}

export interface MangaItem {
  id: number;
  slug: string;
  title: string;
  altTitles?: string[];
  description?: string;
  author?: string;
  artists?: Author[];
  authors?: Author[];
  groupName?: string;
  status: string;
  type?: string;
  
  coverUrl?: string;
  cover?: string;
  coverImage?: string;
  
  views?: number;
  rating?: number;
  genres?: Genre[];
  
  chapterCount?: number;
  totalChapters?: number;
  latestChapterNumber?: number | string;
  latestChapterNumberText?: string;
  ranking?: MangaRanking;

  latestChapter?: {
    id: number;
    chapterNumber: string | number;
    title?: string;
    updatedAt: string;
  } | null;
  
  createdAt: string;
  updatedAt: string;
}

// Kiểu dữ liệu chuẩn từ API Chapter
export interface ChapterItem {
  id: number;
  number: number | string;
  numberText?: string;
  title?: string;
  date?: string;
  pages?: number;
  groupName?: string;
  viewCount?: number;
  access?: string;
  groups?: Array<{ id: number; name: string }>;
}

export interface ChapterDetail {
  id: number;
  mangaId: number;
  mangaTitle?: string;
  mangaSlug?: string;
  number?: number | string;
  chapterNumber?: number | string;
  volumeNumber?: number | string | null;
  title?: string | null;
  language?: string;
  pagesCount?: number;
  views?: number;
  isImgx?: boolean;
  serverUrl?: string;
  pages?: string[];
  prevChapterId?: number | null;
  nextChapterId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageAccessPage {
  pageIndex: number;
  downloadUrl: string;
  storageKey: string;
  grant: {
    version: number;
    algorithm: string;
    codecVersions: [number, number];
    defaultCodecVersion: number;
    contentAlgorithm: string;
    legacyAlgorithm: string;
    imageId: string;
    issuedAt: number;
    expiresAt: number;
    nonce: string;
    keyNonce: string;
    keyHash: string;
    contentKeyHash: string;
    signature: string;
    wrappedDecodeKey: string;
    wrappedContentKey: string;
  };
}

export interface PageAccessResponse {
  grantToken: string;
  expiresAt: string | number;
  pages: PageAccessPage[];
}

export interface ChaptersApiResponse {
  manga: {
    id: number;
    slug: string;
    title: string;
  };
  chapters: ChapterItem[];
}

export interface ChapterNavInfo {
  id: number;
  number: number | string;
  numberText?: string;
  title?: string | null;
  access?: string;
}

export interface ChapterDetailData {
  manga: {
    id: number;
    slug: string;
    title: string;
  };
  chapter: {
    id: number;
    number: number | string;
    numberText?: string;
    title?: string | null;
    date?: string;
    pages?: number;
    access?: string;
    groupName?: string;
    viewCount?: number;
    isOneshot?: boolean;
  };
  pageUrls: string[];
  prevChapter?: ChapterNavInfo | null;
  nextChapter?: ChapterNavInfo | null;
}



export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}