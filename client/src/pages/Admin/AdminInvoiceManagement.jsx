import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, FileText, RefreshCw } from "lucide-react";
import { useUser } from "../../hooks/UseUser";
import dispatchApi, { getErrorMessage } from "../../services/dispatchApi";

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN");
};

export default function AdminInvoiceManagement() {
    const { user, loading: userLoading } = useUser();

    const [tickets, setTickets] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState("");

    const [invoiceBundle, setInvoiceBundle] = useState(null);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [confirmingPayment, setConfirmingPayment] = useState(false);

    const [includeParkingFee, setIncludeParkingFee] = useState(false);
    const [banner, setBanner] = useState({ type: "", message: "" });

    const serviceTickets = useMemo(() => {
        return tickets.filter((ticket) => ticket.ticketType === "SERVICE");
    }, [tickets]);

    const selectedTicket = useMemo(() => {
        return serviceTickets.find((row) => String(row._id) === String(selectedTicketId)) || null;
    }, [serviceTickets, selectedTicketId]);

    const fetchTickets = useCallback(async () => {
        setLoadingTickets(true);
        try {
            const rows = await dispatchApi.getTickets();
            const nextRows = Array.isArray(rows) ? rows : [];
            setTickets(nextRows);

            setSelectedTicketId((current) => {
                if (!nextRows.length) return "";

                const serviceRows = nextRows.filter((item) => item.ticketType === "SERVICE");
                if (!serviceRows.length) return "";

                if (current && serviceRows.some((item) => String(item._id) === String(current))) {
                    return current;
                }

                return serviceRows[0]._id;
            });
        } catch (error) {
            setBanner({
                type: "error",
                message: getErrorMessage(error, "Khong the tai danh sach ticket"),
            });
        } finally {
            setLoadingTickets(false);
        }
    }, []);

    const fetchInvoice = useCallback(async (ticketId) => {
        if (!ticketId) {
            setInvoiceBundle(null);
            return;
        }

        setLoadingInvoice(true);
        try {
            const data = await dispatchApi.getTicketInvoice(ticketId);
            setInvoiceBundle(data || null);
            setIncludeParkingFee(Boolean(data?.invoice?.includeParkingFee));
        } catch (error) {
            setInvoiceBundle(null);
            setBanner({
                type: "error",
                message: getErrorMessage(error, "Ticket nay chua co ServiceOrder"),
            });
        } finally {
            setLoadingInvoice(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    useEffect(() => {
        if (!selectedTicketId) return;
        fetchInvoice(selectedTicketId);
    }, [selectedTicketId, fetchInvoice]);

    const invoice = invoiceBundle?.invoice;
    const ticket = invoiceBundle?.ticket || selectedTicket;

    const computedTotal = useMemo(() => {
        const totalServiceFee = Number(invoice?.totalServiceFee || 0);
        const parkingFee = includeParkingFee ? Number(invoice?.parkingFee || 0) : 0;
        return totalServiceFee + parkingFee;
    }, [invoice?.totalServiceFee, invoice?.parkingFee, includeParkingFee]);

    const guestInvoiceUrl = useMemo(() => {
        if (!ticket?.qrToken) return "";
        return `http://localhost:5000/ticket/guest/${ticket.qrToken}/invoice`;
    }, [ticket?.qrToken]);

    const handleSaveDraft = async () => {
        if (!selectedTicketId) return;

        setSavingDraft(true);
        try {
            const updatedInvoice = await dispatchApi.updateInvoiceDraft(selectedTicketId, includeParkingFee);
            setInvoiceBundle((prev) => ({
                ticket: prev?.ticket || ticket,
                invoice: updatedInvoice,
            }));
            setBanner({ type: "success", message: "Da cap nhat invoice draft" });
        } catch (error) {
            setBanner({
                type: "error",
                message: getErrorMessage(error, "Khong the cap nhat invoice draft"),
            });
        } finally {
            setSavingDraft(false);
        }
    };

    const handleConfirmInvoice = async () => {
        if (!selectedTicketId) return;

        setConfirming(true);
        try {
            const confirmedInvoice = await dispatchApi.confirmInvoice(selectedTicketId);
            setInvoiceBundle((prev) => ({
                ticket: prev?.ticket || ticket,
                invoice: confirmedInvoice,
            }));
            setBanner({
                type: "success",
                message: "Da xac nhan hoa don va cong khai cho guest theo QR",
            });
        } catch (error) {
            setBanner({
                type: "error",
                message: getErrorMessage(error, "Khong the xac nhan hoa don"),
            });
        } finally {
            setConfirming(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!selectedTicketId) return;

        setConfirmingPayment(true);
        try {
            const paidInvoice = await dispatchApi.confirmInvoicePayment(selectedTicketId);
            setInvoiceBundle((prev) => ({
                ticket: prev?.ticket || ticket,
                invoice: paidInvoice,
            }));
            setBanner({
                type: "success",
                message: "Da xac nhan khach hang thanh toan tien mat",
            });
        } catch (error) {
            setBanner({
                type: "error",
                message: getErrorMessage(error, "Khong the xac nhan thanh toan"),
            });
        } finally {
            setConfirmingPayment(false);
        }
    };

    if (!userLoading && user?.role !== "ADMIN") {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                Ban khong co quyen truy cap man hinh hoa don.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-3xl bg-gradient-to-r from-[#123968] via-[#1e5aa0] to-[#2f80c7] p-6 text-white shadow-xl md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">
                            Invoice Control
                        </p>
                        <h1 className="mt-2 text-2xl font-black uppercase tracking-wide md:text-3xl">
                            Draft va Confirm hoa don
                        </h1>
                        <p className="mt-2 text-sm text-sky-100">
                            Ap dung cho phieu SERVICE da co ServiceOrder. Admin co the tinh phi gui xe va cong khai hoa don theo QR.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchTickets}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/30"
                    >
                        <RefreshCw size={16} />
                        Lam moi
                    </button>
                </div>
            </section>

            {banner.message && (
                <section
                    className={`rounded-xl border px-4 py-3 text-sm ${
                        banner.type === "error"
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                >
                    {banner.message}
                </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Chon ticket SERVICE
                </label>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <select
                        value={selectedTicketId}
                        onChange={(event) => setSelectedTicketId(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#1e5aa0]"
                        disabled={loadingTickets || serviceTickets.length === 0}
                    >
                        {serviceTickets.length === 0 ? (
                            <option value="">Khong co ticket SERVICE</option>
                        ) : (
                            serviceTickets.map((row) => (
                                <option key={row._id} value={row._id}>
                                    {row.licensePlate} - {row.customerName || "Khach le"} ({row.status})
                                </option>
                            ))
                        )}
                    </select>

                    {ticket?.qrToken && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            QR: {ticket.qrToken}
                        </span>
                    )}
                </div>
            </section>

            {loadingInvoice ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    Dang tai du lieu invoice...
                </section>
            ) : !invoice ? (
                <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    Chon ticket de xem invoice draft.
                </section>
            ) : (
                <section className="grid gap-6 lg:grid-cols-[1.2fr_minmax(0,1fr)]">
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-[#1e5aa0]" />
                            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                                Chi tiet dich vu
                            </h2>
                        </div>

                        <div className="space-y-2">
                            {(invoice.services || []).map((item, index) => (
                                <div
                                    key={`${item.serviceId || index}`}
                                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                                >
                                    <span className="font-semibold text-slate-800">{item.serviceNameSnapshot || item.serviceId?.serviceName || "Dich vu"}</span>
                                    <span className="text-slate-500">x{item.quantity || 1}</span>
                                    <span className="font-bold text-slate-900">{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                            Trang thai ticket: <b>{ticket?.status || "-"}</b> • Invoice: <b>{invoice.invoiceStatus}</b> • Payment: <b>{invoice.paymentStatus}</b>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-slate-800">
                            Tong hoa don
                        </h2>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Tong phi dich vu</span>
                                <span className="font-bold text-slate-900">{formatCurrency(invoice.totalServiceFee)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Phi gui xe</span>
                                <span className="font-bold text-slate-900">{formatCurrency(invoice.parkingFee)}</span>
                            </div>
                            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={includeParkingFee}
                                    onChange={(event) => setIncludeParkingFee(event.target.checked)}
                                    disabled={invoice.invoiceStatus === "CONFIRMED"}
                                />
                                Tinh phi gui xe vao hoa don
                            </label>

                            <div className="mt-3 border-t border-slate-200 pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-700">Tong thanh toan</span>
                                    <span className="text-xl font-black text-[#1e5aa0]">{formatCurrency(computedTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-2">
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={savingDraft || invoice.invoiceStatus === "CONFIRMED"}
                                className="rounded-xl bg-[#1e5aa0] px-4 py-2 text-sm font-bold text-white hover:bg-[#16487e] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {savingDraft ? "Dang luu..." : "Luu draft"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmInvoice}
                                disabled={confirming || invoice.invoiceStatus === "CONFIRMED"}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <CheckCircle2 size={16} />
                                {confirming ? "Dang xac nhan..." : "Xac nhan hoa don"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmPayment}
                                disabled={confirmingPayment || invoice.paymentStatus === "PAID"}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <CheckCircle2 size={16} />
                                {confirmingPayment
                                    ? "Dang cap nhat..."
                                    : invoice.paymentStatus === "PAID"
                                        ? "Da thanh toan"
                                        : "Xac nhan da thu tien mat"}
                            </button>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                            Xac nhan luc: <b>{formatDateTime(invoice.invoiceConfirmedAt)}</b>
                        </div>

                        <div className="mt-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-700">
                            <p className="font-bold">Guest tracking</p>
                            <p className="mt-1 break-all">{guestInvoiceUrl || "Chua co QR token"}</p>
                            {guestInvoiceUrl && (
                                <a
                                    href={guestInvoiceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex items-center gap-1 font-bold underline"
                                >
                                    <ExternalLink size={12} />
                                    Mo public invoice endpoint
                                </a>
                            )}
                        </div>
                    </article>
                </section>
            )}
        </div>
    );
}
