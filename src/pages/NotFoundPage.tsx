import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto p-4 text-center py-20 space-y-4">
      <h1 className="text-6xl font-extrabold text-error">404</h1>
      <h2 className="text-2xl font-semibold">Không tìm thấy trang</h2>
      <p className="opacity-70">Đường dẫn bạn truy cập không tồn tại hoặc đã bị đổi.</p>
      <Link to="/" className="btn btn-primary mt-4">
        Quay lại trang chủ
      </Link>
    </div>
  );
}