export const formatRelativeTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);

  if (diff < 60) return 'Vừa xong';
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
}

/**
 * Dịch trạng thái truyện từ Tiếng Anh sang Tiếng Việt + Trả về class màu Badge DaisyUI
 */
export const formatStatus = (status?: string): { label: string; colorClass: string } => {
  if (!status) return { label: 'Đang tiến hành', colorClass: 'badge-info' };

  const s = status.toLowerCase();
  switch (s) {
    case 'ongoing':
      return { label: 'Đang tiến hành', colorClass: 'badge-info' };
    case 'completed':
    case 'complete':
      return { label: 'Hoàn thành', colorClass: 'badge-success' };
    case 'hiatus':
      return { label: 'Tạm ngưng', colorClass: 'badge-warning' };
    case 'cancelled':
      return { label: 'Đã hủy', colorClass: 'badge-error' };
    default:
      return { label: status, colorClass: 'badge-ghost' };
  }
};

/**
 * Tính thời gian cập nhật tương đối (VD: 15 phút trước, 2 giờ trước, 3 ngày trước)
 */
export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'Vừa xong';

  if (diffInSeconds < 60) return 'Vừa xong';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
};