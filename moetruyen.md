# MoeTruyen / SuicaoDex REST API Specification (v2)

> **Base URL:** `https://moe.suicaodex.com`  
> **Phiên bản hiện tại:** `v2` (Phiên bản `v1` cũ đã bị loại bỏ hoàn toàn)  
> **Giao thức:** HTTPS / JSON REST API  

---

## 1. Tổng quan & Ghi chú kỹ thuật (Request Notes)

### 1.1. Headers & Format
- **Content-Type:** `application/json` (cho các request `POST`)
- **Accept:** `application/json`
- Mọi dữ liệu trả về đều tuân thủ chuẩn JSON. Các trường timestamp sử dụng định dạng ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`) hoặc chuỗi số Unix timestamp tùy trường hợp.

### 1.2. CORS & Rate Limiting
- **CORS:** API kiểm tra và chỉ cho phép các Origin hợp lệ cấu hình tại hệ thống.
- **Rate Limit:** Áp dụng Global Rate Limiting trên từng IP để tránh spam / crawl quá tải. Khi bị chặn, mã phản hồi trả về là `429 Too Many Requests`.

### 1.3. Cơ chế ảnh & IMGX Page Access (Bảo vệ hình ảnh)
- Ảnh bìa (Cover) và ảnh chương (Chapter pages) thông thường được load trực tiếp từ CDN (`COVER_BASE_URL`, `CHAPTER_CDN_BASE_URL`).
- Với các chương truyện sử dụng cơ chế bảo vệ **IMGX**, hệ thống yêu cầu client gửi request tới `POST /v2/chapters/{id}/page-access` để nhận **token/grant ngắn hạn (short-lived access token/session HMAC)** trước khi có thể hiển thị danh sách trang hoặc tải URL ảnh.

---

## 2. TypeScript Data Types & Schemas

```typescript
// ==================== CÁC KIỂU DỮ LIỆU CƠ BẢN ====================

export type MangaStatus = 'ongoing' | 'completed' | 'cancelled' | 'hiatus' | string;
export type MangaType = 'manga' | 'manhwa' | 'manhua' | 'novel' | 'doujinshi' | string;
export type SortOrder = 'asc' | 'desc';
export type MangaSortField = 'updatedAt' | 'createdAt' | 'views' | 'rating' | 'title' | 'latestChapter';

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

