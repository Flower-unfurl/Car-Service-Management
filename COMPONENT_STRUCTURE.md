# Cấu Trúc Component - Operations Interface

## 📁 File Structure

```
client/src/
│
├── pages/
│   ├── OperationsListPage.jsx          # Danh sách bookings
│   │   └── Features:
│   │       ├── Stats cards (4 metrics)
│   │       ├── Search & filter
│   │       └── Booking cards list
│   │
│   └── OperationsPage.jsx              # Chi tiết 1 booking
│       └── Features:
│           ├── Header với booking info
│           ├── Role selector (demo)
│           └── Dynamic view loader
│
├── components/
│   ├── GuestView.jsx                   # View cho Guest
│   │   └── Sections:
│   │       ├── Hero with progress bar
│   │       ├── Vehicle info card
│   │       ├── Service tasks timeline
│   │       ├── Inspection info
│   │       └── Services summary
│   │
│   ├── StaffView.jsx                   # View cho Staff
│   │   └── Sections:
│   │       ├── Current task card
│   │       ├── Task list (sequential)
│   │       └── Info box (instructions)
│   │
│   ├── AdminView.jsx                   # View cho Admin
│   │   └── Sections:
│   │       ├── Stats overview (4 cards)
│   │       ├── Tabs navigation
│   │       ├── Tab: Tasks management
│   │       ├── Tab: Staff management
│   │       ├── Tab: Materials management
│   │       ├── Tab: Inspection details
│   │       └── Assign staff modal
│   │
│   └── layouts/
│       └── Header.jsx                  # Updated với "Vận hành" link
│
├── mockOperationsData.js               # Mock data
│   └── Exports:
│       ├── mockBookings (3 items)
│       ├── mockServiceTasks (by bookingId)
│       ├── mockInspections (by bookingId)
│       ├── mockMaterials (5 items)
│       ├── mockStaff (5 items)
│       ├── mockMaterialUsage (by bookingId)
│       └── Label mappings
│
└── routes/
    └── AppRoute.jsx                    # Updated routes
        └── Routes:
            ├── /operations → List
            └── /operations/:id → Detail
```

## 🎯 Component Flow

```
┌─────────────────────────────────────────────┐
│           OperationsListPage                │
│  ┌────────────────────────────────────┐    │
│  │     Stats Cards (Overview)          │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │     Search & Filter                 │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │  Booking Card 1 [Click] ────────┐  │    │
│  │  Booking Card 2                 │  │    │
│  │  Booking Card 3                 │  │    │
│  └─────────────────────────────────│──┘    │
└──────────────────────────────────────│──────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────┐
│            OperationsPage                    │
│  ┌─────────────────────────────────────┐    │
│  │  Header: Booking Info + Role Select │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │   Role = GUEST?                     │    │
│  │   └─> Show GuestView                │    │
│  │                                      │    │
│  │   Role = STAFF?                     │    │
│  │   └─> Show StaffView                │    │
│  │                                      │    │
│  │   Role = ADMIN?                     │    │
│  │   └─> Show AdminView                │    │
│  └─────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

## 📊 View Details

### GuestView Structure
```
┌──────────────────────────────────────┐
│  🎨 Hero Section (Gradient)          │
│  ├─ Welcome message                  │
│  ├─ Progress percentage              │
│  └─ Animated progress bar            │
├──────────────────────────────────────┤
│  🚗 Vehicle Info Card                │
│  ├─ Plate number                     │
│  ├─ Brand & Model                    │
│  └─ Check-in time                    │
├──────────────────────────────────────┤
│  📋 Service Tasks Timeline           │
│  ├─ Task 1 [✓ Completed]            │
│  ├─ Task 2 [✓ Completed]            │
│  ├─ Task 3 [🔵 In Progress]         │
│  ├─ Task 4 [⚪ Pending]              │
│  └─ Task 5 [⚪ Pending]              │
├──────────────────────────────────────┤
│  🔍 Inspection Info (if exists)      │
│  └─ Damages list with icons          │
├──────────────────────────────────────┤
│  💰 Services Summary                 │
│  └─ Total cost                       │
└──────────────────────────────────────┘
```

### StaffView Structure
```
┌──────────────────────────────────────┐
│  🎯 Current Task Card (Gradient)     │
│  ├─ Task name & description          │
│  ├─ Materials required               │
│  └─ [Bắt đầu] or [Hoàn thành] btn   │
├──────────────────────────────────────┤
│  📝 Task List (Sequential)           │
│  ├─ Step 1 [✓ Completed]            │
│  ├─ Step 2 [✓ Completed]            │
│  ├─ Step 3 [🔵 In Progress] ───────┐│
│  ├─ Step 4 [🚫 Blocked]            ││
│  └─ Step 5 [🚫 Blocked]            ││
│      ↑ Cannot start until prev done ││
├──────────────────────────────────────┤
│  ℹ️ Info Box                         │
│  └─ Instructions & reminders         │
└──────────────────────────────────────┘
```

### AdminView Structure
```
┌──────────────────────────────────────────────┐
│  📊 Stats Cards Row                          │
│  ├─ [Tiến độ] [Nhân viên] [Vật tư] [Kiểm]   │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│  📑 Tabs: [Công việc][Nhân viên][Vật tư]...  │
├──────────────────────────────────────────────┤
│  Tab Content Area:                           │
│                                              │
│  IF tab = "Công việc":                       │
│  ├─ Task Card 1                              │
│  │  └─ [Giao việc] ─────────┐               │
│  ├─ Task Card 2              │               │
│  └─ Task Card 3              │               │
│                              │               │
│  IF tab = "Nhân viên":       │               │
│  ├─ Staff Card 1 (Available) │               │
│  ├─ Staff Card 2 (Busy)      │               │
│  └─ Staff Card 3 (Available) │               │
│                              │               │
│  IF tab = "Vật tư":          │               │
│  ├─ Material 1 [✓ OK]        │               │
│  ├─ Material 2 [⚠️ Low Stock] │              │
│  └─ Usage history            │               │
│                              │               │
│  IF tab = "Đồng kiểm":       │               │
│  └─ Inspection details       │               │
│                              ▼               │
│  ┌─────────────────────────────────────┐    │
│  │  🎯 Assign Staff Modal              │    │
│  │  ├─ Recommended Staff (green)       │    │
│  │  ├─ Busy Staff (gray)               │    │
│  │  └─ [Cancel] button                 │    │
│  └─────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

