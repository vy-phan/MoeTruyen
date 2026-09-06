import axios from "axios";
import type {
  ApiResponse,
  MangaItem,
  ChaptersApiResponse,
  ChapterDetailData, // 🌸 Sử dụng ChapterDetailData ở đây
  PageAccessResponse,
} from "../types/manga";

const BASE_URL = "/api";

export const mangaApi = {
  // 1. Lấy danh sách truyện mới
  getLatestManga: async (
    page = 1,
    limit = 16,
  ): Promise<ApiResponse<MangaItem[]>> => {
    const response = await axios.get(`${BASE_URL}/v2/manga`, {
      params: { page, limit },
    });
    return response.data;
  },

  // 2. Lấy BXH
  getTopManga: async (
    type: "day" | "week" | "month" | "views" = "day",
    limit = 10,
  ): Promise<ApiResponse<MangaItem[]>> => {
    const response = await axios.get(`${BASE_URL}/v2/manga/top`, {
      params: { type, limit },
    });
    return response.data;
  },

  // 3. Lấy Banner
  getBannerManga: async (limit = 5): Promise<ApiResponse<MangaItem[]>> => {
    const response = await axios.get(`${BASE_URL}/v2/manga/random`, {
      params: { limit },
    });
    return response.data;
  },

  // 4. Lấy chi tiết truyện
  getMangaDetail: async (
    id: string | number,
  ): Promise<ApiResponse<MangaItem>> => {
    const response = await axios.get(`${BASE_URL}/v2/manga/${id}`);
    return response.data;
  },

  // 5. Lấy danh sách Chapter
  getMangaChapters: async (
    id: string | number,
    page = 1,
    limit = 100,
    order: "asc" | "desc" = "desc",
  ): Promise<ApiResponse<ChaptersApiResponse>> => {
    const response = await axios.get(`${BASE_URL}/v2/manga/${id}/chapters`, {
      params: { page, limit, order },
    });
    return response.data;
  },

  // 🌸 6. LẤY CHI TIẾT NỘI DUNG CHAPTER (SỬA THÀNH ChapterDetailData)
  getChapterDetail: async (
    id: string | number,
  ): Promise<ApiResponse<ChapterDetailData>> => {
    const response = await axios.get(`${BASE_URL}/v2/chapters/${id}`);
    return response.data;
  },

// 🌸 7. Cấp quyền giải mã ảnh IMGX
  getChapterPageAccess: async (
    id: string | number,
    pageIndexes: number[] = [], // BẮT BUỘC: Thêm tham số pageIndexes vào đây
    sessionToken?: string,
  ): Promise<ApiResponse<PageAccessResponse>> => {
    const response = await axios.post(
      `${BASE_URL}/v2/chapters/${id}/page-access`,
      {
        pageIndexes: pageIndexes, // BẮT BUỘC: Truyền pageIndexes vào body
        sessionToken: sessionToken
      }
    );
    return response.data;
  },

  // 🌸 8. Tìm kiếm manga nâng cao
  searchManga: async (
    query: string,
    options?: {
      genres?: string;
      excludedGenres?: string;
      status?: string;
      page?: number;
      limit?: number;
      sort?: 'relevance' | 'updatedAt' | 'views' | 'rating';
    }
  ): Promise<ApiResponse<MangaItem[]>> => {
    const params: any = {
      q: query,
      page: options?.page || 1,
      limit: options?.limit || 20,
      sort: options?.sort || 'relevance',
    };

    if (options?.genres) params.genres = options.genres;
    if (options?.excludedGenres) params.excludedGenres = options.excludedGenres;
    if (options?.status) params.status = options.status;

    const response = await axios.get(`${BASE_URL}/v2/search/manga`, { params });
    return response.data;
  },
};
