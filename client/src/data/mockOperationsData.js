// Mock data for Service Operations

export const mockBookings = [
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
      { id: "SV001", name: "Rửa xe cao cấp", price: 150000 },
      { id: "SV002", name: "Đánh bóng xe", price: 500000 }
    ],
    status: "IN_PROGRESS",
    checkInTime: "2026-04-06T08:00:00Z",
    estimatedDuration: 120,
    currentProgress: 45
  },
  {
    id: "BK002",
    customerName: "Trần Thị Bình",
    phone: "0912345678",
    vehicleInfo: {
      plate: "29B-67890",
      brand: "Honda",
      model: "City",
      year: 2021,
      type: "CAR"
    },
    services: [
      { id: "SV001", name: "Rửa xe cao cấp", price: 150000 }
    ],
    status: "PENDING",
    checkInTime: "2026-04-06T09:30:00Z",
    estimatedDuration: 60,
    currentProgress: 0
  },
  {
    id: "BK003",
    customerName: "Lê Minh Châu",
    phone: "0923456789",
    vehicleInfo: {
      plate: "51C-11223",
      brand: "Mazda",
      model: "CX-5",
      year: 2023,
      type: "CAR"
    },
    services: [
      { id: "SV003", name: "Thay dầu máy", price: 350000 },
      { id: "SV004", name: "Kiểm tra tổng quát", price: 200000 }
    ],
    status: "COMPLETED",
    checkInTime: "2026-04-06T07:00:00Z",
    estimatedDuration: 90,
    currentProgress: 100
  }
];

export const mockServiceTasks = {
  BK001: [
    {
      id: "TSK001",
      bookingId: "BK001",
      taskName: "Kiểm tra đồng kiểm",
      description: "Chụp ảnh và ghi nhận tình trạng xe trước khi dịch vụ",
      stepOrder: 1,
      status: "COMPLETED",
      assignedStaff: { id: "ST001", name: "Phạm Văn Dũng", specialty: "INSPECTION" },
      estimatedMinutes: 10,
      actualMinutes: 8,
      startTime: "2026-04-06T08:05:00Z",
      endTime: "2026-04-06T08:13:00Z"
    },
    {
      id: "TSK002",
      bookingId: "BK001",
      taskName: "Rửa bọt tuyết",
      description: "Phun bọt tuyết toàn bộ xe",
      stepOrder: 2,
      status: "COMPLETED",
      assignedStaff: { id: "ST002", name: "Nguyễn Thanh Tùng", specialty: "CAR_WASH" },
      estimatedMinutes: 15,
      actualMinutes: 12,
      materials: [
        { id: "MAT001", name: "Dung dịch bọt tuyết", quantity: 0.5, unit: "lít" }
      ],
      startTime: "2026-04-06T08:13:00Z",
      endTime: "2026-04-06T08:25:00Z"
    },
    {
      id: "TSK003",
      bookingId: "BK001",
      taskName: "Xịt rửa cao áp",
      description: "Xịt rửa toàn bộ bề mặt xe",
      stepOrder: 3,
      status: "IN_PROGRESS",
      assignedStaff: { id: "ST002", name: "Nguyễn Thanh Tùng", specialty: "CAR_WASH" },
      estimatedMinutes: 20,
      actualMinutes: null,
      startTime: "2026-04-06T08:25:00Z",
      endTime: null
    },
    {
      id: "TSK004",
      bookingId: "BK001",
      taskName: "Lau khô và hút bụi nội thất",
      description: "Lau khô toàn bộ xe và hút bụi nội thất",
      stepOrder: 4,
      status: "PENDING",
      assignedStaff: { id: "ST003", name: "Lê Văn Hải", specialty: "INTERIOR" },
      estimatedMinutes: 25,
      actualMinutes: null,
      startTime: null,
      endTime: null
    },
    {
      id: "TSK005",
      bookingId: "BK001",
      taskName: "Đánh bóng bề mặt sơn",
      description: "Sử dụng máy đánh bóng chuyên dụng",
      stepOrder: 5,
      status: "PENDING",
      assignedStaff: { id: "ST004", name: "Trần Đức Mạnh", specialty: "POLISHING" },
      estimatedMinutes: 50,
      actualMinutes: null,
      materials: [
        { id: "MAT002", name: "Dung dịch đánh bóng", quantity: 0.2, unit: "lít" },
        { id: "MAT003", name: "Miếng đánh bóng", quantity: 2, unit: "cái" }
      ],
      startTime: null,
      endTime: null
    }
  ],
  BK002: [
    {
      id: "TSK006",
      bookingId: "BK002",
      taskName: "Kiểm tra đồng kiểm",
      description: "Chụp ảnh và ghi nhận tình trạng xe trước khi dịch vụ",
      stepOrder: 1,
      status: "PENDING",
      assignedStaff: null,
      estimatedMinutes: 10,
      actualMinutes: null,
      startTime: null,
      endTime: null
    },
    {
      id: "TSK007",
      bookingId: "BK002",
      taskName: "Rửa bọt tuyết",
      description: "Phun bọt tuyết toàn bộ xe",
      stepOrder: 2,
      status: "PENDING",
      assignedStaff: null,
      estimatedMinutes: 15,
      actualMinutes: null,
      materials: [
        { id: "MAT001", name: "Dung dịch bọt tuyết", quantity: 0.5, unit: "lít" }
      ],
      startTime: null,
      endTime: null
    }
  ]
};