## 🔄 State Management

```javascript
// OperationsPage
const [userRole, setUserRole] = useState('ADMIN')
const [booking, setBooking] = useState(null)

// GuestView
const [tasks, setTasks] = useState([])
const [inspection, setInspection] = useState(null)

// StaffView
const [tasks, setTasks] = useState([])
const [currentTask, setCurrentTask] = useState(null)

// AdminView
const [tasks, setTasks] = useState([])
const [staff, setStaff] = useState([])
const [materials, setMaterials] = useState([])
const [inspection, setInspection] = useState(null)
const [selectedTab, setSelectedTab] = useState('tasks')
const [showAssignModal, setShowAssignModal] = useState(false)
const [taskToAssign, setTaskToAssign] = useState(null)
```

## 🎨 Color Scheme

```css
/* Status Colors */
PENDING:      bg-yellow-100 text-yellow-800
IN_PROGRESS:  bg-blue-100 text-blue-800
COMPLETED:    bg-green-100 text-green-800
BLOCKED:      bg-gray-100 text-gray-600

/* Staff Status */
AVAILABLE:    bg-green-50 border-green-200
BUSY:         bg-gray-50 border-gray-200

/* Materials */
LOW_STOCK:    bg-red-50 border-red-200
OK:           bg-white border-gray-200

/* Primary Actions */
Primary:      bg-blue-500 hover:bg-blue-600
Success:      bg-green-500 hover:bg-green-600
Warning:      bg-amber-500 hover:bg-amber-600
```

## 📱 Responsive Breakpoints

```
Mobile:   < 640px  (sm)
Tablet:   640-1024px (md)
Desktop:  > 1024px (lg)

Grid layouts adjust:
- Stats: 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)
- Cards: Stack (mobile) → 2 cols (desktop)
```

## 🚀 Key Functions

```javascript
// StaffView - Check if can start task
canStartTask(task) {
  if (task.stepOrder === 1) return true
  const previousTasks = tasks.filter(t => t.stepOrder < task.stepOrder)
  return previousTasks.every(t => t.status === 'COMPLETED')
}

// StaffView - Complete task with material deduction
handleCompleteTask(task) {
  // 1. Update task status to COMPLETED
  // 2. Record end time and actual minutes
  // 3. Alert materials used (auto-deduct simulation)
  // 4. Move to next task
}

// AdminView - Smart staff assignment
assignStaffToTask(staffMember) {
  // 1. Assign staff to task
  // 2. Update staff status to BUSY
  // 3. Set staff's currentTask
  // 4. Close modal
}

// GuestView - Calculate progress
getEstimatedTimeRemaining() {
  const pending = tasks.filter(t => 
    t.status === 'PENDING' || t.status === 'IN_PROGRESS'
  )
  const totalMinutes = pending.reduce((sum, t) => 
    sum + t.estimatedMinutes, 0
  )
  return formatTime(totalMinutes)
}
```

## 🎯 Navigation Flow

```
User Journey 1 (Guest):
Home → Menu "Vận hành" → Operations List → Click BK001 
→ Select "Khách hàng" → View Progress

User Journey 2 (Staff):
Operations List → Click BK001 → Select "Nhân viên" 
→ Click "Bắt đầu" → Do work → Click "Hoàn thành"

User Journey 3 (Admin):
Operations List → Click BK002 → Select "Quản lý" 
→ Tab "Công việc" → Click "Giao việc" → Select Staff 
→ Tab "Vật tư" → Check low stock
```
