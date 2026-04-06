import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, RefreshCcw, MapPin, Gauge } from "lucide-react";

export default function AdminZoneManagement() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingZone, setEditingZone] = useState(null); // null if creating
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ zoneName: "", capacity: 1, status: "AVAILABLE" });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/zone", { withCredentials: true });
      setZones(res.data.data);
    } catch (err) {
      setError("Failed to load zones. Make sure you are an Admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingZone) {
        await axios.put(`http://localhost:5000/zone/${editingZone._id}`, formData, { withCredentials: true });
      } else {
        await axios.post("http://localhost:5000/zone", formData, { withCredentials: true });
      }
      setShowModal(false);
      fetchZones();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/zone/${id}`, { withCredentials: true });
      fetchZones();
    } catch (err) {
      setError("Delete failed");
    }
  };

  const openForm = (zone = null) => {
    setError("");
    if (zone) {
      setEditingZone(zone);
      setFormData({ zoneName: zone.zoneName, capacity: zone.capacity, status: zone.status });
    } else {
      setEditingZone(null);
      setFormData({ zoneName: "", capacity: 1, status: "AVAILABLE" });
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
              <MapPin className="text-[#1e5aa0]" size={32} /> Zone Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">Configure service bays and parking areas</p>
          </div>
          <button
            onClick={() => openForm()}
            className="bg-[#1e5aa0] hover:bg-[#164a85] text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition shadow-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add New Zone
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Zone Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Occupancy</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                        <RefreshCcw className="animate-spin inline-block mr-2" size={18} /> Loading...
                    </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No zones configured</td></tr>
              ) : (
                zones.map((zone) => (
                  <tr key={zone._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{zone.zoneName}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{zone.capacity} slots</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${zone.occupied >= zone.capacity ? 'bg-red-500' : 'bg-[#1e5aa0]'}`}
                            style={{ width: `${Math.min((zone.occupied / zone.capacity) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500">{zone.occupied}/{zone.capacity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        zone.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        zone.status === "FULL" ? "bg-red-50 text-red-600 border border-red-100" :
                        "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}>
                        {zone.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openForm(zone)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(zone._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#1e5aa0] to-[#123968] p-6 text-white">
                <h2 className="text-xl font-black uppercase tracking-tight">{editingZone ? "Edit Zone" : "New Zone"}</h2>
                <p className="text-blue-100 text-xs mt-1">Configure slot availability and naming</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Zone Name</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e5aa0]/20 focus:border-[#1e5aa0] transition uppercase font-bold tracking-wider"
                  value={formData.zoneName}
                  onChange={e => setFormData({...formData, zoneName: e.target.value})}
                  placeholder="EX: BAY-01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Capacity</label>
                  <input 
                    type="number" min="1" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e5aa0]/20 focus:border-[#1e5aa0] transition font-bold"
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e5aa0]/20 focus:border-[#1e5aa0] transition font-bold"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold uppercase text-xs tracking-widest hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#1e5aa0] text-white font-bold uppercase text-xs tracking-widest hover:bg-[#164a85] transition shadow-lg shadow-blue-200"
                >
                  {editingZone ? "Save Changes" : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
