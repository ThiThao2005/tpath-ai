-- ============================================================
-- ITPath AI - Thông tin phỏng vấn (STAR) cho các dự án portfolio
-- Chạy file này trong Supabase Dashboard → SQL Editor.
-- Có thể chạy lại nhiều lần (chỉ thêm cột nếu chưa có và ghi đè nội dung details).
--
-- Phần 1 (bắt buộc): thêm cột details.
-- Phần 2: điền sẵn nội dung cho 6 dự án của @nguyenthithao5002
--         (khớp theo id dự án + username, không đụng vào dự án của người khác).
-- ============================================================

-- ---------- Phần 1: cột details ----------
alter table public.portfolio_projects add column if not exists details jsonb;


-- ---------- Phần 2: nội dung từng dự án ----------

-- 1. ITPath AI
update public.portfolio_projects
set details = $json$
{
  "pitch": "ITPath AI giúp sinh viên IT biết mình hợp hướng nào: làm quiz 15 câu để đo mức Frontend / Backend / AI, nhận lộ trình học có theo dõi tiến độ, được AI (Google Gemini) gợi ý dự án phù hợp và gom tất cả dự án thành một hồ sơ công khai để gửi nhà tuyển dụng.",
  "role": "Làm cá nhân – Fullstack (thiết kế DB, API, giao diện, deploy)",
  "period": "",
  "stack": ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Google Gemini", "Vercel"],
  "context": "Sinh viên năm đầu thường không biết nên theo Frontend, Backend hay AI, học lan man và không có chỗ gom dự án lại khi đi xin việc. Mục tiêu: một ứng dụng gói gọn cả hành trình Đánh giá → Lộ trình → Dự án → Portfolio.",
  "actions": [
    "Thiết kế luồng: Đăng ký → Quiz → Dashboard → Roadmap → Gợi ý dự án → Portfolio → hồ sơ công khai /u/username",
    "Viết quiz 15 câu, quy đổi điểm Frontend / Backend / AI ra phần trăm và hiển thị thành biểu đồ kỹ năng trên Dashboard",
    "API route /api/recommend-projects gọi Gemini với responseSchema để luôn nhận về JSON đúng cấu trúc (tên, mô tả, độ khó, công nghệ, lý do phù hợp)",
    "Roadmap học theo từng bước, đánh dấu hoàn thành và theo dõi tiến độ",
    "Dashboard thêm / sửa / xóa / lọc dự án theo mảng; trang Portfolio trình bày theo khung STAR; trang /u/username render phía server",
    "Đăng nhập Email và Google bằng Supabase Auth; chặn trang cần đăng nhập bằng route group (protected) + component RequireAuth"
  ],
  "challenges": [
    { "problem": "API tạo roadmap nhận userId do trình duyệt gửi lên → ai cũng có thể ghi roadmap vào tài khoản người khác", "solution": "Server tự lấy user từ access token của Supabase gửi kèm request, bỏ hẳn userId phía client" },
    { "problem": "Các bảng dữ liệu không giới hạn quyền, người dùng có thể đọc/sửa dữ liệu của nhau", "solution": "Viết supabase/rls.sql bật Row Level Security cho 4 bảng: chỉ chủ sở hữu được ghi; profiles và portfolio đọc công khai để trang hồ sơ hoạt động" },
    { "problem": "Một người làm quiz nhiều lần bị lưu trùng nhiều dòng, Dashboard đọc sai điểm", "solution": "Dọn dữ liệu trùng, thêm ràng buộc unique(user_id) và chuyển sang upsert – mỗi người chỉ có 1 kết quả" }
  ],
  "results": [
    "Chạy online trên Vercel: ipath-ai.vercel.app",
    "Đủ luồng từ đánh giá kỹ năng tới hồ sơ công khai; 2 API route có xác thực; phân quyền bằng RLS trên 4 bảng",
    "Link /u/username dùng để đính kèm vào CV khi ứng tuyển"
  ],
  "questions": [
    { "q": "Vì sao dùng Supabase thay vì tự viết backend?", "a": "Dự án cá nhân cần Auth (Email + Google) và PostgreSQL nhanh; Supabase có sẵn cả hai, còn quyền truy cập thì kiểm soát bằng RLS ngay trong database nên vẫn an toàn." },
    { "q": "Làm sao chắc chắn người dùng không sửa dữ liệu của người khác?", "a": "Có 2 lớp: API route xác thực access token để biết user thật là ai, và RLS trong Postgres chặn mọi câu lệnh có user_id khác auth.uid()." },
    { "q": "Làm sao để AI trả về dữ liệu dùng được trong code?", "a": "Khai báo responseSchema và responseMimeType application/json khi gọi Gemini, nên kết quả luôn là JSON đúng các trường cần thiết; lỗi thì API trả mã 500 kèm thông báo để người dùng thử lại." },
    { "q": "Nếu làm lại, bạn sẽ cải thiện gì?", "a": "Cho AI tạo roadmap theo đúng điểm quiz của từng người thay vì danh sách bước cố định, và viết test cho phần tính điểm quiz." }
  ]
}
$json$::jsonb
where id = '59cd6a59-38a9-45ab-92fa-4797b39c2ec9'
  and user_id = (select id from public.profiles where username = 'nguyenthithao5002');


