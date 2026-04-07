const STATUS_STYLES = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    IN_PROGRESS: "bg-sky-100 text-sky-800 border-sky-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function TaskStatusBadge({ status }) {
    const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-700 border-gray-200";

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${style}`}>
            {status || "UNKNOWN"}
        </span>
    );
}
