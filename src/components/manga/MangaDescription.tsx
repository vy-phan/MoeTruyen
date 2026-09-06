import { useState } from 'react';

export function MangaDescription({ text }: { text?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const content = text || 'Chưa có thông tin mô tả chi tiết cho bộ truyện này.';
  const isLong = content.length > 250;

  return (
    <div className="card bg-base-100 border border-base-content/10 shadow-sm p-5 sm:p-7 space-y-4 rounded-3xl">
      <h3 className="text-lg font-bold flex items-center gap-2 border-b border-base-200 pb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Tóm Tắt Nội Dung
      </h3>
      
      <div className="relative">
        <p className={`text-sm sm:text-base leading-relaxed opacity-85 whitespace-pre-line transition-all duration-300 ${!isExpanded ? 'line-clamp-4' : ''}`}>
          {content}
        </p>
        
        {/* Nút Xem thêm/Thu gọn */}
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-primary font-bold hover:underline flex items-center gap-1.5 transition-colors"
          >
            {isExpanded ? (
              <>Thu gọn <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg></>
            ) : (
              <>Xem thêm <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}