-- 2. Thế Giới Điện Thoại (PHP MVC)
update public.portfolio_projects
set details = $json$
{
  "pitch": "Website thương mại điện tử bán điện thoại, laptop, phụ kiện viết bằng PHP thuần theo mô hình MVC tự dựng: khách lọc, so sánh, thêm giỏ, dùng voucher, đặt và theo dõi đơn; admin quản lý sản phẩm, danh mục, đơn hàng và người dùng.",
  "role": "Làm cá nhân – Fullstack PHP",
  "period": "",
  "stack": ["PHP", "MVC", "MySQL / MariaDB", "PDO", "Docker Compose", "Google Sign-In", "InfinityFree"],
  "context": "Cửa hàng cần bán online đầy đủ quy trình từ xem hàng tới xử lý đơn. Mục tiêu cá nhân: hiểu framework làm gì bên dưới, nên tự viết router, controller, model, view thay vì dùng Laravel.",
  "actions": [
    "Tự dựng MVC: .htaccess đưa mọi request vào index.php, router tách /Controller/action/id rồi gọi đúng controller",
    "Phía khách: lọc theo hãng / giá, chi tiết sản phẩm, đánh giá, hỏi đáp, yêu thích, so sánh, giỏ hàng, voucher, đặt hàng, xem và hủy đơn",
    "Tài khoản: đăng ký có xác thực email, đăng nhập Google, ghi nhớ đăng nhập, quên / đổi mật khẩu",
    "Trang admin: dashboard, CRUD sản phẩm có upload ảnh, danh mục, cập nhật trạng thái đơn, khóa / mở khóa và phân quyền người dùng",
    "Đóng gói Docker Compose (PHP + MariaDB + phpMyAdmin) để chạy bằng 1 lệnh; deploy lên InfinityFree"
  ],
  "challenges": [
    { "problem": "Nhiều form tìm kiếm, lọc, đăng nhập dễ bị SQL Injection", "solution": "Toàn bộ truy vấn dùng PDO prepared statement (hơn 80 câu prepare), không nối chuỗi SQL" },
    { "problem": "Đặt hàng gồm nhiều bước ghi (orders + order_details), lỗi giữa chừng sẽ để lại đơn dở dang", "solution": "Bọc cả quá trình trong transaction của PDO, lỗi thì rollback" },
    { "problem": "Mật khẩu phải lưu an toàn", "solution": "Dùng password_hash / password_verify; tài khoản mới phải xác thực email bằng token" },
    { "problem": "File SQL export từ MySQL 8 lỗi collation utf8mb4_0900_ai_ci khi import lên hosting", "solution": "Đổi môi trường local sang MariaDB giống hosting; tách cấu hình DB ra db.local.php (không commit) và biến môi trường cho Docker" }
  ],
  "results": [
    "Chạy online: thegioidienthoai-mvc.infinityfreeapp.com",
    "5 bảng dữ liệu (account, category, product, orders, order_details), hơn 60 action trong 2 controller chính",
    "Chỉ cần docker compose up là có đủ web + database + phpMyAdmin để chạy thử"
  ],
  "questions": [
    { "q": "Vì sao không dùng Laravel?", "a": "Muốn hiểu rõ một request đi qua router → controller → model → view thế nào. Làm xong dự án này, học Laravel nhanh hơn vì đã biết framework giải quyết những vấn đề gì." },
    { "q": "Giỏ hàng được lưu ở đâu?", "a": "Lưu trong session phía server ($_SESSION['cart']); khi khách đặt hàng mới ghi vào bảng orders và order_details trong một transaction." },
    { "q": "Tự viết MVC có nhược điểm gì?", "a": "Phải tự lo những thứ framework có sẵn như routing, validate, CSRF, migration; code dễ lặp. Bù lại hiểu rất rõ cách web PHP hoạt động." }
  ]
}
$json$::jsonb
where id = '328f634c-8b24-42c4-995c-b9f46624641c'
  and user_id = (select id from public.profiles where username = 'nguyenthithao5002');


