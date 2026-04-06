# Giao Diện Vận Hành Dịch Vụ (Service Operations Interface)

## Tổng Quan

Giao diện vận hành dịch vụ được thiết kế để quản lý và theo dõi tiến trình các booking với 3 vai trò khác nhau: **Guest (Khách hàng)**, **Staff (Nhân viên kỹ thuật)**, và **Admin (Quản lý)**.

## Cấu Trúc Files

```
client/src/
├── pages/
│   ├── OperationsListPage.jsx    # Danh sách tất cả bookings
│   └── OperationsPage.jsx        # Chi tiết vận hành 1 booking
├── components/
│   ├── GuestView.jsx             # Giao diện cho khách hàng
│   ├── StaffView.jsx             # Giao diện cho nhân viên
│   └── AdminView.jsx             # Giao diện cho quản lý
└── mockOperationsData.js         # Mock data cho demo
```

## Các Tính Năng Chính

### 1. Đồng Kiểm (Inspection)
- **Mục đích**: Ghi nhận tình trạng xe trước khi dịch vụ để tránh tranh chấp
- **Thực hiện**: Admin/Staff kiểm tra và chụp ảnh các vết móp, xước
- **Xác nhận**: Cả khách hàng và nhân viên ký xác nhận
- **Lưu trữ**: Hệ thống lưu thông tin đồng kiểm kèm ảnh chứng cứ

### 2. Tuần Tự Hóa Công Việc (Sequential Task Execution)
- **Nguyên tắc**: Các ServiceTask phải thực hiện theo thứ tự stepOrder
- **Ràng buộc**: Không thể bắt đầu bước N nếu bước N-1 chưa hoàn thành
- **Hiển thị**: 
  - Tasks đã hoàn thành: màu xanh ✓
  - Task đang làm: màu xanh dương với animation
  - Tasks bị chặn: màu xám với cảnh báo "Chờ bước trước"

### 3. Trừ Kho Tự Động (Auto Material Deduction)
- **Trigger**: Khi ServiceTask chuyển sang COMPLETED
- **Hành động**: Hệ thống tự động:
  1. Tạo MaterialUsage record
  2. Trừ số lượng vật tư trong Materials
  3. Thông báo cho nhân viên
- **Theo dõi**: Admin xem lịch sử trừ kho trong tab "Vật tư"

### 4. Giao Việc Thông Minh (Smart Task Assignment)
- **Ưu tiên**: Nhân viên có specialty phù hợp
- **Hiển thị**: 
  - Nhân viên đề xuất (có chuyên môn + rảnh): màu xanh
  - Nhân viên đang bận: màu xám, không thể chọn
- **Linh hoạt**: Quản lý có thể giao cho nhân viên khác nếu cần

## Hướng Dẫn Sử Dụng

### Truy Cập
1. Mở trình duyệt và truy cập: `http://localhost:5173`
2. Click vào menu "VẬN HÀNH" trên header
3. Xem danh sách bookings hoặc click vào 1 booking để xem chi tiết

### Guest View (Khách Hàng)
**Chức năng:**
- Xem thanh tiến độ hiện đại với % hoàn thành
- Theo dõi timeline các công việc
- Xem thông tin đồng kiểm (các vết hư hỏng đã ghi nhận)
- Xem tổng chi phí dịch vụ

**Cách sử dụng:**
1. Chọn vai trò "Khách hàng" trong dropdown
2. Xem progress bar với % hoàn thành
3. Cuộn xuống để xem chi tiết từng bước

### Staff View (Nhân Viên)
**Chức năng:**
- Xem công việc hiện tại cần làm
- Bắt đầu/Hoàn thành công việc
- Xem vật tư cần dùng cho mỗi task
- Nhận thông báo khi trừ kho tự động

**Cách sử dụng:**
1. Chọn vai trò "Nhân viên"
2. Xem công việc hiện tại ở card phía trên
3. Click "Bắt đầu" để bắt đầu task
4. Click "Hoàn thành" khi xong
5. Lưu ý: Chỉ có thể làm task theo thứ tự!

