import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";

const API_BASE = "http://localhost:5000";

const defaultFormData = {
    materialName: "",
    unit: "Cái",
    stockQuantity: 0,
    minAlertLevel: 10,
    category: "",
    imageUrl: "",
};

const unitOptions = ["Chai", "Lít", "Cái", "Bộ", "Thùng"];

const extractArrayData = (response) => {
    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
        return response.data.data;
    }

    return [];
};

const toAbsoluteImageUrl = (value) => {
    if (!value || typeof value !== "string") {
        return "";
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    return `${API_BASE}${value.startsWith("/") ? value : `/${value}`}`;
};

export default function MaterialList() {
    const [materials, setMaterials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState(defaultFormData);
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);

    const [banner, setBanner] = useState({ type: "", message: "" });

    const categoryRefs = useRef({});

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setBanner({ type: "", message: "" });

            const [materialsResponse, categoriesResponse] = await Promise.all([
                axios.get(`${API_BASE}/materials`, { withCredentials: true }),
                axios.get(`${API_BASE}/material-categories`, { withCredentials: true }),
            ]);

            setMaterials(extractArrayData(materialsResponse));
            setCategories(extractArrayData(categoriesResponse));
        } catch (error) {
            setBanner({
                type: "error",
                message: error?.response?.data?.message || "Không thể tải dữ liệu vật tư.",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const resetModalState = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData(defaultFormData);
        setSelectedImageFile(null);
        setImagePreview("");
        setRemoveCurrentImage(false);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ ...defaultFormData, category: categories[0]?.name || "" });
        setSelectedImageFile(null);
        setImagePreview("");
        setRemoveCurrentImage(false);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            materialName: item.materialName || "",
            unit: item.unit || "Cái",
            stockQuantity: item.stockQuantity || 0,
            minAlertLevel: item.minAlertLevel || 10,
            category: item.category || "",
            imageUrl: "",
        });
        setSelectedImageFile(null);
        setImagePreview(item.imageUrl || "");
        setRemoveCurrentImage(false);
        setShowModal(true);
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setSelectedImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setRemoveCurrentImage(false);
        setFormData((prev) => ({ ...prev, imageUrl: "" }));
    };

    const handleSubmit = async () => {
        try {
            if (!formData.materialName.trim()) {
                setBanner({ type: "error", message: "Tên vật tư là bắt buộc." });
                return;
            }

            if (!formData.category.trim()) {
                setBanner({ type: "error", message: "Vui lòng chọn category cho vật tư." });
                return;
            }

            setSaving(true);
            setBanner({ type: "", message: "" });

            const payload = new FormData();
            payload.append("materialName", formData.materialName.trim());
            payload.append("unit", formData.unit);
            payload.append("stockQuantity", String(Number(formData.stockQuantity) || 0));
            payload.append("minAlertLevel", String(Number(formData.minAlertLevel) || 0));
            payload.append("category", formData.category.trim());
            payload.append("imageUrl", formData.imageUrl.trim());
            payload.append("removeImage", removeCurrentImage ? "true" : "false");

            if (selectedImageFile) {
                payload.append("image", selectedImageFile);
            }

            if (editingId) {
                await axios.put(`${API_BASE}/materials/${editingId}`, payload, { withCredentials: true });
                setBanner({ type: "success", message: "Cập nhật vật tư thành công." });
            } else {
                await axios.post(`${API_BASE}/materials`, payload, { withCredentials: true });
                setBanner({ type: "success", message: "Thêm vật tư thành công." });
            }

            resetModalState();
            fetchData();
        } catch (error) {
            setBanner({
                type: "error",
                message: error?.response?.data?.message || "Không thể lưu vật tư.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa vật tư này?")) {
            return;
        }

        try {
            await axios.delete(`${API_BASE}/materials/${id}`, { withCredentials: true });
            setBanner({ type: "success", message: "Đã xóa vật tư." });
            fetchData();
        } catch (error) {
            setBanner({
                type: "error",
                message: error?.response?.data?.message || "Không thể xóa vật tư.",
            });
        }
    };

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) {
            return;
        }

        try {
            setCreatingCategory(true);
            const response = await axios.post(`${API_BASE}/material-categories`, { name }, { withCredentials: true });
            const created = response?.data?.data || response?.data;

            setCategories((prev) => {
                const exists = prev.some((item) => item.name === created?.name);
                if (exists || !created) return prev;
                return [created, ...prev];
            });

            setFormData((prev) => ({ ...prev, category: created?.name || prev.category }));
            setNewCategoryName("");
            setShowCategoryForm(false);
            setBanner({ type: "success", message: "Đã thêm category mới." });
        } catch (error) {
            setBanner({
                type: "error",
                message: error?.response?.data?.message || "Không thể thêm category.",
            });
        } finally {
            setCreatingCategory(false);
        }
    };

    const scrollToCategory = (name) => {
        categoryRefs.current[name]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const filteredMaterials = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return materials;

        return materials.filter((item) => {
            const source = [item.materialName, item.category, item.unit].join(" ").toLowerCase();
            return source.includes(keyword);
        });
    }, [materials, search]);

    const groupedMaterials = useMemo(() => {
        const map = new Map();

        categories.forEach((category) => {
            map.set(category.name, []);
        });

        filteredMaterials.forEach((item) => {
            const key = item.category?.trim() || "Chưa phân loại";
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(item);
        });

        return Array.from(map.entries());
    }, [categories, filteredMaterials]);

    const totalLowStock = useMemo(
        () => materials.filter((item) => Number(item.stockQuantity) <= Number(item.minAlertLevel)).length,
        [materials],
    );

    if (loading) {
        return <div className="mt-10 text-center">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <aside className="sticky top-0 h-screen w-72 border-r border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#1e5aa0]">Categories</h3>
                    <button
                        onClick={() => setShowCategoryForm((prev) => !prev)}
                        className="rounded-md bg-[#1e5aa0] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#174d8a]"
                    >
                        + Add
                    </button>
                </div>

                {showCategoryForm ? (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <input
                            value={newCategoryName}
                            onChange={(event) => setNewCategoryName(event.target.value)}
                            placeholder="Tên category mới"
                            className="mb-2 w-full rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-[#1e5aa0]"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowCategoryForm(false);
                                    setNewCategoryName("");
                                }}
                                className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                disabled={creatingCategory}
                                className="rounded bg-[#1e5aa0] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#174d8a] disabled:opacity-60"
                            >
                                {creatingCategory ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="space-y-1 overflow-y-auto pr-1">
                    {groupedMaterials
                        .filter(([name]) => name !== "Chưa phân loại")
                        .map(([name, list]) => (
                            <button
                                key={name}
                                onClick={() => scrollToCategory(name)}
                                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100"
                            >
                                <span>{name}</span>
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">{list.length}</span>
                            </button>
                        ))}

                    {groupedMaterials.some(([name]) => name === "Chưa phân loại") ? (
                        <button
                            onClick={() => scrollToCategory("Chưa phân loại")}
                            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100"
                        >
                            <span>Chưa phân loại</span>
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">
                                {groupedMaterials.find(([name]) => name === "Chưa phân loại")?.[1].length || 0}
                            </span>
                        </button>
                    ) : null}
                </div>
            </aside>

            <main className="flex-1 p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1e5aa0]">Material Inventory</h2>
                        <p className="text-sm text-slate-500">
                            Tổng vật tư: {materials.length} • Cảnh báo sắp hết: {totalLowStock}
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#1e5aa0] px-4 py-2 text-sm font-bold text-white hover:bg-[#174d8a]"
                    >
                        <Plus size={16} /> Thêm vật tư
                    </button>
                </div>

                {banner.message ? (
                    <div
                        className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                            banner.type === "error"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                    >
                        {banner.message}
                    </div>
                ) : null}

                <div className="mb-6 flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <Search size={16} className="text-slate-400" />
                    <input
                        placeholder="Tìm theo tên vật tư, category, đơn vị..."
                        className="w-full text-sm outline-none"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                {groupedMaterials.map(([categoryName, list]) => {
                    if (!list.length) {
                        return null;
                    }

                    return (
                        <section
                            key={categoryName}
                            ref={(el) => {
                                categoryRefs.current[categoryName] = el;
                            }}
                            className="mb-8"
                        >
                            <h3 className="mb-4 border-b border-slate-200 pb-2 text-lg font-bold text-[#1e5aa0]">
                                {categoryName}
                            </h3>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {list.map((item) => {
                                    const isLowStock = Number(item.stockQuantity) <= Number(item.minAlertLevel);
                                    const imageSrc = toAbsoluteImageUrl(item.imageUrl);

                                    return (
                                        <article
                                            key={item._id}
                                            className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
                                                isLowStock ? "border-red-300" : "border-slate-200"
                                            }`}
                                        >
                                            <div className="h-36 bg-slate-100">
                                                {imageSrc ? (
                                                    <img
                                                        src={imageSrc}
                                                        alt={item.materialName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                        Chưa có hình ảnh
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 p-4">
                                                <h4 className="line-clamp-2 text-base font-bold text-slate-800">
                                                    {item.materialName}
                                                </h4>
                                                <p className="text-xs text-slate-500">
                                                    Category: {item.category || "Chưa phân loại"}
                                                </p>
                                                <p className="text-xs text-slate-500">Đơn vị: {item.unit}</p>
                                                <p className="text-sm">
                                                    Tồn kho: <b>{item.stockQuantity}</b>
                                                </p>
                                                <p className="text-xs text-slate-500">Mức cảnh báo: {item.minAlertLevel}</p>

                                                <div>
                                                    {isLowStock ? (
                                                        <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                                            Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                                            In Stock
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="rounded bg-amber-400 p-1.5 text-slate-900 hover:bg-amber-500"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </main>

            {showModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingId ? "Cập nhật vật tư" : "Thêm vật tư mới"}
                            </h3>
                            <button
                                onClick={resetModalState}
                                className="rounded p-1 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Tên vật tư</span>
                                <input
                                    value={formData.materialName}
                                    onChange={(event) =>
                                        setFormData((prev) => ({ ...prev, materialName: event.target.value }))
                                    }
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e5aa0]"
                                    placeholder="Ví dụ: Dầu nhớt tổng hợp"
                                />
                            </label>

                            <label>
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Category</span>
                                <select
                                    value={formData.category}
                                    onChange={(event) =>
                                        setFormData((prev) => ({ ...prev, category: event.target.value }))
                                    }
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e5aa0]"
                                >
                                    <option value="">-- Chọn Category --</option>
                                    {categories.map((item) => (
                                        <option key={item._id} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Đơn vị</span>
                                <select
                                    value={formData.unit}
                                    onChange={(event) =>
                                        setFormData((prev) => ({ ...prev, unit: event.target.value }))
                                    }
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e5aa0]"
                                >
                                    {unitOptions.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Số lượng tồn</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stockQuantity}
                                    onChange={(event) =>
                                        setFormData((prev) => ({ ...prev, stockQuantity: Number(event.target.value) }))
                                    }
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e5aa0]"
                                />
                            </label>

                            <label>
                                <span className="mb-1 block text-xs font-semibold text-slate-600">Ngưỡng cảnh báo</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.minAlertLevel}
                                    onChange={(event) =>
                                        setFormData((prev) => ({ ...prev, minAlertLevel: Number(event.target.value) }))
                                    }
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e5aa0]"
                                />
                            </label>

                            <label className="sm:col-span-2">
                                <span className="mb-1 block text-xs font-semibold text-slate-600">
                                    Hình ảnh (upload từ máy)
                                </span>
                                <div className="flex items-center gap-3">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                                        <ImagePlus size={15} /> Chọn ảnh
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>

                                    <input
                                        value={formData.imageUrl}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, imageUrl: event.target.value }))
                                        }
                                        placeholder="Hoặc dán URL ảnh (https://...)"
                                        className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e5aa0]"
                                    />
                                </div>
                            </label>
                        </div>

                        {(imagePreview || formData.imageUrl) && !removeCurrentImage ? (
                            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="mb-2 text-xs font-semibold text-slate-600">Preview ảnh</p>
                                <img
                                    src={toAbsoluteImageUrl(formData.imageUrl) || imagePreview}
                                    alt="preview"
                                    className="h-36 w-full rounded object-cover"
                                />
                                <div className="mt-2 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setRemoveCurrentImage(true);
                                            setSelectedImageFile(null);
                                            setImagePreview("");
                                            setFormData((prev) => ({ ...prev, imageUrl: "" }));
                                        }}
                                        className="text-xs text-red-600 hover:underline"
                                    >
                                        Xóa ảnh hiện tại
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={resetModalState}
                                className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="rounded bg-[#1e5aa0] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#174d8a] disabled:opacity-60"
                            >
                                {saving ? "Đang lưu..." : "Lưu vật tư"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