-- 3. Hoa Mai Coffee – Quản lý quán cafe
update public.portfolio_projects
set details = $json$
{
  "pitch": "Hệ thống gọi món bằng mã QR cho quán cafe: khách quét mã trên bàn để xem menu và đặt món ngay trên điện thoại, đơn hiện tức thì ở màn hình pha chế; chủ quán có trang admin quản lý menu, bàn, đơn hàng và xem doanh thu.",
  "role": "Làm cá nhân – Fullstack (React + Supabase)",
  "period": "",
  "stack": ["React", "Vite", "Tailwind CSS", "Supabase", "PostgreSQL", "Supabase Realtime", "Recharts", "Vercel"],
  "context": "Quán nhỏ ghi order bằng giấy, giờ cao điểm dễ nhầm bàn, nhầm món và tốn người chạy order. Mục tiêu: khách tự gọi món theo bàn, quầy pha chế nhận đơn ngay lập tức, chủ quán xem được doanh thu.",
  "actions": [
    "Mỗi bàn có mã QR riêng (link ?table=07), admin tạo và in QR ngay trên web; số bàn được giữ suốt phiên khi khách chuyển qua menu, thanh toán",
    "Menu có tùy chọn size, đá, đường, topping và ghi chú; giỏ hàng dùng React Context",
    "Màn hình pha chế (Barista) và quản lý đơn cập nhật realtime bằng Supabase Realtime, không cần tải lại trang",
    "Trang admin gồm các tab Tổng quan (biểu đồ doanh thu bằng Recharts), Đơn hàng, Menu, Bàn, Pha chế",
    "Phân quyền admin / staff bằng bảng staff_roles kết hợp ProtectedRoute ở phía giao diện"
  ],
  "challenges": [
    { "problem": "Khách có thể sửa giá trong request để đặt món rẻ hơn", "solution": "Không cho khách ghi thẳng vào bảng orders; đơn chỉ được tạo qua hàm Postgres place_order (security definer) tự lấy giá thật từ bảng products và kiểm tra món còn bán" },
    { "problem": "Policy cũ 'cho phép tất cả' khiến ai cũng đọc / sửa được đơn hàng", "solution": "Viết lại security.sql: xóa policy cũ, chỉ staff xem và cập nhật đơn, chỉ admin sửa menu và bàn" },
    { "problem": "Khách nhập '7', '07' hay '007' đều phải ra đúng bàn 07", "solution": "Chuẩn hóa số bàn ở cả phía React lẫn trong hàm SQL" }
  ],
  "results": [
    "Chạy online: quan-ly-cafe-nuoc.vercel.app",
    "Luồng hoàn chỉnh: quét QR → đặt món → pha chế nhận đơn realtime → admin thống kê doanh thu",
    "Có sẵn dữ liệu mẫu (menu, đơn hàng) để demo ngay khi phỏng vấn"
  ],
  "questions": [
    { "q": "Realtime hoạt động thế nào?", "a": "Trang pha chế và admin subscribe kênh thay đổi của bảng orders trên Supabase; có đơn mới hoặc đổi trạng thái là giao diện tự cập nhật." },
    { "q": "Tại sao tính tiền trong database chứ không ở React?", "a": "Code React chạy trên máy khách nên có thể bị sửa. Hàm place_order chạy trong Postgres, đọc giá thật, kiểm tra dữ liệu rồi mới tạo đơn." },
    { "q": "Nếu mở rộng cho nhiều chi nhánh thì sao?", "a": "Thêm bảng branches, gắn branch_id cho bàn, menu, đơn hàng và thêm điều kiện chi nhánh vào RLS để nhân viên chỉ thấy đơn của chi nhánh mình." }
  ]
}
$json$::jsonb
where id = '33b37812-053a-4523-9445-350410340af1'
  and user_id = (select id from public.profiles where username = 'nguyenthithao5002');