### Admin View (Quản Lý)
**Chức năng:**
- Xem tổng quan (stats cards)
- Quản lý công việc (tab "Công việc")
- Giao việc cho nhân viên (tab "Nhân viên")
- Quản lý vật tư và xem lịch sử trừ kho (tab "Vật tư")
- Xem thông tin đồng kiểm (tab "Đồng kiểm")

**Cách sử dụng:**
1. Chọn vai trò "Quản lý"
2. Xem 4 stats cards phía trên
3. Chuyển qua các tab để quản lý:
   - **Tab Công việc**: Click "Giao việc" để assign nhân viên
   - **Tab Nhân viên**: Xem trạng thái rảnh/bận
   - **Tab Vật tư**: Xem tồn kho, cảnh báo vật tư sắp hết
   - **Tab Đồng kiểm**: Xem chi tiết đồng kiểm và ảnh chứng cứ

## Demo với Mock Data

### Bookings có sẵn:
- **BK001**: Toyota Camry - Đang thực hiện (45% hoàn thành)
- **BK002**: Honda City - Chờ xử lý
- **BK003**: Mazda CX-5 - Đã hoàn thành

### Test Scenarios:

#### Scenario 1: Nhân viên hoàn thành công việc
1. Chọn booking BK001
2. Chọn vai trò "Nhân viên"
3. Task hiện tại: "Xịt rửa cao áp"
4. Click "Hoàn thành"
5. ✅ Thấy task chuyển sang màu xanh
6. ✅ Task tiếp theo tự động hiện lên

#### Scenario 2: Admin giao việc
1. Chọn booking BK002
2. Chọn vai trò "Quản lý"
3. Tab "Công việc" → Task "Kiểm tra đồng kiểm"
4. Click "Giao việc"
5. Chọn nhân viên từ danh sách đề xuất
6. ✅ Task được assign cho nhân viên đó

#### Scenario 3: Khách xem tiến độ
1. Chọn booking BK001
2. Chọn vai trò "Khách hàng"
3. Xem progress bar 45%
4. Cuộn xuống xem timeline với:
   - ✅ 2 tasks hoàn thành (màu xanh)
   - 🔵 1 task đang làm (màu xanh dương)
   - ⚪ 2 tasks chưa làm (màu xám)

## API Endpoints Cần Có (Backend)

Khi tích hợp backend thật, cần các endpoints sau:

### Bookings
```
GET    /api/bookings              # Danh sách bookings
GET    /api/bookings/:id          # Chi tiết 1 booking
POST   /api/bookings              # Tạo booking mới
PUT    /api/bookings/:id          # Cập nhật booking
```

### Service Tasks
```
GET    /api/bookings/:id/tasks    # Tasks của 1 booking
PUT    /api/tasks/:id/start       # Bắt đầu task
PUT    /api/tasks/:id/complete    # Hoàn thành task (tự động trừ kho)
PUT    /api/tasks/:id/assign      # Giao task cho nhân viên
```

### Inspections
```
GET    /api/bookings/:id/inspection   # Lấy thông tin đồng kiểm
POST   /api/inspections                # Tạo đồng kiểm mới
POST   /api/inspections/:id/damages   # Thêm vết hư hỏng
```

### Materials
```
GET    /api/materials              # Danh sách vật tư
GET    /api/materials/low-stock   # Vật tư sắp hết
GET    /api/material-usage        # Lịch sử trừ kho
```

### Staff
```
GET    /api/staff                 # Danh sách nhân viên
GET    /api/staff/available       # Nhân viên rảnh
GET    /api/staff/:id/current-task # Task hiện tại của nhân viên
```

## Cấu Trúc Dữ Liệu

