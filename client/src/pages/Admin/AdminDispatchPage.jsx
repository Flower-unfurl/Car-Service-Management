import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ClipboardCheck,
    Droplets,
    Gauge,
    RefreshCw,
    Search,
    UserRoundPlus,
    Wrench,
    X,
} from "lucide-react";
import { useUser } from "../../hooks/UseUser";
import dispatchApi, { getErrorMessage } from "../../services/dispatchApi";
import TaskStatusBadge from "../../components/dispatch/TaskStatusBadge";

const TICKET_STATUS_STYLES = {
    ACTIVE: "bg-amber-100 text-amber-800",
    IN_SERVICE: "bg-sky-100 text-sky-800",
    READY_FOR_PICKUP: "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-gray-200 text-gray-700",
};

const emptyProgress = {
    totalTasks: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    progressPercentage: 0,
};

const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN");
};

const getTicketStatusStyle = (status) => {
    return TICKET_STATUS_STYLES[status] || "bg-gray-100 text-gray-700";
};

function RecommendationModal({ state, onClose, onAssign }) {
    if (!state.open) return null;

    const { task, loading, error, data, assigningStaffId } = state;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Gợi ý giao việc</h3>
                        <p className="text-xs text-slate-500">
                            Bước {task?.stepOrder} - {task?.serviceId?.serviceName || "N/A"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-6 text-sm text-slate-600">Đang tải gợi ý nhân sự...</div>
                ) : error ? (
                    <div className="p-6 text-sm text-rose-600">{error}</div>
                ) : (
                    <div className="space-y-5 p-6">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            Chuyên môn yêu cầu: <b>{data?.requiredSpecialty || "Không yêu cầu"}</b>
                        </div>

                        <section>
                            <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-emerald-700">
                                Ưu tiên (đúng chuyên môn + đang rảnh)
                            </h4>
                            <div className="space-y-2">
                                {(data?.recommendedStaff || []).length > 0 ? (
                                    data.recommendedStaff.map((staff) => (
                                        <div
                                            key={staff._id}
                                            className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-900">{staff.name}</p>
                                                <p className="text-xs text-slate-600">
                                                    {staff.specialty || "Chưa có specialty"} • Active task: {staff.activeTasks}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onAssign(staff._id)}
                                                disabled={assigningStaffId === staff._id}
                                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                                            >
                                                {assigningStaffId === staff._id ? "Đang giao..." : "Giao việc"}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500">
                                        Không có nhân sự nào đang rảnh và đúng chuyên môn.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section>
                            <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-600">
                                Nhân sự thay thế
                            </h4>
                            <div className="space-y-2">
                                {(data?.alternativeStaff || []).length > 0 ? (
                                    data.alternativeStaff.map((staff) => (
                                        <div
                                            key={staff._id}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-900">{staff.name}</p>
                                                <p className="text-xs text-slate-600">
                                                    {staff.specialty || "Chưa có specialty"} • Active task: {staff.activeTasks}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onAssign(staff._id)}
                                                disabled={assigningStaffId === staff._id}
                                                className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                                            >
                                                {assigningStaffId === staff._id ? "Đang giao..." : "Giao việc"}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500">
                                        Không có nhân sự thay thế.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminDispatchPage() {
    const { user, loading: userLoading } = useUser();

    const [tickets, setTickets] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState(emptyProgress);
    const [materialUsage, setMaterialUsage] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loadingTickets, setLoadingTickets] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [banner, setBanner] = useState({ type: "", message: "" });

    const [recommendationState, setRecommendationState] = useState({
        open: false,
        task: null,
        loading: false,
        error: "",
        data: null,
        assigningStaffId: null,
    });

    const selectedTicket = useMemo(() => {
        return tickets.find((ticket) => String(ticket._id) === String(selectedTicketId)) || null;
    }, [tickets, selectedTicketId]);

    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
            const keyword = search.trim().toLowerCase();
            const matchesKeyword =
                !keyword ||
                (ticket.licensePlate || "").toLowerCase().includes(keyword) ||
                (ticket.customerName || "").toLowerCase().includes(keyword) ||
                (ticket.customerPhone || "").toLowerCase().includes(keyword);

            return matchesStatus && matchesKeyword;
        });
    }, [tickets, search, statusFilter]);

    const fetchTickets = useCallback(
        async ({ silent = false } = {}) => {
            if (!silent) setLoadingTickets(true);
            try {
                const rows = await dispatchApi.getTickets();
                const nextTickets = Array.isArray(rows) ? rows : [];
                setTickets(nextTickets);

                setSelectedTicketId((currentId) => {
                    if (!nextTickets.length) return null;
                    if (currentId && nextTickets.some((ticket) => String(ticket._id) === String(currentId))) {
                        return currentId;
                    }
                    return nextTickets[0]._id;
                });
            } catch (error) {
                setBanner({
                    type: "error",
                    message: getErrorMessage(error, "Không thể tải danh sách ticket"),
                });
            } finally {
                if (!silent) setLoadingTickets(false);
            }
        },
        [],
    );

    const fetchTicketDetails = useCallback(async (ticketId, { silent = false } = {}) => {
        if (!ticketId) return;

        if (!silent) setLoadingDetails(true);

        try {
            const [taskRows, progressRow, materialRows] = await Promise.all([
                dispatchApi.getTasksByTicket(ticketId),
                dispatchApi.getTicketProgress(ticketId),
                dispatchApi.getMaterialUsageByTicket(ticketId),
            ]);

            setTasks(Array.isArray(taskRows) ? taskRows : []);
            setProgress(progressRow || emptyProgress);
            setMaterialUsage(Array.isArray(materialRows) ? materialRows : []);
        } catch (error) {
            setTasks([]);
            setProgress(emptyProgress);
            setMaterialUsage([]);
            setBanner({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không thể tải chi tiết dispatch. Hãy kiểm tra endpoint service-task.",
                ),
            });
        } finally {
            if (!silent) setLoadingDetails(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    useEffect(() => {
        if (!selectedTicketId) return;
        fetchTicketDetails(selectedTicketId);
    }, [selectedTicketId, fetchTicketDetails]);

    useEffect(() => {
        const timer = setInterval(() => {
            fetchTickets({ silent: true });
            if (selectedTicketId) {
                fetchTicketDetails(selectedTicketId, { silent: true });
            }
        }, 15000);

        return () => clearInterval(timer);
    }, [fetchTickets, fetchTicketDetails, selectedTicketId]);

    const openRecommendation = async (task) => {
        setRecommendationState({
            open: true,
            task,
            loading: true,
            error: "",
            data: null,
            assigningStaffId: null,
        });

        try {
            const data = await dispatchApi.getRecommendedStaff(task._id);
            setRecommendationState((prev) => ({
                ...prev,
                loading: false,
                data,
            }));
        } catch (error) {
            setRecommendationState((prev) => ({
                ...prev,
                loading: false,
                error: getErrorMessage(error, "Không tải được danh sách gợi ý nhân sự"),
            }));
        }
    };

    const closeRecommendation = () => {
        setRecommendationState({
            open: false,
            task: null,
            loading: false,
            error: "",
            data: null,
            assigningStaffId: null,
        });
    };

    const handleAssignStaff = async (staffId) => {
        if (!recommendationState.task?._id) return;

        setRecommendationState((prev) => ({ ...prev, assigningStaffId: staffId }));

        try {
            await dispatchApi.assignTask(recommendationState.task._id, staffId);
            setBanner({ type: "success", message: "Giao việc thành công" });
            closeRecommendation();
            fetchTicketDetails(selectedTicketId, { silent: true });
        } catch (error) {
            setRecommendationState((prev) => ({
                ...prev,
                assigningStaffId: null,
                error: getErrorMessage(error, "Không thể giao việc cho nhân sự đã chọn"),
            }));
        }
    };

    const handleManualRefresh = async () => {
        await fetchTickets();
        if (selectedTicketId) {
            await fetchTicketDetails(selectedTicketId);
        }
        setBanner({ type: "success", message: "Đã làm mới dữ liệu" });
    };

    const inspection = selectedTicket?.inspection;

    if (!userLoading && user?.role !== "ADMIN") {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                    <h2 className="text-lg font-black text-rose-800">Không có quyền truy cập</h2>
                    <p className="mt-2 text-sm text-rose-700">
                        Màn hình điều phối chỉ dành cho tài khoản ADMIN.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-3xl bg-gradient-to-r from-[#123968] via-[#1e5aa0] to-[#2f80c7] p-6 text-white shadow-xl md:p-8">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-100">
                                Dispatch & Inventory
                            </p>
                            <h1 className="mt-2 text-2xl font-black uppercase tracking-wide md:text-3xl">
                                Điều phối dịch vụ theo ticket
                            </h1>
                            <p className="mt-2 text-sm text-sky-100">
                                Theo dõi đồng kiểm, tuần tự task, giao việc theo chuyên môn và vật tư tiêu hao.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleManualRefresh}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/30"
                        >
                            <RefreshCw size={16} />
                            Làm mới
                        </button>
                    </div>
                </section>

                {banner.message ? (
                    <div
                        className={`rounded-xl border px-4 py-3 text-sm ${
                            banner.type === "error"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                    >
                        {banner.message}
                    </div>
                ) : null}

                <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                                Danh sách ticket
                            </h2>
                            <p className="text-xs text-slate-500">Chọn ticket để điều phối</p>
                        </div>

                        <div className="space-y-3">
                            <label className="relative block">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Biển số, tên khách, SĐT"
                                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none ring-offset-2 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                                />
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="IN_SERVICE">IN_SERVICE</option>
                                <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                        </div>

                        <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
                            {loadingTickets ? (
                                <p className="py-4 text-center text-sm text-slate-500">Đang tải ticket...</p>
                            ) : filteredTickets.length === 0 ? (
                                <p className="py-4 text-center text-sm text-slate-500">Không có ticket phù hợp.</p>
                            ) : (
                                filteredTickets.map((ticket) => {
                                    const active = String(ticket._id) === String(selectedTicketId);
                                    return (
                                        <button
                                            type="button"
                                            key={ticket._id}
                                            onClick={() => setSelectedTicketId(ticket._id)}
                                            className={`w-full rounded-xl border p-3 text-left transition ${
                                                active
                                                    ? "border-[#1e5aa0] bg-[#1e5aa0]/5"
                                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-black text-slate-900">{ticket.licensePlate}</p>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getTicketStatusStyle(ticket.status)}`}
                                                >
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-600">{ticket.customerName || "Khách lẻ"}</p>
                                            <p className="text-xs text-slate-500">{ticket.customerPhone || "Chưa có SĐT"}</p>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    <article className="space-y-4">
                        {!selectedTicket ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                                Chọn ticket ở danh sách bên trái để bắt đầu điều phối.
                            </div>
                        ) : (
                            <>
                                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ticket đang chọn</p>
                                            <h2 className="text-2xl font-black text-slate-900">
                                                {selectedTicket.licensePlate}
                                            </h2>
                                            <p className="text-sm text-slate-600">
                                                {selectedTicket.customerName || "Khách lẻ"} • {selectedTicket.customerPhone || "N/A"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                                            <p>Check-in: {formatDateTime(selectedTicket.checkinAt)}</p>
                                            <p>Khu vực: {selectedTicket.zone || "N/A"}</p>
                                            <Link
                                                to={`/inspection/${selectedTicket._id}`}
                                                className="mt-2 inline-flex rounded-lg bg-[#1e5aa0] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#164a85]"
                                            >
                                                Xem đồng kiểm chi tiết
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs text-slate-500">Tiến độ</p>
                                            <p className="text-xl font-black text-[#1e5aa0]">
                                                {progress.progressPercentage || 0}%
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs text-slate-500">Task hoàn tất</p>
                                            <p className="text-xl font-black text-emerald-600">{progress.completed || 0}</p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs text-slate-500">Task đang làm</p>
                                            <p className="text-xl font-black text-sky-600">{progress.inProgress || 0}</p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs text-slate-500">Task chờ</p>
                                            <p className="text-xl font-black text-amber-600">{progress.pending || 0}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="grid gap-4 xl:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-3 flex items-center gap-2">
                                            <ClipboardCheck size={18} className="text-[#1e5aa0]" />
                                            <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                                Đồng kiểm
                                            </h3>
                                        </div>

                                        {inspection ? (
                                            <div className="space-y-3 text-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                                                        <p className="text-xs text-slate-500">Odometer</p>
                                                        <p className="font-bold text-slate-900">{inspection.odometer || 0} km</p>
                                                    </div>
                                                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                                                        <p className="text-xs text-slate-500">Fuel level</p>
                                                        <p className="font-bold text-slate-900">{inspection.fuelLevel || 0}%</p>
                                                    </div>
                                                </div>
                                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                                    <p className="text-xs text-slate-500">Tình trạng tổng quát</p>
                                                    <p className="font-semibold text-slate-800">
                                                        {inspection.condition || "Không có ghi chú"}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                                    <p className="mb-1 text-xs text-slate-500">Điểm hư hỏng / trầy xước</p>
                                                    {inspection.damages?.length ? (
                                                        <ul className="space-y-1 text-xs text-slate-700">
                                                            {inspection.damages.map((damage, index) => (
                                                                <li key={`${damage.area}-${index}`}>
                                                                    {damage.area} • {damage.severity} • {damage.description || "Không mô tả"}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-slate-500">Không có hư hỏng được ghi nhận.</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
                                                Ticket chưa có dữ liệu đồng kiểm.
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-3 flex items-center gap-2">
                                            <Droplets size={18} className="text-[#1e5aa0]" />
                                            <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                                Vật tư đã trừ kho
                                            </h3>
                                        </div>

                                        {materialUsage.length > 0 ? (
                                            <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                                                {materialUsage.map((usage) => (
                                                    <div
                                                        key={usage._id}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                                                    >
                                                        <p className="font-bold text-slate-900">
                                                            {usage.materialId?.materialName || "Material"}
                                                        </p>
                                                        <p className="text-slate-600">
                                                            Sử dụng: {usage.quantityUsed} {usage.materialId?.unit || "đơn vị"}
                                                        </p>
                                                        <p className="text-slate-500">
                                                            Bởi: {usage.performedBy?.name || "N/A"} • {formatDateTime(usage.date)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                                                Chưa có bản ghi trừ kho cho ticket này.
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wrench size={18} className="text-[#1e5aa0]" />
                                            <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                                Điều phối Service Task
                                            </h3>
                                        </div>
                                        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                                            <Gauge size={14} />
                                            Tuần tự theo stepOrder
                                        </div>
                                    </div>

                                    {loadingDetails ? (
                                        <p className="py-3 text-sm text-slate-500">Đang tải chi tiết task...</p>
                                    ) : tasks.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                                            Chưa có task cho ticket này. Bạn có thể tạo task từ order ở backend.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {tasks
                                                .slice()
                                                .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
                                                .map((task) => (
                                                    <div
                                                        key={task._id}
                                                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-500">Bước {task.stepOrder}</p>
                                                                <p className="font-black text-slate-900">
                                                                    {task.serviceId?.serviceName || "Dịch vụ"}
                                                                </p>
                                                                <p className="text-xs text-slate-600">
                                                                    Nhân sự: {task.assignedStaffId?.name || "Chưa phân công"}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <TaskStatusBadge status={task.status} />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openRecommendation(task)}
                                                                    disabled={task.status === "COMPLETED"}
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <UserRoundPlus size={14} />
                                                                    Giao việc
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 text-xs text-slate-500">
                                                            Bắt đầu: {formatDateTime(task.startTime)} • Hoàn thành: {formatDateTime(task.endTime)}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </article>
                </section>
            </div>

            <RecommendationModal
                state={recommendationState}
                onClose={closeRecommendation}
                onAssign={handleAssignStaff}
            />
        </div>
    );
}
