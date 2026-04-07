import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    Clock3,
    FileText,
    Search,
    ShieldCheck,
    Wrench,
} from "lucide-react";
import dispatchApi, { getErrorMessage } from "../services/dispatchApi";
import TaskStatusBadge from "../components/dispatch/TaskStatusBadge";

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

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return amount.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
    });
};

export default function GuestTrackingPage() {
    const [tokenInput, setTokenInput] = useState("");
    const [activeToken, setActiveToken] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [progress, setProgress] = useState(emptyProgress);
    const [tasks, setTasks] = useState([]);
    const [materialUsage, setMaterialUsage] = useState([]);
    const [invoiceBundle, setInvoiceBundle] = useState(null);

    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

    const fetchGuestData = useCallback(async (qrToken, { silent = false } = {}) => {
        if (!qrToken) return;

        if (!silent) {
            setLoading(true);
        }

        try {
            const invoicePromise = dispatchApi.getGuestInvoiceByQrToken(qrToken).catch((err) => {
                if (err?.response?.status === 404) {
                    return null;
                }
                throw err;
            });

            const [progressRow, taskRows, materialRows, invoiceRow] = await Promise.all([
                dispatchApi.getGuestProgressByQrToken(qrToken),
                dispatchApi.getGuestTasksByQrToken(qrToken),
                dispatchApi.getGuestMaterialUsageByQrToken(qrToken),
                invoicePromise,
            ]);

            setError("");
            setProgress(progressRow || emptyProgress);
            setTasks(Array.isArray(taskRows) ? taskRows : []);
            setMaterialUsage(Array.isArray(materialRows) ? materialRows : []);
            setInvoiceBundle(invoiceRow || null);
            setLastUpdatedAt(new Date());
        } catch (err) {
            setProgress(emptyProgress);
            setTasks([]);
            setMaterialUsage([]);
            setInvoiceBundle(null);
            setError(
                getErrorMessage(
                    err,
                    "Khong tim thay ticket. Vui long kiem tra lai ma theo doi.",
                ),
            );
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!activeToken) return;

        const timer = setInterval(() => {
            fetchGuestData(activeToken, { silent: true });
        }, 15000);

        return () => clearInterval(timer);
    }, [activeToken, fetchGuestData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = tokenInput.trim();

        if (!token) {
            setError("Vui long nhap ma theo doi ticket.");
            return;
        }

        setActiveToken(token);
        await fetchGuestData(token);
    };

    const invoice = invoiceBundle?.invoice;
    const invoiceTicket = invoiceBundle?.ticket;

    const paymentBadge = useMemo(() => {
        if (!invoice) {
            return {
                label: "CHO HOA DON",
                style: "bg-amber-100 text-amber-700",
            };
        }

        if (invoice.paymentStatus === "PAID") {
            return {
                label: "DA THANH TOAN",
                style: "bg-emerald-100 text-emerald-700",
            };
        }

        return {
            label: "CHUA THANH TOAN",
            style: "bg-rose-100 text-rose-700",
        };
    }, [invoice]);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className="rounded-3xl bg-gradient-to-r from-[#123968] via-[#1e5aa0] to-[#2f80c7] p-6 text-white shadow-xl md:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-100">
                        Guest Tracking Portal
                    </p>
                    <h1 className="mt-2 text-2xl font-black uppercase tracking-wide md:text-3xl">
                        Theo doi tien trinh dich vu va hoa don
                    </h1>
                    <p className="mt-2 text-sm text-sky-100">
                        Nhap ma ticket/QR token de xem tien do xu ly, trang thai thanh toan va hoa don.
                    </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_auto]">
                        <label className="relative block">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                value={tokenInput}
                                onChange={(event) => setTokenInput(event.target.value)}
                                placeholder="Nhap QR token / ma ticket"
                                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none ring-offset-2 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-[#1e5aa0] px-5 py-2 text-sm font-bold text-white hover:bg-[#164a85] disabled:opacity-60"
                        >
                            {loading ? "Dang tai..." : "Tra cuu"}
                        </button>
                    </form>

                    {lastUpdatedAt ? (
                        <p className="mt-3 text-xs text-slate-500">
                            Cap nhat luc: {formatDateTime(lastUpdatedAt)}
                        </p>
                    ) : null}
                </section>

                {error ? (
                    <section className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </section>
                ) : null}

                {!activeToken ? (
                    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                        Vui long nhap ma theo doi de xem thong tin ticket.
                    </section>
                ) : (
                    <>
                        <section className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs text-slate-500">Tien do</p>
                                <p className="mt-1 text-2xl font-black text-[#1e5aa0]">
                                    {progress.progressPercentage || 0}%
                                </p>
                                <p className="text-xs text-slate-600">
                                    {progress.completed || 0}/{progress.totalTasks || 0} buoc hoan tat
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs text-slate-500">Task dang xu ly</p>
                                <p className="mt-1 text-2xl font-black text-sky-600">{progress.inProgress || 0}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs text-slate-500">Trang thai hoa don</p>
                                <p className="mt-1 text-sm font-black text-slate-900">
                                    {invoice?.invoiceStatus || "CHUA CONG KHAI"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs text-slate-500">Thanh toan</p>
                                <span
                                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${paymentBadge.style}`}
                                >
                                    {paymentBadge.label}
                                </span>
                            </div>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[1.2fr_minmax(0,1fr)]">
                            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-2">
                                    <Wrench size={18} className="text-[#1e5aa0]" />
                                    <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                        Tien trinh dich vu
                                    </h2>
                                </div>

                                {tasks.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                                        Chua co task nao duoc tao cho ticket nay.
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
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-500">
                                                                Buoc {task.stepOrder}
                                                            </p>
                                                            <p className="font-black text-slate-900">
                                                                {task.serviceId?.serviceName || "Dich vu"}
                                                            </p>
                                                            <p className="text-xs text-slate-600">
                                                                Ky thuat vien: {task.assignedStaffId?.name || "Dang cap nhat"}
                                                            </p>
                                                        </div>
                                                        <TaskStatusBadge status={task.status} />
                                                    </div>

                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Bat dau: {formatDateTime(task.startTime)} • Hoan thanh: {formatDateTime(task.endTime)}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </article>

                            <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className="text-[#1e5aa0]" />
                                    <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                        Hoa don va thanh toan
                                    </h2>
                                </div>

                                {!invoice ? (
                                    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
                                        Hoa don chua duoc admin xac nhan. Vui long quay lai sau.
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            {(invoice.services || []).map((item, index) => (
                                                <div
                                                    key={`${item.serviceId || index}`}
                                                    className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                                                >
                                                    <span className="font-semibold text-slate-800">
                                                        {item.serviceName || "Dich vu"} x{item.quantity || 1}
                                                    </span>
                                                    <span className="font-bold text-slate-900">
                                                        {formatCurrency(item.lineTotal)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600">Tong phi dich vu</span>
                                                <span className="font-bold text-slate-900">{formatCurrency(invoice.totalServiceFee)}</span>
                                            </div>
                                            <div className="mt-1 flex items-center justify-between">
                                                <span className="text-slate-600">Phi gui xe</span>
                                                <span className="font-bold text-slate-900">{formatCurrency(invoice.parkingFee)}</span>
                                            </div>
                                            <div className="mt-1 flex items-center justify-between">
                                                <span className="text-slate-600">Tong thanh toan</span>
                                                <span className="text-lg font-black text-[#1e5aa0]">
                                                    {formatCurrency(invoice.totalAmount)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                                            Bien so: <b>{invoiceTicket?.licensePlate || "N/A"}</b> • Trang thai ticket: <b>{invoiceTicket?.status || "N/A"}</b>
                                        </div>

                                        {invoice.paymentStatus === "PAID" ? (
                                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                                <div className="flex items-center gap-2 font-bold">
                                                    <CheckCircle2 size={16} />
                                                    Da thanh toan
                                                </div>
                                                <p className="mt-1 text-xs">
                                                    Hoa don cua ban da duoc xac nhan thanh toan. Cam on ban da su dung dich vu.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
                                                <div className="flex items-center gap-2 font-bold">
                                                    <Clock3 size={16} />
                                                    San sang thanh toan
                                                </div>
                                                <p className="mt-1 text-xs">
                                                    Vui long den quay de thanh toan. Nhan vien se cap nhat trang thai giao dich sau khi thu ngan.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </article>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-[#1e5aa0]" />
                                <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                    Nhat ky vat tu
                                </h2>
                            </div>

                            {materialUsage.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                                    Chua co ban ghi su dung vat tu.
                                </div>
                            ) : (
                                <div className="grid gap-2 md:grid-cols-2">
                                    {materialUsage.map((usage) => (
                                        <div
                                            key={usage._id}
                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                                        >
                                            <p className="font-bold text-slate-900">
                                                {usage.materialId?.materialName || "Vat tu"}
                                            </p>
                                            <p className="text-slate-600">
                                                Su dung: {usage.quantityUsed} {usage.materialId?.unit || "don vi"}
                                            </p>
                                            <p className="text-slate-500">Thoi diem: {formatDateTime(usage.date)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