export const mockInspections = {
  BK001: {
    id: "INS001",
    bookingId: "BK001",
    inspector: { id: "ST001", name: "Phạm Văn Dũng" },
    inspectionTime: "2026-04-06T08:05:00Z",
    overallCondition: "GOOD",
    damages: [
      {
        id: "DMG001",
        type: "SCRATCH",
        location: "Cửa trước bên phải",
        severity: "MINOR",
        description: "Vết xước nhẹ dài 5cm",
        imageUrls: ["/mock-images/scratch-1.jpg"]
      },
      {
        id: "DMG002",
        type: "DENT",
        location: "Cánh gió sau bên trái",
        severity: "MINOR",
        description: "Vết lõm nhỏ đường kính 2cm",
        imageUrls: ["/mock-images/dent-1.jpg"]
      }
    ],
    customerSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    staffSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    notes: "Khách hàng đã xác nhận các vết hư hỏng có sẵn trước khi dịch vụ"
  }
};

export const mockMaterials = [
  {
    id: "MAT001",
    name: "Dung dịch bọt tuyết",
    category: "CLEANING",
    currentStock: 45.5,
    unit: "lít",
    minStock: 10,
    price: 150000,
    supplier: "Chemical Corp"
  },
  {
    id: "MAT002",
    name: "Dung dịch đánh bóng",
    category: "POLISHING",
    currentStock: 12.3,
    unit: "lít",
    minStock: 5,
    price: 450000,
    supplier: "Polish Pro"
  },
  {
    id: "MAT003",
    name: "Miếng đánh bóng",
    category: "ACCESSORIES",
    currentStock: 156,
    unit: "cái",
    minStock: 50,
    price: 25000,
    supplier: "Tools Vietnam"
  },
  {
    id: "MAT004",
    name: "Khăn microfiber",
    category: "ACCESSORIES",
    currentStock: 89,
    unit: "cái",
    minStock: 30,
    price: 35000,
    supplier: "Clean Supply"
  },
  {
    id: "MAT005",
    name: "Dầu nhớt tổng hợp 5W-40",
    category: "MAINTENANCE",
    currentStock: 8.2,
    unit: "lít",
    minStock: 15,
    price: 280000,
    supplier: "Oil Master"
  }
];

export const mockStaff = [
  {
    id: "ST001",
    name: "Phạm Văn Dũng",
    specialty: "INSPECTION",
    status: "BUSY",
    currentTask: "TSK001",
    phone: "0934567890",
    experience: 5
  },
  {
    id: "ST002",
    name: "Nguyễn Thanh Tùng",
    specialty: "CAR_WASH",
    status: "BUSY",
    currentTask: "TSK003",
    phone: "0945678901",
    experience: 3
  },
  {
    id: "ST003",
    name: "Lê Văn Hải",
    specialty: "INTERIOR",
    status: "AVAILABLE",
    currentTask: null,
    phone: "0956789012",
    experience: 4
  },
  {
    id: "ST004",
    name: "Trần Đức Mạnh",
    specialty: "POLISHING",
    status: "AVAILABLE",
    currentTask: null,
    phone: "0967890123",
    experience: 6
  },
  {
    id: "ST005",
    name: "Hoàng Minh Tuấn",
    specialty: "MAINTENANCE",
    status: "AVAILABLE",
    currentTask: null,
    phone: "0978901234",
    experience: 8
  }
];

export const mockMaterialUsage = {
  BK001: [
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
  ]
};

// Specialty mapping for display
export const specialtyLabels = {
  INSPECTION: "Kiểm tra đồng kiểm",
  CAR_WASH: "Rửa xe",
  INTERIOR: "Nội thất",
  POLISHING: "Đánh bóng",
  MAINTENANCE: "Bảo dưỡng",
  REPAIR: "Sửa chữa"
};

// Status labels
export const statusLabels = {
  PENDING: "Chờ xử lý",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy"
};

// Task status labels
export const taskStatusLabels = {
  PENDING: "Chờ bắt đầu",
  IN_PROGRESS: "Đang làm",
  COMPLETED: "Hoàn thành",
  BLOCKED: "Bị chặn"
};
