import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mangaApi } from '../../services/mangaApi';
import { getCoverUrl } from '../../utils/getImageUrl';


type TopType = 'day' | 'week' | 'month';

export function SidebarBXH() {
  const [tab, setTab] = useState<TopType>('day');

  const { data, isLoading } = useQuery({
    queryKey: ['topManga', tab],
    queryFn: () => mangaApi.getTopManga(tab, 10),
  });

  const topList = data?.data || [];

  return (
    <aside className="card bg-base-100 border border-base-200 shadow-xs p-4 gap-4">
      <div className="flex justify-between items-center border-b border-base-200 pb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          Bảng Xếp Hạng
        </h2>
      </div>

      {/* Tabs chọn Ngày / Tuần / Tháng */}
      <div className="role-tablist tabs tabs-box grid grid-cols-3 bg-base-200 p-1 rounded-lg">
        <button
          className={`tab tab-sm font-semibold ${tab === 'day' ? 'tab-active' : ''}`}
          onClick={() => setTab('day')}
        >
          Ngày
        </button>
        <button
          className={`tab tab-sm font-semibold ${tab === 'week' ? 'tab-active' : ''}`}
          onClick={() => setTab('week')}
        >
          Tuần
        </button>
        <button
          className={`tab tab-sm font-semibold ${tab === 'month' ? 'tab-active' : ''}`}
          onClick={() => setTab('month')}
        >
          Tháng
        </button>
      </div>

      {/* Danh sách truyện BXH */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="skeleton w-12 h-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : (
          topList.map((manga, index) => {
            const rank = index + 1;
            // 🌸 Lấy URL ảnh bìa an toàn bằng getCoverUrl
            const coverSrc = getCoverUrl(manga);

            return (
              <div
                key={manga.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors group"
              >
                {/* Thứ hạng Hạng 1, 2, 3 */}
                <span
                  className={`w-7 h-7 flex items-center justify-center font-extrabold text-sm rounded-full ${
                    rank === 1
                      ? 'bg-warning text-warning-content'
                      : rank === 2
                      ? 'bg-base-300 text-base-content'
                      : rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'opacity-60'
                  }`}
                >
                  {rank}
                </span>

                {/* Ảnh nhỏ */}
                <img
                  src={coverSrc}
                  alt={manga.title}
                  className="w-11 h-14 object-cover rounded-md bg-base-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x400?text=No+Cover';
                  }}
                />

                {/* Tên & Lượt xem */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                    <Link to={`/manga/${manga.id}`}>{manga.title}</Link>
                  </h4>
                  <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
                    👁️ {(manga.ranking?.value || manga.views || 0).toLocaleString()} lượt xem
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}