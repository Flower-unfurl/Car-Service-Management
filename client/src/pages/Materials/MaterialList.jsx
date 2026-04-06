import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export default function MaterialList() {
    const [materials, setMaterials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        materialName: "",
        unit: "Cái",
        stockQuantity: 0,
        minAlertLevel: 10,
        category: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const categoryRefs = useRef({}); // dùng để scroll

    // ================= FETCH =================
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const [mRes, cRes] = await Promise.all([
                axios.get("http://localhost:5000/materials"),
                axios.get("http://localhost:5000/material-categories")
            ]);

            setMaterials(mRes.data);
            setCategories(cRes.data);
        } catch (err) {
            alert("Load thất bại");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ================= ADD / UPDATE =================
    const handleSubmit = async () => {
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/materials/${editingId}`, formData);
            } else {
                await axios.post("http://localhost:5000/materials", formData);
            }

            setShowModal(false);
            setEditingId(null);
            setFormData({
                materialName: "",
                unit: "Cái",
                stockQuantity: 0,
                minAlertLevel: 10,
                category: ""
            });

            fetchData();
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        if (!window.confirm("Xóa vật tư này?")) return;

        await axios.delete(`http://localhost:5000/materials/${id}`);
        fetchData();
    };

    // ================= EDIT =================
    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData(item);
        setShowModal(true);
    };

    // ================= SCROLL =================
    const scrollToCategory = (name) => {
        categoryRefs.current[name]?.scrollIntoView({
            behavior: "smooth"
        });
    };

    // ================= FILTER =================
    const filtered = materials.filter(m =>
        m.materialName.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="flex">

            {/* SIDEBAR */}
            <div className="w-64 bg-white shadow p-4 sticky top-0 h-screen">
                <h3 className="font-semibold mb-4 text-[#1e5aa0]">Categories</h3>

                {categories.map(c => (
                    <div
                        key={c._id}
                        onClick={() => scrollToCategory(c.name)}
                        className="cursor-pointer py-2 px-2 hover:bg-gray-100 rounded"
                    >
                        {c.name}
                    </div>
                ))}
            </div>

            {/* MAIN */}
            <div className="flex-1 p-6 bg-gray-50">

                {/* HEADER */}
                <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[#1e5aa0]">
                        Material Inventory
                    </h2>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#1e5aa0] text-white px-4 py-2 rounded flex gap-2"
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>

                {/* SEARCH */}
                <div className="mb-6 bg-white p-3 rounded shadow w-1/3 flex gap-2">
                    <Search size={16} />
                    <input
                        placeholder="Search..."
                        className="outline-none w-full"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* CATEGORY SECTION */}
                {categories.map(cat => {
                    const list = filtered.filter(m => m.category === cat.name);

                    if (list.length === 0) return null;

                    return (
                        <div key={cat._id} ref={el => categoryRefs.current[cat.name] = el}>

                            <h3 className="text-lg font-semibold mb-4 text-[#1e5aa0] border-b pb-2">
                                {cat.name}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                                {list.map(item => {
                                    const isLow = item.stockQuantity <= item.minAlertLevel;

                                    return (
                                        <div
                                            key={item._id}
                                            className={`bg-white p-4 rounded shadow ${isLow ? "border border-red-400" : ""}`}
                                        >
                                            <h4 className="font-semibold">{item.materialName}</h4>

                                            <p className="text-sm text-gray-500">{item.category}</p>

                                            <p className="mt-2 text-sm">
                                                Stock: <b>{item.stockQuantity}</b>
                                            </p>

                                            <div className="mt-2">
                                                {isLow ? (
                                                    <span className="text-red-500 text-xs">Low Stock</span>
                                                ) : (
                                                    <span className="text-green-500 text-xs">In Stock</span>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => handleEdit(item)} className="bg-yellow-400 p-1 rounded">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="bg-red-500 p-1 rounded text-white">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-[400px]">

                        <h3 className="mb-4">{editingId ? "Edit" : "Add"} Material</h3>

                        <input
                            placeholder="Name"
                            className="w-full border p-2 mb-2"
                            value={formData.materialName}
                            onChange={e => setFormData({ ...formData, materialName: e.target.value })}
                        />

                        {/* CATEGORY SELECT */}
                        <select
                            className="w-full border p-2 mb-2"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">-- Select Category --</option>
                            {categories.map(c => (
                                <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Stock"
                            className="w-full border p-2 mb-2"
                            value={formData.stockQuantity}
                            onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                        />

                        <input
                            type="number"
                            placeholder="Min Alert"
                            className="w-full border p-2 mb-2"
                            value={formData.minAlertLevel}
                            onChange={e => setFormData({ ...formData, minAlertLevel: Number(e.target.value) })}
                        />

                        <select
                            className="w-full border p-2 mb-3"
                            value={formData.unit}
                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                        >
                            <option>Chai</option>
                            <option>Lít</option>
                            <option>Cái</option>
                            <option>Bộ</option>
                            <option>Thùng</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                            <button onClick={handleSubmit} className="bg-blue-500 text-white px-3 py-1 rounded">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}