export interface Genre {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Author {
  id: number | string;
  name: string;
  slug?: string;
  role?: 'author' | 'artist' | string;
}

export interface MangaItem {
  id: number;
  slug: string;
  title: string;
  altTitles?: string[];
  description?: string;
  coverImage: string;
  thumbnailUrl?: string;
  status: MangaStatus;
  type?: MangaType;
  views?: number;
  rating?: number;
  genres: Genre[];
  authors?: Author[];
  artists?: Author[];
  latestChapter?: {
    id: number;
    chapterNumber: string | number;
    title?: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface MangaDetail extends MangaItem {
  totalChapters?: number;
  follows?: number;
  recommendations?: MangaItem[];
}

export interface ChapterItem {
  id: number;
  mangaId: number;
  chapterNumber: string | number;
  volumeNumber?: string | number | null;
  title?: string | null;
  language?: string;
  pagesCount?: number;
  views?: number;
  isImgx?: boolean; // Nếu true cần cấp quyền qua POST /v2/chapters/:id/page-access
  createdAt: string;
  updatedAt: string;
}

export interface ChapterDetail extends ChapterItem {
  pages: string[]; // Danh sách link CDN ảnh hoặc filename
  serverUrl?: string;
  nextChapterId?: number | null;
  prevChapterId?: number | null;
}

// Kiểu trả về cấu trúc Aggregate (nhóm Volume -> Chapter)
export interface AggregateChapter {
  id: number;
  chapter: string | number;
  title?: string;
  count?: number;
  isImgx?: boolean;
}

export interface AggregateVolume {
  volume: string | number;
  chapters: Record<string, AggregateChapter> | AggregateChapter[];
}

export interface AggregateResponse {
  volumes: Record<string, AggregateVolume>;
}

// Cấp quyền IMGX
export interface PageAccessRequest {
  sessionToken?: string;
}

export interface PageAccessResponse {
  grantToken: string;
  expiresAt: string | number;
  pages: string[];
}
```

---

## 3. Chi tiết các Endpoints

### 3.1. System & Health

#### `GET /health`
- **Mục đích:** Kiểm tra trạng thái hoạt động của Backend & Database.
- **Request:** Không yêu cầu query param.
- **Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-08-18T13:25:00.000Z",
  "database": "connected"
}
```

---

### 3.2. Thể loại (Genres)

#### `GET /v2/genres`
- **Mục đích:** Lấy toàn bộ danh sách thể loại / tag của truyện.
- **Request Parameters:** Không có.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Action",
      "slug": "action",
      "description": "Thể loại hành động, kịch tính"
    },
    {
      "id": 2,
      "name": "Romance",
      "slug": "romance",
      "description": "Tình cảm, lãng mạn"
    }
  ]
}
```

---

### 3.3. Truyện tranh (Manga Endpoints)

#### `GET /v2/manga`
- **Mục đích:** Lấy danh sách truyện có phân trang, lọc theo thể loại, trạng thái và sắp xếp.
- **Query Parameters:**
  | Tên Param | Type | Bắt buộc | Mặc định | Mô tả |
  | :--- | :--- | :--- | :--- | :--- |
  | `page` | `integer` | Không | `1` | Trang hiện tại (bắt đầu từ 1) |
  | `limit` | `integer` | Không | `20` | Số lượng phần tử mỗi trang (Max: 100) |
  | `genres` | `string` | Không | - | Danh sách genre ID hoặc slug, phân tách bằng dấu phẩy (vd: `1,2,5`) |
  | `status` | `string` | Không | - | `ongoing`, `completed`, `hiatus`, `cancelled` |
  | `sort` | `string` | Không | `updatedAt` | `updatedAt`, `createdAt`, `views`, `rating`, `title` |
  | `order` | `string` | Không | `desc` | Thứ tự sắp xếp: `asc` hoặc `desc` |
  | `type` | `string` | Không | - | Phân loại truyện: `manga`, `manhwa`, `manhua`,... |

- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "slug": "sousou-no-frieren",
      "title": "Sousou no Frieren",
      "altTitles": ["Frieren: Beyond Journey's End"],
      "description": "Câu chuyện diễn ra sau khi nhóm anh hùng đánh bại Quỷ Vương...",
      "coverImage": "https://moe.suicaodex.com/covers/101.jpg",
      "status": "ongoing",
      "type": "manga",
      "views": 250000,
      "rating": 9.8,
      "genres": [
        { "id": 1, "name": "Adventure", "slug": "adventure" },
        { "id": 4, "name": "Fantasy", "slug": "fantasy" }
      ],
      "latestChapter": {
        "id": 5521,
        "chapterNumber": "130",
        "title": "Manga Chapter 130",
        "updatedAt": "2026-08-18T10:00:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2026-08-18T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1250,
    "page": 1,
    "limit": 20,
    "totalPages": 63,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### `GET /v2/manga/top`
- **Mục đích:** Lấy danh sách các bộ truyện nổi bật, thịnh hành hoặc có lượt xem cao nhất.
- **Query Parameters:**
  | Tên Param | Type | Bắt buộc | Mặc định | Mô tả |
  | :--- | :--- | :--- | :--- | :--- |
  | `type` | `string` | Không | `all` | `all`, `day`, `week`, `month`, `views`, `rating` |
  | `limit` | `integer` | Không | `10` | Số lượng truyện cần lấy (mặc định 10) |

- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "slug": "sousou-no-frieren",
      "title": "Sousou no Frieren",
      "coverImage": "https://moe.suicaodex.com/covers/101.jpg",
      "views": 520000,
      "rating": 9.8,
      "genres": []
    }
  ]
}
```

---

#### `GET /v2/manga/random`
- **Mục đích:** Trả về ngẫu nhiên 1 hoặc nhiều bộ truyện (dành cho tính năng "Khám phá ngẫu nhiên").
- **Query Parameters:**
  | Tên Param | Type | Bắt buộc | Mặc định | Mô tả |
  | :--- | :--- | :--- | :--- | :--- |
  | `limit` | `integer` | Không | `1` | Số lượng truyện ngẫu nhiên cần lấy |

- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 88,
      "slug": "bocchi-the-rock",
      "title": "Bocchi the Rock!",
      "coverImage": "https://moe.suicaodex.com/covers/88.jpg",
      "status": "ongoing",
      "genres": []
    }
  ]
}
```

---

#### `GET /v2/manga/{id}`
- **Mục đích:** Lấy thông tin chi tiết của một bộ truyện theo ID hoặc Slug.
- **Path Parameters:**
  - `id` (`integer` hoặc `string`): ID của manga.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "slug": "sousou-no-frieren",
    "title": "Sousou no Frieren",
    "altTitles": ["Frieren at the Funeral", "葬送のフリーレン"],
    "description": "Chi tiết cốt truyện của Sousou no Frieren...",
    "coverImage": "https://moe.suicaodex.com/covers/101.jpg",
    "status": "ongoing",
    "type": "manga",
    "views": 250000,
    "rating": 9.8,
    "totalChapters": 135,
    "authors": [{ "id": 12, "name": "Yamada Kanehito", "role": "author" }],
    "artists": [{ "id": 13, "name": "Abe Tsukasa", "role": "artist" }],
    "genres": [
      { "id": 1, "name": "Adventure", "slug": "adventure" },
      { "id": 4, "name": "Fantasy", "slug": "fantasy" }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2026-08-18T10:00:00.000Z"
  }
}
```

---

#### `GET /v2/manga/{id}/recommendations`
- **Mục đích:** Lấy danh sách truyện gợi ý tương tự dựa trên bộ truyện hiện tại.
- **Path Parameters:**
  - `id` (`integer`): ID của manga.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 204,
      "slug": "dungeon-meshi",
      "title": "Dungeon Meshi",
      "coverImage": "https://moe.suicaodex.com/covers/204.jpg",
      "status": "completed",
      "genres": []
    }
  ]
}
```

---

#### `GET /v2/manga/{id}/chapters`
- **Mục đích:** Lấy danh sách chương của bộ truyện (hỗ trợ phân trang và sắp xếp).
- **Path Parameters:**
  - `id` (`integer`): ID của manga.
- **Query Parameters:**
  | Tên Param | Type | Bắt buộc | Mặc định | Mô tả |
  | :--- | :--- | :--- | :--- | :--- |
  | `page` | `integer` | Không | `1` | Trang hiện tại |
  | `limit` | `integer` | Không | `100` | Số lượng chapter mỗi trang |
  | `order` | `string` | Không | `desc` | Thứ tự chương: `asc` hoặc `desc` |
  | `lang` | `string` | Không | `vi` | Lọc theo mã ngôn ngữ (vd: `vi`, `en`) |

- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5521,
      "mangaId": 101,
      "chapterNumber": "130",
      "volumeNumber": "12",
      "title": "Vùng đất phía Bắc",
      "language": "vi",
      "pagesCount": 18,
      "isImgx": false,
      "createdAt": "2026-08-18T10:00:00.000Z",
      "updatedAt": "2026-08-18T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 130,
    "page": 1,
    "limit": 100,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### `GET /v2/manga/{id}/chapters/aggregate`
- **Mục đích:** Trả về cấu trúc cây phân nhóm theo Tập (Volume) và Chương (Chapter) để vẽ mục lục / bảng chọn chương nhanh.
- **Path Parameters:**
  - `id` (`integer`): ID của manga.
- **Query Parameters:**
  - `lang` (`string`, tùy chọn): Ngôn ngữ lọc (mặc định `vi`).
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "volumes": {
      "1": {
        "volume": "1",
        "chapters": {
          "1": { "id": 1001, "chapter": "1", "title": "Khởi đầu", "isImgx": false },
          "2": { "id": 1002, "chapter": "2", "title": "Hành trình", "isImgx": false }
        }
      },
      "none": {
        "volume": "none",
        "chapters": {
          "130": { "id": 5521, "chapter": "130", "title": "Mới nhất", "isImgx": true }
        }
      }
    }
  }
}
```

---

### 3.4. Chapters & IMGX Access

