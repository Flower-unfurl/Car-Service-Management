import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    AlertTriangle,
    ArrowLeft,
    Camera,
    CheckCircle2,
    Circle,
    ClipboardCheck,
    Droplets,
    Fuel,
    Gauge,
    ShieldCheck,
    Wrench,
} from "lucide-react";
import { useUser } from "../hooks/UseUser";
import dispatchApi, { getErrorMessage } from "../services/dispatchApi";

const DAMAGE_AREA_LABELS = {
    FRONT_LEFT: "Truoc trai",
    FRONT_RIGHT: "Truoc phai",
    REAR_LEFT: "Sau trai",
    REAR_RIGHT: "Sau phai",
    HOOD: "Nap capo",
    TRUNK: "Cop sau",
    ROOF: "Noc xe",
    FRONT_BUMPER: "Cang truoc",
    REAR_BUMPER: "Cang sau",
    WINDSHIELD: "Kinh chan gio",
    REAR_GLASS: "Kinh sau",
    INTERIOR: "Noi that",
    OTHER: "Khac",
};

const DAMAGE_SEVERITY_STYLES = {
    MINOR: "bg-emerald-100 text-emerald-700",
    MODERATE: "bg-amber-100 text-amber-700",
    SEVERE: "bg-orange-100 text-orange-700",
    BROKEN: "bg-rose-100 text-rose-700",
    NEW: "bg-sky-100 text-sky-700",
};

const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN");
};

const normalizePhotos = (photos) => {
    if (!Array.isArray(photos)) return [];
    return photos.filter((photo) => typeof photo === "string" && photo.trim() !== "");
};

