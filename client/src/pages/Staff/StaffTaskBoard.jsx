import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, Search, Wrench } from "lucide-react";
import { useUser } from "../../hooks/UseUser";
import dispatchApi, { getErrorMessage } from "../../services/dispatchApi";
import TaskStatusBadge from "../../components/dispatch/TaskStatusBadge";

const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN");
};

const normalizeText = (value) => (value || "").toLowerCase();

export default function StaffTaskBoard() {
    const { user, loading: userLoading } = useUser();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyTaskId, setBusyTaskId] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [banner, setBanner] = useState({ type: "", message: "" });

    const fetchTasks = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);

        try {
            const rows = await dispatchApi.getMyTasks();
            setTasks(Array.isArray(rows) ? rows : []);
        } catch (error) {
            setBanner({
                type: "error",
                message: getErrorMessage(
                    error,
                    "Không tải được danh sách task. Hãy kiểm tra endpoint service-task.",
                ),
            });
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        const timer = setInterval(() => {
            fetchTasks({ silent: true });
        }, 15000);

        return () => clearInterval(timer);
    }, [fetchTasks]);

    const filteredTasks = useMemo(() => {
        const kw = normalizeText(keyword.trim());

        return tasks.filter((task) => {
            const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
            const matchesKeyword =
                !kw ||
                normalizeText(task.serviceId?.serviceName).includes(kw) ||
                normalizeText(task.ticketId?.licensePlate).includes(kw) ||
                normalizeText(task.ticketId?.customerName).includes(kw);

            return matchesStatus && matchesKeyword;
        });
    }, [tasks, keyword, statusFilter]);

    const groupedByTicket = useMemo(() => {
        return filteredTasks.reduce((acc, task) => {
            const ticketKey = task.ticketId?._id || "unknown";
            if (!acc[ticketKey]) {
                acc[ticketKey] = {
                    ticket: task.ticketId,
                    tasks: [],
                };
            }
            acc[ticketKey].tasks.push(task);
            return acc;
        }, {});
    }, [filteredTasks]);

    const summary = useMemo(() => {
        const completed = tasks.filter((task) => task.status === "COMPLETED").length;
        const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
        const pending = tasks.filter((task) => task.status === "PENDING").length;

        return {
            total: tasks.length,
            completed,
            inProgress,
            pending,
        };
    }, [tasks]);

    const handleRefresh = async () => {
        await fetchTasks();
        setBanner({ type: "success", message: "Đã làm mới dữ liệu" });
    };

    const handleStartTask = async (task) => {
        setBusyTaskId(task._id);
        setBanner({ type: "", message: "" });

        try {
            await dispatchApi.startTask(task._id);
            setBanner({ type: "success", message: `Đã bắt đầu bước ${task.stepOrder}` });
            fetchTasks({ silent: true });
        } catch (error) {
            setBanner({
                type: "error",
                message: getErrorMessage(error, "Không thể bắt đầu task"),
            });
        } finally {
            setBusyTaskId(null);
        }
    };

    const handleCompleteTask = async (task) => {
        setBusyTaskId(task._id);
        setBanner({ type: "", message: "" });

        try {
            const response = await dispatchApi.completeTask(task._id);
            const data = response?.data || {};
            const warningCount = data?.materialWarnings?.length || 0;
            const lowStockCount = data?.lowStockAlerts?.length || 0;

            let message = `Đã hoàn thành bước ${task.stepOrder}`;
            if (warningCount > 0) {
                message += ` • Có ${warningCount} cảnh báo vật tư`;
            }
            if (lowStockCount > 0) {
                message += ` • ${lowStockCount} vật tư sắp hết`;
            }

            setBanner({ type: warningCount > 0 ? "error" : "success", message });
            fetchTasks({ silent: true });
        } catch (error) {
            setBanner({
                type: "error",
                message: getErrorMessage(error, "Không thể hoàn thành task"),
            });
        } finally {
            setBusyTaskId(null);
        }
    };

    if (!userLoading && user?.role !== "STAFF") {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                    <h2 className="text-lg font-black text-rose-800">Không có quyền truy cập</h2>
                    <p className="mt-2 text-sm text-rose-700">
                        Màn hình này chỉ dành cho tài khoản STAFF.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className="rounded-3xl bg-gradient-to-r from-[#123968] via-[#1e5aa0] to-[#2f80c7] p-6 text-white shadow-xl md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-100">
                                Staff Task Console
                            </p>
                            <h1 className="mt-2 text-2xl font-black uppercase tracking-wide md:text-3xl">
                                Bảng công việc của bạn
                            </h1>
                            <p className="mt-2 text-sm text-sky-100">
                                Hệ thống bắt buộc tuần tự theo stepOrder. Hoàn tất task sẽ tự động trừ kho vật tư.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/30"
                        >
                            <RefreshCw size={16} />
                            Làm mới
                        </button>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Tổng task</p>
                        <p className="mt-1 text-2xl font-black text-slate-900">{summary.total}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Đang thực hiện</p>
                        <p className="mt-1 text-2xl font-black text-sky-600">{summary.inProgress}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Chờ xử lý</p>
                        <p className="mt-1 text-2xl font-black text-amber-600">{summary.pending}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">Đã hoàn tất</p>
                        <p className="mt-1 text-2xl font-black text-emerald-600">{summary.completed}</p>
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

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                        <label className="relative block">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="Tìm theo biển số, khách, tên dịch vụ"
                                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none ring-offset-2 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                            />
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                        </select>
                    </div>
                </section>

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                        Đang tải công việc...
                    </div>
                ) : Object.keys(groupedByTicket).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                        Không có task phù hợp bộ lọc.
                    </div>
                ) : (
                    <section className="space-y-4">
                        {Object.values(groupedByTicket).map((group) => {
                            const orderedTasks = group.tasks
                                .slice()
                                .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));

                            const completed = orderedTasks.filter((task) => task.status === "COMPLETED").length;
                            const progressPercent = orderedTasks.length
                                ? Math.round((completed / orderedTasks.length) * 100)
                                : 0;

                            return (
                                <article key={group.ticket?._id || Math.random()} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ticket</p>
                                            <h2 className="text-xl font-black text-slate-900">
                                                {group.ticket?.licensePlate || "Không rõ biển số"}
                                            </h2>
                                            <p className="text-sm text-slate-600">
                                                {group.ticket?.customerName || "Khách lẻ"} • {group.ticket?.customerPhone || "N/A"}
                                            </p>
                                            {group.ticket?._id ? (
                                                <Link
                                                    to={`/inspection/${group.ticket._id}`}
                                                    className="mt-2 inline-flex rounded-lg bg-[#1e5aa0] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#164a85]"
                                                >
                                                    Xem đồng kiểm
                                                </Link>
                                            ) : null}
                                        </div>

                                        <div className="min-w-[220px]">
                                            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                                <span>Tiến độ nhóm task</span>
                                                <span>{progressPercent}%</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                <div
                                                    className="h-full rounded-full bg-[#1e5aa0]"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {orderedTasks.map((task) => {
                                            const isBusy = busyTaskId === task._id;
                                            const canStart = task.status === "PENDING";
                                            const canComplete = task.status === "IN_PROGRESS";

                                            return (
                                                <div
                                                    key={task._id}
                                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                                >
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-500">Bước {task.stepOrder}</p>
                                                            <p className="font-black text-slate-900">
                                                                {task.serviceId?.serviceName || "Dịch vụ"}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                Bắt đầu: {formatDateTime(task.startTime)} • Hoàn thành: {formatDateTime(task.endTime)}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <TaskStatusBadge status={task.status} />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStartTask(task)}
                                                                disabled={!canStart || isBusy}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-45"
                                                            >
                                                                <Clock3 size={14} />
                                                                Bắt đầu
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCompleteTask(task)}
                                                                disabled={!canComplete || isBusy}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                                Hoàn thành
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                        <Wrench size={12} />
                                                        Không thể bắt đầu bước sau nếu bước trước chưa COMPLETED.
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}

                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
                        <AlertTriangle size={14} />
                        Lưu ý vận hành
                    </div>
                    <p className="mt-1">
                        Khi nhấn Hoàn thành, hệ thống tự sinh MaterialUsage và trừ kho theo định mức của dịch vụ.
                    </p>
                </section>
            </div>
        </div>
    );
}