-- 4. Bakery Store – Cửa hàng bánh online
update public.portfolio_projects
set details = $json$
{
  "pitch": "Website bán bánh online bằng Next.js: khách xem danh mục, chi tiết bánh, thêm vào giỏ và đặt hàng; có tài khoản, lịch sử đơn và trang admin quản lý sản phẩm, đơn hàng.",
  "role": "Làm cá nhân – Fullstack (Next.js + Supabase)",
  "period": "",
  "stack": ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Vercel"],
  "context": "Tiệm bánh nhỏ cần một kênh bán online đơn giản thay cho việc nhận đơn qua tin nhắn. Đây cũng là dự án mình dùng để học Next.js App Router và TypeScript.",
  "actions": [
    "Trang chủ, cửa hàng, chi tiết sản phẩm /shop/[id], giới thiệu; dữ liệu sản phẩm lấy phía server và làm mới mỗi 60 giây (ISR)",
    "Giỏ hàng bằng React Context + modal; đăng ký, đăng nhập bằng Supabase Auth; trang cá nhân xem lịch sử đơn",
    "API route /api/orders tạo đơn: kiểm tra dữ liệu, sinh mã đơn BK-xxxxxxx, ghi bảng orders và order_items",
    "Trang admin thêm / sửa / xóa sản phẩm, xem và cập nhật đơn; phân quyền qua bảng user_roles"
  ],
  "challenges": [
    { "problem": "Giá gửi từ trình duyệt có thể bị sửa", "solution": "API lấy lại giá từ database để tính tổng tiền, không tin giá client gửi lên" },
    { "problem": "Có thể bị spam đặt đơn", "solution": "Giới hạn 5 đơn / phút cho mỗi IP, vượt thì trả mã 429" },
    { "problem": "Ghi order_items lỗi sau khi đã tạo order làm dữ liệu dở dang", "solution": "Xóa order vừa tạo nếu bước sau bị lỗi (rollback thủ công)" }
  ],
  "results": [
    "Chạy online: bakery-store-rho.vercel.app",
    "Luồng mua hàng đầy đủ: xem sản phẩm → giỏ hàng → đặt hàng → admin xử lý đơn"
  ],
  "questions": [
    { "q": "Server Component và Client Component khác nhau thế nào, dự án dùng ra sao?", "a": "Trang /shop và /shop/[id] lấy dữ liệu từ Supabase phía server nên tải nhanh, tốt cho SEO; giỏ hàng, modal cần state và sự kiện click nên là Client Component." },
    { "q": "Rate limit bằng Map trong bộ nhớ có hạn chế gì?", "a": "Trên serverless mỗi instance có Map riêng và mất khi khởi động lại, nên chỉ chặn được spam cơ bản. Làm thật thì nên dùng Redis (vd Upstash) hoặc giới hạn ở tầng database." },
    { "q": "Nếu làm lại bạn sửa gì?", "a": "Gộp việc tạo order và order_items vào một hàm SQL chạy trong transaction thay vì rollback thủ công, và thêm thanh toán online." }
  ]
}
$json$::jsonb
where id = '165bec7f-f5c6-4daf-90d7-c1d3f49a1d97'
  and user_id = (select id from public.profiles where username = 'nguyenthithao5002');