#### `GET /v2/chapters/{id}`
- **Mục đích:** Lấy thông tin chi tiết của 1 chapter cụ thể bao gồm danh sách các URL ảnh hoặc filenames để đọc truyện.
- **Path Parameters:**
  - `id` (`integer`): ID của chapter.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 5521,
    "mangaId": 101,
    "chapterNumber": "130",
    "volumeNumber": "12",
    "title": "Vùng đất phía Bắc",
    "pagesCount": 3,
    "isImgx": false,
    "serverUrl": "https://cdn.suicaodex.com/data/chapter-5521",
    "pages": [
      "https://cdn.suicaodex.com/data/chapter-5521/01.jpg",
      "https://cdn.suicaodex.com/data/chapter-5521/02.jpg",
      "https://cdn.suicaodex.com/data/chapter-5521/03.jpg"
    ],
    "prevChapterId": 5520,
    "nextChapterId": null,
    "createdAt": "2026-08-18T10:00:00.000Z"
  }
}
```

---

#### `POST /v2/chapters/{id}/page-access`
- **Mục đích:** Cấp token quyền truy cập tạm thời (Grant Token) để đọc danh sách các trang ảnh được bảo vệ bằng hệ thống IMGX.
- **Path Parameters:**
  - `id` (`integer`): ID của chapter.
- **Request Body (JSON):**
```json
{
  "sessionToken": "optional_session_identifier_or_token"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "grantToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": 1787050000000,
    "pages": [
      "https://imgx.suicaodex.com/render/5521/01.webp?token=...",
      "https://imgx.suicaodex.com/render/5521/02.webp?token=...",
      "https://imgx.suicaodex.com/render/5521/03.webp?token=..."
    ]
  }
}
```

---

### 3.5. Tìm kiếm (Search)

#### `GET /v2/search/manga`
- **Mục đích:** Tìm kiếm manga nâng cao theo từ khóa (query), lọc thể loại, trạng thái, tác giả.
- **Query Parameters:**
  | Tên Param | Type | Bắt buộc | Mặc định | Mô tả |
  | :--- | :--- | :--- | :--- | :--- |
  | `q` / `query` | `string` | Có | - | Từ khóa tìm kiếm (tên truyện, tên phụ) |
  | `genres` | `string` | Không | - | ID thể loại lọc (vd: `1,2`) |
  | `excludedGenres` | `string` | Không | - | ID thể loại cần loại trừ (vd: `18,20`) |
  | `status` | `string` | Không | - | `ongoing`, `completed`,... |
  | `page` | `integer` | Không | `1` | Số trang |
  | `limit` | `integer` | Không | `20` | Số kết quả trả về |
  | `sort` | `string` | Không | `relevance` | `relevance`, `updatedAt`, `views`, `rating` |

- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "slug": "sousou-no-frieren",
      "title": "Sousou no Frieren",
      "coverImage": "https://moe.suicaodex.com/covers/101.jpg",
      "status": "ongoing",
      "rating": 9.8,
      "genres": [
        { "id": 1, "name": "Adventure", "slug": "adventure" }
      ]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## 4. Xử lý mã lỗi HTTP (Error Handling)

| HTTP Code | Ý nghĩa | Cách xử lý gợi ý |
| :--- | :--- | :--- |
| `200 OK` | Thành công | Trích xuất trường `data` và `meta` |
| `400 Bad Request` | Tham số không hợp lệ hoặc thiếu | Kiểm tra kiểu dữ liệu của query/body |
| `404 Not Found` | Không tìm thấy manga / chapter | Điều hướng về trang 404 hoặc thông báo không tồn tại |
| `429 Too Many Requests`| Bị giới hạn tần suất request (Rate Limit) | Áp dụng cơ chế Exponential Backoff / Thử lại sau |
| `500 Internal Error` | Lỗi máy chủ Backend | Báo lỗi hệ thống đang bảo trì |

---

## 5. Mẫu Client Service (TypeScript / Fetch)

```typescript
export class MoeTruyenClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://moe.suicaodex.com') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API Error [${res.status}]: ${errorBody}`);
    }

    return res.json();
  }

  // 1. Genres
  getGenres() {
    return this.request<Genre[]>('/v2/genres');
  }

  // 2. Manga List
  getMangaList(params?: {
    page?: number;
    limit?: number;
    genres?: string;
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<MangaItem[]>(`/v2/manga${query ? `?${query}` : ''}`);
  }

  // 3. Manga Detail
  getMangaDetail(id: number | string) {
    return this.request<MangaDetail>(`/v2/manga/${id}`);
  }

  // 4. Manga Aggregate Chapters
  getMangaAggregate(id: number | string, lang: string = 'vi') {
    return this.request<AggregateResponse>(`/v2/manga/${id}/chapters/aggregate?lang=${lang}`);
  }

  // 5. Chapter Detail
  getChapter(id: number | string) {
    return this.request<ChapterDetail>(`/v2/chapters/${id}`);
  }

  // 6. IMGX Page Access
  getChapterPageAccess(id: number | string, sessionToken?: string) {
    return this.request<PageAccessResponse>(`/v2/chapters/${id}/page-access`, {
      method: 'POST',
      body: JSON.stringify({ sessionToken }),
    });
  }

  // 7. Search Manga
  searchManga(query: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ q: query, page: page.toString(), limit: limit.toString() });
    return this.request<MangaItem[]>(`/v2/search/manga?${params.toString()}`);
  }
}
```