### Booking
```javascript
{
  id: "BK001",
  customerName: "Nguyễn Văn An",
  phone: "0901234567",
  vehicleInfo: {
    plate: "30A-12345",
    brand: "Toyota",
    model: "Camry",
    year: 2022,
    type: "CAR"
  },
  services: [
    { id: "SV001", name: "Rửa xe cao cấp", price: 150000 }
  ],
  status: "IN_PROGRESS", // PENDING | IN_PROGRESS | COMPLETED
  checkInTime: "2026-04-06T08:00:00Z",
  estimatedDuration: 120,
  currentProgress: 45
}
```

### ServiceTask
```javascript
{
  id: "TSK001",
  bookingId: "BK001",
  taskName: "Rửa bọt tuyết",
  description: "Phun bọt tuyết toàn bộ xe",
  stepOrder: 1, // Thứ tự bắt buộc
  status: "PENDING", // PENDING | IN_PROGRESS | COMPLETED | BLOCKED
  assignedStaff: {
    id: "ST001",
    name: "Nguyễn Thanh Tùng",
    specialty: "CAR_WASH"
  },
  estimatedMinutes: 15,
  actualMinutes: 12,
  materials: [
    { id: "MAT001", name: "Dung dịch bọt tuyết", quantity: 0.5, unit: "lít" }
  ],
  startTime: "2026-04-06T08:13:00Z",
  endTime: "2026-04-06T08:25:00Z"
}
```

### Inspection
```javascript
{
  id: "INS001",
  bookingId: "BK001",
  inspector: { id: "ST001", name: "Phạm Văn Dũng" },
  inspectionTime: "2026-04-06T08:05:00Z",
  overallCondition: "GOOD",
  damages: [
    {
      id: "DMG001",
      type: "SCRATCH", // SCRATCH | DENT | PAINT_DAMAGE
      location: "Cửa trước bên phải",
      severity: "MINOR", // MINOR | MODERATE | SEVERE
      description: "Vết xước nhẹ dài 5cm",
      imageUrls: ["/uploads/scratch-1.jpg"]
    }
  ],
  customerSignature: "base64_string",
  staffSignature: "base64_string",
  notes: "Khách hàng đã xác nhận..."
}
```

### Material
```javascript
{
  id: "MAT001",
  name: "Dung dịch bọt tuyết",
  category: "CLEANING",
  currentStock: 45.5,
  unit: "lít",
  minStock: 10, // Cảnh báo khi < minStock
  price: 150000,
  supplier: "Chemical Corp"
}
```

### MaterialUsage (Auto-generated)
```javascript
{
  id: "MU001",
  taskId: "TSK002",
  materialId: "MAT001",
  materialName: "Dung dịch bọt tuyết",
  quantityUsed: 0.5,
  unit: "lít",
  usedAt: "2026-04-06T08:25:00Z",
  staffId: "ST002"
}
```

## Styling & UI

- **Framework**: Tailwind CSS
- **Icons**: Lucide React
- **Animation**: Tailwind animations (pulse, transition)
- **Responsive**: Mobile-first design
- **Theme**: 
  - Primary: Blue (#1e5aa0, #3b82f6)
  - Success: Green (#10b981)
  - Warning: Amber (#f59e0b)
  - Danger: Red (#ef4444)

## Lưu Ý Quan Trọng

1. **Tuần tự hóa**: Tasks PHẢI thực hiện theo đúng stepOrder, không thể nhảy bước
2. **Trừ kho tự động**: Chỉ xảy ra khi task = COMPLETED, không thể revert
3. **Giao việc**: Ưu tiên nhân viên có specialty phù hợp, nhưng không bắt buộc
4. **Đồng kiểm**: Nên là bước đầu tiên (stepOrder = 1) để bảo vệ cả 2 bên

## Tương Lai (Future Enhancements)

- [ ] Realtime updates với WebSocket
- [ ] Push notifications khi task hoàn thành
- [ ] Camera integration cho đồng kiểm
- [ ] Digital signature pad cho xác nhận
- [ ] QR code để khách quét và xem tiến độ
- [ ] Export PDF báo cáo đồng kiểm
- [ ] Analytics dashboard cho admin
- [ ] Mobile app cho nhân viên

## Hỗ Trợ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ team phát triển.