-- 5. DakLak AI Guide – API
update public.portfolio_projects
set details = $json$
{
  "pitch": "Backend cho ứng dụng hướng dẫn du lịch Đắk Lắk: REST API bằng ASP.NET Core quản lý địa điểm, đặc sản OCOP, văn hóa, ẩm thực, lễ hội, kèm chatbot AI trả lời dựa trên chính dữ liệu trong database.",
  "role": "Làm cá nhân – Backend (.NET)",
  "period": "",
  "stack": ["C#", "ASP.NET Core", "Entity Framework Core", "PostgreSQL", "JWT", "Swagger", "Google Gemini", "Claude API", "Docker", "Render"],
  "context": "Thông tin du lịch Đắk Lắk nằm rải rác, khách khó tìm đủ địa điểm, đặc sản, lịch lễ hội ở một nơi; chatbot AI thông thường lại hay trả lời sai thông tin địa phương. Mục tiêu: một API dữ liệu tập trung và chatbot trả lời đúng theo dữ liệu của tỉnh.",
  "actions": [
    "Thiết kế 8 bảng PostgreSQL (địa điểm, sản phẩm OCOP, bài viết văn hóa, món ăn, sự kiện và các danh mục), viết script schema + dữ liệu mẫu",
    "31 endpoint REST qua 8 controller: GET công khai, POST / PUT / DELETE yêu cầu JWT của admin",
    "Chatbot /api/chat: nạp dữ liệu từ database vào system prompt để AI trả lời theo dữ liệu thật; đổi nhà cung cấp Gemini ↔ Claude chỉ bằng cấu hình",
    "Rate limiting theo IP: chat 10 lần / phút, đăng nhập 5 lần / phút",
    "Swagger có ô nhập JWT để test; CORS chỉ cho phép domain frontend; Dockerfile multi-stage và deploy trên Render"
  ],
  "challenges": [
    { "problem": "AI trả lời sai hoặc tự bịa địa điểm, món ăn địa phương", "solution": "Đưa danh sách địa điểm, sản phẩm, món ăn, lễ hội lấy từ database vào ngữ cảnh và yêu cầu AI chỉ dùng dữ liệu đó" },
    { "problem": "Gọi AI tốn chi phí và dễ bị spam", "solution": "Rate limiter theo IP, chỉ gửi 20 tin gần nhất, mỗi tin tối đa 2000 ký tự; hết quota thì trả thông báo thân thiện thay vì lỗi 500" },
    { "problem": "Không được để lộ khóa bí mật trên GitHub", "solution": "JWT key, mật khẩu admin, API key, chuỗi kết nối đều đọc từ biến môi trường; thiếu JWT key thì tạo khóa tạm để server không bị sập" },
    { "problem": "Quan hệ hai chiều giữa các entity làm lỗi vòng lặp khi trả JSON", "solution": "Bật ReferenceHandler.IgnoreCycles trong cấu hình JSON" }
  ],
  "results": [
    "API chạy online, có tài liệu Swagger: daklakaiguide-api.onrender.com/swagger",
    "Đang phục vụ frontend DakLak AI Guide trên Vercel"
  ],
  "questions": [
    { "q": "Vì sao đưa dữ liệu vào prompt mà không dùng vector database (RAG)?", "a": "Dữ liệu hiện còn ít, vừa với ngữ cảnh của model nên cách này đơn giản và chính xác. Khi dữ liệu lớn sẽ chuyển sang tìm kiếm embedding và chỉ đưa phần liên quan vào prompt." },
    { "q": "JWT hoạt động thế nào trong API này?", "a": "Admin đăng nhập nhận token ký bằng khóa bí mật (HMAC), hết hạn sau 8 giờ. Các endpoint ghi có [Authorize]; middleware kiểm tra chữ ký, issuer, audience và hạn của token." },
    { "q": "Vì sao tách riêng API và frontend?", "a": "Mỗi phần deploy độc lập (Render và Vercel), dễ thay giao diện hoặc thêm app mobile dùng chung API; Swagger giúp test API mà không cần frontend." }
  ]
}
$json$::jsonb
where id = '61faa584-b442-4007-ad2e-9cb6b3b69cfa'
  and user_id = (select id from public.profiles where username = 'nguyenthithao5002');


