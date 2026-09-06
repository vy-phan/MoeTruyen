import { useEffect, useState } from 'react';

interface ReaderImageProps {
  src?: string | null; // undefined/null = ảnh đang chờ giải mã, chưa sẵn sàng
  pageIndex: number;
  alt: string;
}

export function ReaderImage({ src, pageIndex, alt }: ReaderImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // 🌸 QUAN TRỌNG: reset trạng thái mỗi khi src thay đổi
  // (kể cả khi src đổi từ "chưa có" -> URL blob thật sau khi giải mã xong)
  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
  }, [src]);

  const handleRetry = () => {
    setIsLoading(true);
    setIsError(false);
  };

  const isPending = !src; // chưa có URL để hiển thị (đang giải mã)

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[350px] sm:min-h-[600px] bg-neutral-950 select-none border-b border-white/5">

      {/* Loading: hiện khi đang chờ giải mã HOẶC ảnh đang load, và chưa lỗi */}
      {(isPending || isLoading) && !isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 animate-pulse z-10">
          <div className="loading loading-spinner loading-md text-primary" />
          <span className="text-xs font-semibold text-gray-400">
            {isPending
              ? `Đang giải mã trang ${pageIndex + 1}...`
              : `Đang tải trang ${pageIndex + 1}...`}
          </span>
        </div>
      )}

      {isError ? (
        <div className="flex flex-col items-center justify-center gap-3 p-8 bg-neutral-900 rounded-2xl border border-error/20 my-8">
          <span className="text-xs text-error font-medium">Không thể tải trang {pageIndex + 1}</span>
          <button
            onClick={handleRetry}
            className="btn btn-xs btn-outline btn-error gap-1 rounded-lg"
          >
            Tải lại
          </button>
        </div>
      ) : (
        // Chỉ render <img> khi đã có src thật — không đưa URL rác vào DOM
        !isPending && (
          <img
            src={src as string}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`w-full h-auto object-contain block transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setIsError(true);
            }}
          />
        )
      )}

      <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-white/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
        {pageIndex + 1}
      </span>
    </div>
  );
}