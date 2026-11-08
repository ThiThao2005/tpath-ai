/**
 * Các bước sử dụng ITPath AI theo đúng thứ tự.
 * Dùng chung cho thanh menu (AppNav) và trang chủ.
 */
export type NavStep = {
  href: string
  step: number
  label: string      // tên ngắn trên menu
  title: string      // tên trên trang chủ
  desc: string       // trang này dùng để làm gì
}

export const NAV_STEPS: NavStep[] = [
  {
    href: "/quiz", step: 1, label: "Quiz", title: "Làm Quiz kỹ năng",
    desc: "15 câu hỏi để biết bạn mạnh Frontend, Backend hay AI.",
  },
  {
    href: "/roadmap", step: 2, label: "Lộ trình", title: "Lộ trình học",
    desc: "Các bước cần học, tick hoàn thành và xem tiến độ.",
  },
  {
    href: "/projects", step: 3, label: "Gợi ý dự án", title: "AI gợi ý dự án",
    desc: "Gemini đề xuất 5 dự án hợp với kỹ năng của bạn.",
  },
  {
    href: "/dashboard", step: 4, label: "Dashboard", title: "Quản lý dự án",
    desc: "Xem chỉ số kỹ năng; thêm, sửa, xóa dự án đã làm.",
  },
  {
    href: "/portfolio", step: 5, label: "Portfolio", title: "Hồ sơ phỏng vấn",
    desc: "Dự án trình bày theo STAR, thống kê, in PDF để ứng tuyển.",
  },
]