-- 6. DakLak AI Guide – Client
update public.portfolio_projects
set details = $json$
{
  "pitch": "Giao diện web hướng dẫn du lịch Đắk Lắk bằng React: khám phá địa điểm, đặc sản OCOP, văn hóa, ẩm thực, lễ hội trên bản đồ tương tác và hỏi chatbot AI; có trang admin để quản lý toàn bộ nội dung.",
  "role": "Làm cá nhân – Frontend (React)",
  "period": "",
  "stack": ["React", "Vite", "React Router", "Axios", "Leaflet", "Vercel"],
  "context": "Cần một giao diện dễ dùng trên điện thoại cho khách du lịch, kết nối với DakLak AI Guide API (.NET), và trang quản trị để cập nhật nội dung mà không phải sửa database trực tiếp.",
  "actions": [
    "Khoảng 20 trang: danh sách + chi tiết cho 5 loại nội dung, bản đồ, thông tin du lịch, chat, đăng nhập, trang 404",
    "Bản đồ Leaflet ghim tất cả địa điểm có tọa độ, tự căn khung nhìn theo các điểm",
    "Trang chat và widget chat nổi, hiển thị câu trả lời của AI dạng Markdown",
    "Tách lớp gọi API (axiosClient + file api cho từng tài nguyên), hook useFetch và component StateView xử lý trạng thái tải / lỗi",
    "Trang admin CRUD dùng chung 1 component AdminResource cấu hình theo từng tài nguyên; bảo vệ bằng PrivateRoute + AuthContext"
  ],
  "challenges": [
    { "problem": "5 loại nội dung, mỗi loại cần một trang quản trị → code bị lặp", "solution": "Viết 1 component AdminResource đọc cấu hình (cột, trường nhập) từ resources.js; thêm loại nội dung mới chỉ cần thêm cấu hình" },
    { "problem": "Tải lại trang con trên Vercel bị lỗi 404 vì là SPA", "solution": "Thêm vercel.json rewrite mọi đường dẫn về index.html" },
    { "problem": "Trang nào cũng phải tự viết lại xử lý loading / lỗi", "solution": "Gom vào hook useFetch + component StateView dùng chung" }
  ],
  "results": [
    "Chạy online: dak-lak-ai-guide-client.vercel.app",
    "Kết nối hoàn chỉnh với API .NET trên Render, gồm cả chatbot AI và trang quản trị"
  ],
  "questions": [
    { "q": "JWT được lưu ở đâu, có rủi ro gì?", "a": "Lưu trong localStorage và axios tự gắn vào header Authorization. Rủi ro là bị đánh cắp nếu trang dính XSS; cách an toàn hơn là cookie httpOnly, nhưng vì chỉ admin dùng nên mình chọn cách đơn giản và đặt hạn token 8 giờ." },
    { "q": "Vì sao dùng Vite thay vì Next.js?", "a": "Ứng dụng chủ yếu chạy phía client, dữ liệu lấy từ API riêng nên không cần SSR; Vite build nhanh, cấu hình gọn và deploy tĩnh lên Vercel." },
    { "q": "Làm sao để thêm một loại nội dung mới vào trang admin?", "a": "Thêm cấu hình vào resources.js (tên, endpoint, các cột và trường nhập), route admin sẽ tự sinh từ cấu hình đó." }
  ]
}
$json$::jsonb
where id = 'f2a28ec9-0c89-437e-bf0d-ca0532297f99'
  and user_id = (select id from public.profiles where username = 'nguyenthithao5002');


-- Kiểm tra: 6 dòng phải có has_details = true
select title, details is not null as has_details
from public.portfolio_projects
where user_id = (select id from public.profiles where username = 'nguyenthithao5002')
order by created_at desc;