export default function InspectionDetailPage() {
    const { ticketId } = useParams();
    const { user } = useUser();

    const [ticket, setTicket] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchInspectionDetail = useCallback(async () => {
        if (!ticketId) return;

        setLoading(true);
        setError("");

        try {
            const [ticketRow, taskRows, progressRow] = await Promise.all([
                dispatchApi.getTicketById(ticketId),
                dispatchApi.getTasksByTicket(ticketId).catch(() => []),
                dispatchApi.getTicketProgress(ticketId).catch(() => null),
            ]);

            setTicket(ticketRow || null);
            setTasks(Array.isArray(taskRows) ? taskRows : []);
            setProgress(progressRow);
        } catch (err) {
            setError(getErrorMessage(err, "Khong the tai chi tiet dong kiem"));
        } finally {
            setLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchInspectionDetail();
    }, [fetchInspectionDetail]);

    const inspection = ticket?.inspection;
    const photos = normalizePhotos(inspection?.photos);

    const checklistItems = useMemo(() => {
        if (!inspection) return [];

        return [
            {
                id: "customerConfirmed",
                label: "Khach hang da xac nhan dong kiem",
                checked: Boolean(inspection.customerConfirmed),
            },
            {
                id: "customerSignature",
                label: "Da co chu ky khach hang",
                checked: Boolean(inspection.customerSignature),
            },
            {
                id: "photos",
                label: "Da chup anh hien trang",
                checked: photos.length > 0,
            },
            {
                id: "odometer",
                label: "Da ghi nhan so km",
                checked: Number.isFinite(Number(inspection.odometer)) && Number(inspection.odometer) > 0,
            },
            {
                id: "fuelLevel",
                label: "Da ghi nhan muc nhien lieu",
                checked: Number.isFinite(Number(inspection.fuelLevel)) && Number(inspection.fuelLevel) >= 0,
            },
            {
                id: "condition",
                label: "Da ghi chu tinh trang tong quat",
                checked: Boolean((inspection.condition || "").trim()),
            },
            {
                id: "damages",
                label: "Da danh dau diem hu hong/tray xuoc",
                checked: Array.isArray(inspection.damages) && inspection.damages.length > 0,
            },
        ];
    }, [inspection, photos.length]);

    const completedChecklist = checklistItems.filter((item) => item.checked).length;
    const checklistPercent = checklistItems.length
        ? Math.round((completedChecklist / checklistItems.length) * 100)
        : 0;

    const backLink = user?.role === "ADMIN" ? "/admin/dispatch" : "/staff/tasks";

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className="rounded-3xl bg-gradient-to-r from-[#123968] via-[#1e5aa0] to-[#2f80c7] p-6 text-white shadow-xl md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-100">
                                Inspection Detail
                            </p>
                            <h1 className="mt-2 text-2xl font-black uppercase tracking-wide md:text-3xl">
                                Dong kiem truoc khi thao tac dich vu
                            </h1>
                            <p className="mt-2 text-sm text-sky-100">
                                Luu vet hinh anh, checklist va diem hu hong de tranh tranh chap voi khach hang.
                            </p>
                        </div>

                        <Link
                            to={backLink}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/30"
                        >
                            <ArrowLeft size={16} />
                            Quay lai
                        </Link>
                    </div>
                </section>

                {loading ? (
                    <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                        Dang tai du lieu dong kiem...
                    </section>
                ) : error ? (
                    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                        {error}
                    </section>
                ) : !ticket ? (
                    <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                        Khong tim thay ticket.
                    </section>
                ) : (
                    <>
                        <section className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs text-slate-500">Bien so</p>
                                <p className="mt-1 text-xl font-black text-slate-900">{ticket.licensePlate || "N/A"}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs text-slate-500">Khach hang</p>
                                <p className="mt-1 text-sm font-bold text-slate-900">{ticket.customerName || "Khach le"}</p>
                                <p className="text-xs text-slate-600">{ticket.customerPhone || "Khong co SĐT"}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs text-slate-500">Check-in</p>
                                <p className="mt-1 text-sm font-bold text-slate-900">{formatDateTime(ticket.checkinAt)}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs text-slate-500">Tien do task</p>
                                <p className="mt-1 text-xl font-black text-[#1e5aa0]">
                                    {progress?.progressPercentage ?? 0}%
                                </p>
                                <p className="text-xs text-slate-600">
                                    {progress?.completed ?? 0}/{progress?.totalTasks ?? tasks.length} buoc hoan tat
                                </p>
                            </div>
                        </section>

                        {!inspection ? (
                            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
                                Ticket nay chua co du lieu dong kiem.
                            </section>
                        ) : (
                            <section className="grid gap-6 lg:grid-cols-[1.05fr_minmax(0,1fr)]">
                                <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <ClipboardCheck size={18} className="text-[#1e5aa0]" />
                                        <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                            Checklist dong kiem
                                        </h2>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                            <span>Muc do hoan thien checklist</span>
                                            <span>{checklistPercent}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-[#1e5aa0]"
                                                style={{ width: `${checklistPercent}%` }}
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-slate-600">
                                            {completedChecklist}/{checklistItems.length} tieu chi dat
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {checklistItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                                    item.checked
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                        : "border-slate-200 bg-slate-50 text-slate-700"
                                                }`}
                                            >
                                                {item.checked ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                                            <p className="text-xs text-slate-500">Odometer</p>
                                            <p className="font-bold text-slate-900">{inspection.odometer || 0} km</p>
                                        </div>
                                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                                            <p className="text-xs text-slate-500">Fuel level</p>
                                            <p className="font-bold text-slate-900">{inspection.fuelLevel || 0}%</p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-3 text-sm">
                                        <p className="text-xs text-slate-500">Ghi chu tinh trang xe</p>
                                        <p className="mt-1 font-medium text-slate-800">
                                            {inspection.condition || "Khong co ghi chu"}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            Nhan vien dong kiem: {inspection.inspectedBy?.name || "N/A"} • {formatDateTime(inspection.inspectedAt)}
                                        </p>
                                    </div>
                                </article>

                                <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Camera size={18} className="text-[#1e5aa0]" />
                                        <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                            Anh hien trang va diem hu hong
                                        </h2>
                                    </div>

                                    {photos.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                            {photos.map((photo, index) => (
                                                <div key={`${photo}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                                    <img
                                                        src={photo}
                                                        alt={`inspection-${index + 1}`}
                                                        className="h-36 w-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                                            Chua co anh hien trang duoc luu trong he thong.
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {(inspection.damages || []).length > 0 ? (
                                            inspection.damages.map((damage, index) => (
                                                <div key={`${damage.area}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {DAMAGE_AREA_LABELS[damage.area] || damage.area || "Khac"}
                                                        </p>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${DAMAGE_SEVERITY_STYLES[damage.severity] || "bg-slate-200 text-slate-700"}`}
                                                        >
                                                            {damage.severity || "N/A"}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-600">{damage.description || "Khong co mo ta"}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                                                Khong co diem hu hong/tray xuoc nao duoc ghi nhan.
                                            </div>
                                        )}
                                    </div>
                                </article>
                            </section>
                        )}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <Wrench size={18} className="text-[#1e5aa0]" />
                                <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                    Task lien quan ticket
                                </h2>
                            </div>

                            {tasks.length > 0 ? (
                                <div className="grid gap-2 md:grid-cols-2">
                                    {tasks
                                        .slice()
                                        .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
                                        .map((task) => (
                                            <div key={task._id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                                                <p className="font-bold text-slate-900">
                                                    Buoc {task.stepOrder}: {task.serviceId?.serviceName || "Dich vu"}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                    Trang thai: {task.status} • Nhan su: {task.assignedStaffId?.name || "Chua phan cong"}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                                    Chua co task cho ticket nay.
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
                            <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
                                <ShieldCheck size={14} />
                                Ghi chu nghiep vu
                            </div>
                            <p className="mt-1">
                                Du lieu dong kiem la can cu de doi chieu truoc/sau sua chua. Nen dam bao chup du anh va xac nhan voi khach hang truoc khi bat dau task dau tien.
                            </p>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
