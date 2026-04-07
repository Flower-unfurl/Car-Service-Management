import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import axios from 'axios';
import dispatchApi, { getErrorMessage } from '../services/dispatchApi';
import { 
    Camera, Car, User, Hash, FileCheck, ClipboardList, 
    CheckCircle, QrCode, AlertCircle, Calendar, ArrowRight, ShieldCheck, Cpu, Download
} from 'lucide-react';
import { UserContext } from '../context/UserContext';


export default function StaffVehicleEntry() {
    const { user, loading: contextLoading } = useContext(UserContext);
    const [step, setStep] = useState(1);
    const [isSimulatingAI, setIsSimulatingAI] = useState(false);
    const [availableZones, setAvailableZones] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedBrandModels, setSelectedBrandModels] = useState([]);
    const [serviceMode, setServiceMode] = useState("MANUAL"); 
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState("");

    // Infinite scroll service states
    const [serviceOptions, setServiceOptions] = useState([]);
    const [servicePage, setServicePage] = useState(1);
    const [serviceHasMore, setServiceHasMore] = useState(true);
    const [isFetchingServices, setIsFetchingServices] = useState(false);
    const serviceListRef = useRef(null);

    const [selectedServiceIds, setSelectedServiceIds] = useState([]);
        
    // Step 1 State: Ticket
    const [ticketData, setTicketData] = useState({
        licensePlate: '',
        vehicleType: 'CAR',
        ticketType: 'SERVICE',
        brand: '',
        model: '',
        color: '',
        customerName: '',
        customerPhone: '',
        zoneId: ''
    });
    const [ticketErrors, setTicketErrors] = useState({});
    
    // Step 2 State: Inspection
    const [inspectionData, setInspectionData] = useState({
        odometer: '',
        fuelLevel: '50',
        condition: '',
    });
    const [damages, setDamages] = useState([]);
    const [newDamage, setNewDamage] = useState({ area: 'FRONT_BUMPER', severity: 'MINOR', description: '' });
    
    const [createdTicket, setCreatedTicket] = useState(null);
    const [globalError, setGlobalError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        console.log("Current User Context:", user);
        console.log("Context Loading Status:", contextLoading);
    }, [user, contextLoading]);
    
    useEffect(() => {
        // 1. Khai báo hàm ở scope của useEffect
        const fetchAppointments = async () => {
            // 2. Kiểm tra điều kiện (Guard clause) ngay đầu hàm
            if (contextLoading || !user) return; 

            if (serviceMode === "APPOINTMENT" && ticketData.customerPhone) {
                try {
                    const res = await axios.get(`http://localhost:5000/booking/lookup/${ticketData.customerPhone.trim()}`, { withCredentials: true });
                    setAppointments(Array.isArray(res.data) ? res.data : []);
                } catch (err) {
                    console.error("Failed to fetch appointments", err);
                }
            }
        };

        // 3. Gọi hàm
        fetchAppointments();
    }, [serviceMode, ticketData.customerPhone, user, contextLoading]);

    const fetchServices = useCallback(async (page) => {
        if (isFetchingServices) return;
        setIsFetchingServices(true);
        try {
            const res = await axios.get(`http://localhost:5000/service/dropdown?page=${page}&limit=4`);
            const { data, hasMore } = res.data;
            setServiceOptions(prev => page === 1 ? data : [...prev, ...data]);
            setServiceHasMore(hasMore);
            setServicePage(page);
        } catch (err) {
            console.error("Failed to fetch services", err);
        } finally {
            setIsFetchingServices(false);
        }
    }, [isFetchingServices]);

    const fetchInitialData = async () => {
        try {
            const [zonesRes, brandsRes] = await Promise.all([
                axios.get("http://localhost:5000/zone/available"),
                axios.get("http://localhost:5000/brand"),
            ]);
            setAvailableZones(zonesRes.data.data);
            setBrands(brandsRes.data.data);
        } catch (err) {
            console.error("Failed to load initial data", err);
        }
        // Load trang đầu services riêng
        await fetchServicesPage(1);
    };

    const fetchServicesPage = async (page) => {
        setIsFetchingServices(true);
        try {
            const res = await axios.get(`http://localhost:5000/service/dropdown?page=${page}&limit=10`);
            const { data, hasMore } = res.data;
            setServiceOptions(prev => page === 1 ? data : [...prev, ...data]);
            setServiceHasMore(hasMore);
            setServicePage(page);
        } catch (err) {
            console.error("Failed to fetch services", err);
        } finally {
            setIsFetchingServices(false);
        }
    };

    const handleServiceScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const nearBottom = scrollHeight - scrollTop - clientHeight < 40;
        if (nearBottom && serviceHasMore && !isFetchingServices) {
            fetchServicesPage(servicePage + 1);
        }
    };

    // Xử lý AI Scan giả lập
    const handleAIScan = () => {
        setIsSimulatingAI(true);
        setGlobalError("");
        setTimeout(() => {
            setTicketData(prev => ({
                ...prev,
                licensePlate: '51G-123.45',
                brand: 'TOYOTA',
                model: 'VIOS',
                color: 'Black'
            }));
            setSelectedBrandModels(['VIOS', 'CAMRY', 'FORTUNER']);
            setIsSimulatingAI(false);
        }, 1500);
    };

    const handleTicketChange = (e) => {
        const { name, value } = e.target;
        setTicketData(prev => ({ ...prev, [name]: value }));

        if (name === "ticketType" && value !== "SERVICE") {
            setSelectedServiceIds([]);
        }
        
        if (name === "brand") {
            const brandObj = brands.find(b => b.brandName.toUpperCase() === value.toUpperCase());
            setSelectedBrandModels(brandObj ? brandObj.models : []);
        }

        if (ticketErrors[name]) {
            setTicketErrors({ ...ticketErrors, [name]: '' });
        }
    };

    const handleInspectionChange = (e) => {
        setInspectionData({ ...inspectionData, [e.target.name]: e.target.value });
    };

    const validateTicket = () => {
        let errors = {};
        if (!ticketData.licensePlate) errors.licensePlate = 'License plate is required';
        setTicketErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitTicket = async (e) => {
        e.preventDefault();
        setGlobalError("");
        if (!validateTicket()) return;
        setStep(2);
    };

    const addDamageRecord = () => {
        if (!newDamage.description) return;
        setDamages([...damages, newDamage]);
        setNewDamage({ area: 'FRONT_BUMPER', severity: 'MINOR', description: '' });
    };

    const removeDamageRecord = (index) => {
        setDamages(damages.filter((_, i) => i !== index));
    };

    const submitInspection = async (e) => {
        e.preventDefault();
        setGlobalError("");

        if (ticketData.ticketType === "SERVICE" && selectedServiceIds.length === 0) {
            setGlobalError("Vui lòng chọn ít nhất 1 dịch vụ cho phiếu SERVICE.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ticketData,
                inspectionData: { ...inspectionData, damages },
                serviceIds: ticketData.ticketType === "SERVICE" ? selectedServiceIds : [],
                ...(serviceMode === "APPOINTMENT" && selectedAppointmentId
                    ? { appointmentId: selectedAppointmentId }
                    : {})
            };
            const data = await dispatchApi.createFullEntry(payload);
            setCreatedTicket(data);
            setStep(3);
        } catch (error) {
            setGlobalError(getErrorMessage(error, "Failed to complete entry process."));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleService = (serviceId) => {
        setSelectedServiceIds((prev) => (
            prev.includes(serviceId)
                ? prev.filter((id) => id !== serviceId)
                : [...prev, serviceId]
        ));
    };

    const handlePrintTicket = () => {
        if (!createdTicket) return;
        const printContent = `
=== AUTO REPAIR TICKET ===
Ticket ID: ${createdTicket._id || 'N/A'}
Check-in Time: ${new Date(createdTicket.createdAt || Date.now()).toLocaleString()}
--------------------------
License Plate: ${createdTicket.licensePlate || ticketData.licensePlate}
Vehicle Type: ${createdTicket.vehicleType || ticketData.vehicleType}
Brand: ${createdTicket.brand || ticketData.brand}
Color: ${createdTicket.color || ticketData.color}
Customer: ${createdTicket.customerName || ticketData.customerName}
Phone: ${createdTicket.customerPhone || ticketData.customerPhone}
--------------------------
QR Tracking Token: ${createdTicket.qrToken || 'N/A'}

Please keep this token to track the service status online.
==========================
        `;
        const blob = new Blob([printContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Ticket_${createdTicket.licensePlate || 'New'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="w-full max-w-[1000px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row">
                
                {/* 🌟 Cột Trái - Stepper / Info */}
                <div className="md:w-[35%] bg-gradient-to-br from-[#1e5aa0] to-[#123968] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Vehicle Entry</h2>
                        <p className="text-blue-200 text-sm mb-12 leading-relaxed">Manage vehicle check-in, tracking, and initial inspection smoothly.</p>

                        <div className="space-y-8">
                            {/* Step 1 Indicator */}
                            <div className={`flex items-start gap-4 transition-all ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-blue-800 text-blue-300'}`}>
                                    {step > 1 ? <CheckCircle size={20} /> : '1'}
                                </div>
                                <div className="mt-1">
                                    <h3 className="font-bold uppercase tracking-wider text-sm">Check-in & Ticket</h3>
                                    <p className="text-xs text-blue-200 mt-1">Capture details & assign zone</p>
                                </div>
                            </div>
                            
                            {/* Line connecting */}
                            <div className="w-1 h-8 bg-blue-800 ml-4.5 -my-4 rounded-full"></div>

                            {/* Step 2 Indicator */}
                            <div className={`flex items-start gap-4 transition-all ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-blue-800 text-blue-300'}`}>
                                    {step > 2 ? <CheckCircle size={20} /> : '2'}
                                </div>
                                <div className="mt-1">
                                    <h3 className="font-bold uppercase tracking-wider text-sm">Inspection</h3>
                                    <p className="text-xs text-blue-200 mt-1">Record scratches & condition</p>
                                </div>
                            </div>

                            {/* Line connecting */}
                            <div className="w-1 h-8 bg-blue-800 ml-4.5 -my-4 rounded-full"></div>

                            {/* Step 3 Indicator */}
                            <div className={`flex items-start gap-4 transition-all ${step === 3 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 3 ? 'bg-emerald-500 text-white' : 'bg-blue-800 text-blue-300'}`}>
                                    3
                                </div>
                                <div className="mt-1">
                                    <h3 className="font-bold uppercase tracking-wider text-sm">Handover to Staff</h3>
                                    <p className="text-xs text-blue-200 mt-1">Generate QR & Tracking</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative z-10 mt-12 bg-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck size={20} className="text-emerald-400" />
                            <span className="font-semibold text-sm uppercase">Auth Secured</span>
                        </div>
                        <p className="text-xs text-blue-200">System actions are logged and strictly bound to your staff account.</p>
                    </div>
                </div>

                {/* 🌟 Cột Phải - Forms */}
                <div className="md:w-[65%] p-10 bg-white relative">
                    
                    {/* Global Error Banner */}
                    {globalError && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3 rounded-r-lg animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="text-red-500 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-red-800 font-semibold text-sm">Action Failed</h4>
                                <p className="text-red-600 text-xs mt-1">{globalError}</p>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 1 FORM ================= */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">Create Ticket</h3>
                                    <p className="text-sm text-gray-500 mt-1">Enter vehicle & customer info</p>
                                </div>
                                <button 
                                    onClick={handleAIScan}
                                    disabled={isSimulatingAI}
                                    className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 border border-indigo-200 shadow-sm"
                                >
                                    {isSimulatingAI ? <Cpu size={16} className="animate-pulse" /> : <Camera size={16} />}
                                    {isSimulatingAI ? 'Scanning AI...' : 'AI Camera Scan'}
                                </button>
                            </div>

                            <form onSubmit={submitTicket} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1"><Hash size={14}/> License Plate *</label>
                                        <input 
                                            type="text" name="licensePlate" 
                                            value={ticketData.licensePlate} onChange={handleTicketChange}
                                            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 uppercase font-bold tracking-wider outline-none transition focus:bg-white focus:ring-2 focus:ring-[#1e5aa0]/20 ${ticketErrors.licensePlate ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#1e5aa0]'}`}
                                            placeholder="51G-123.45"
                                        />
                                        {ticketErrors.licensePlate && <p className="text-red-500 text-xs mt-1">{ticketErrors.licensePlate}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1"><Car size={14}/> Vehicle Type</label>
                                        <select 
                                            name="vehicleType" value={ticketData.vehicleType} onChange={handleTicketChange}
                                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#1e5aa0]/20 border-gray-200 focus:border-[#1e5aa0]"
                                        >
                                            <option value="CAR">Car</option>
                                            <option value="BIKE">Motorbike</option>
                                            <option value="TRUCK">Truck</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Ticket Type</label>
                                        <select
                                            name="ticketType"
                                            value={ticketData.ticketType}
                                            onChange={handleTicketChange}
                                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#1e5aa0]/20 border-gray-200 focus:border-[#1e5aa0]"
                                        >
                                            <option value="SERVICE">SERVICE</option>
                                            <option value="PARKING">PARKING</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <p className="text-[10px] text-gray-400 leading-tight italic px-2 pb-2">
                                            SERVICE yêu cầu đồng kiểm và chọn dịch vụ.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1">Brand</label>
                                        <input 
                                            name="brand" 
                                            list="brand-list"
                                            value={ticketData.brand} 
                                            onChange={handleTicketChange}
                                            placeholder="Select or type Brand"
                                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none transition focus:bg-white border-gray-200 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                                        />
                                        <datalist id="brand-list">
                                            {brands.map(b => <option key={b._id} value={b.brandName} />)}
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1">Model</label>
                                        <input 
                                            name="model" 
                                            list="model-list"
                                            value={ticketData.model} 
                                            onChange={handleTicketChange}
                                            disabled={!ticketData.brand}
                                            placeholder="Select or type Model"
                                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none transition focus:bg-white border-gray-200 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20 disabled:opacity-50"
                                        />
                                        <datalist id="model-list">
                                            {selectedBrandModels.map((m, i) => <option key={i} value={m} />)}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1">Color</label>
                                        <input 
                                            type="text" name="color" value={ticketData.color} onChange={handleTicketChange}
                                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none transition focus:bg-white border-gray-200 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                                            placeholder="Ex: Silver"
                                        />
                                    </div>
                                    <div>{/* Spacer */}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1 text-emerald-600">Assign Zone *</label>
                                        <select 
                                            name="zoneId" value={ticketData.zoneId} onChange={handleTicketChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border bg-emerald-50 outline-none transition focus:bg-white border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-bold"
                                        >
                                            <option value="">Choose Available Zone</option>
                                            {availableZones.map(z => (
                                                <option key={z._id} value={z._id}>{z.zoneName} ({z.capacity - z.occupied} space)</option>
                                            ))}
                                        </select>
                                        {availableZones.length === 0 && <p className="text-red-500 text-[10px] mt-1 font-bold">ALL ZONES ARE FULL!</p>}
                                    </div>
                                    <div className="flex items-end">
                                        <p className="text-[10px] text-gray-400 leading-tight italic px-2 pb-2">Assigning a zone immediately holds a slot in the parking area.</p>
                                    </div>
                                </div>

                                <hr className="border-gray-100 my-6" />

                                {/* Customer info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1"><User size={14}/> Customer Name</label>
                                        <input 
                                            type="text" name="customerName" value={ticketData.customerName} onChange={handleTicketChange}
                                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none transition focus:bg-white border-gray-200 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                                            placeholder="Passerby / Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Phone Number</label>
                                        <input 
                                            type="tel" name="customerPhone" value={ticketData.customerPhone} onChange={handleTicketChange}
                                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none transition focus:bg-white border-gray-200 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full mt-6 bg-[#1e5aa0] hover:bg-[#164a85] text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_4px_14px_rgba(30,90,160,0.39)] hover:shadow-[0_6px_20px_rgba(30,90,160,0.23)] flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isLoading ? 'Processing...' : 'Generate Ticket & Continue'} <ArrowRight size={18} />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ================= STEP 2 FORM ================= */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-500 font-bold uppercase mb-1">Current Ticket</p>
                                    <h3 className="text-lg font-bold text-blue-900 tracking-wider font-mono">{createdTicket?.licensePlate || ticketData.licensePlate || "N/A"}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                        Zone: {createdTicket?.zone || "Pending"}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={submitInspection} className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><ClipboardList size={20} className="text-[#1e5aa0]"/> Condition Check</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Odometer (km)</label>
                                        <input 
                                            type="number" name="odometer" value={inspectionData.odometer} onChange={handleInspectionChange}
                                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none focus:bg-white border-gray-200 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20"
                                            placeholder="Ex: 45000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Fuel Level (%)</label>
                                        <div className="flex items-center gap-4 mt-2">
                                            <input 
                                                type="range" name="fuelLevel" min="0" max="100" 
                                                value={inspectionData.fuelLevel} onChange={handleInspectionChange}
                                                className="w-full accent-[#1e5aa0]"
                                            />
                                            <span className="font-bold text-gray-700 w-12">{inspectionData.fuelLevel}%</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mt-6"><FileCheck size={18} className="text-[#1e5aa0]"/> Record Damages (Crashes/Scratches)</h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <div className="flex gap-2">
                                        <select 
                                            value={newDamage.area} onChange={(e) => setNewDamage({...newDamage, area: e.target.value})}
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                        >
                                            <option value="FRONT_BUMPER">Front Bumper</option>
                                            <option value="REAR_BUMPER">Rear Bumper</option>
                                            <option value="WINDSHIELD">Windshield</option>
                                            <option value="DOOR">Door</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        <select 
                                            value={newDamage.severity} onChange={(e) => setNewDamage({...newDamage, severity: e.target.value})}
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                        >
                                            <option value="MINOR">Minor Scratch</option>
                                            <option value="MODERATE">Moderate</option>
                                            <option value="SEVERE">Severe Dent</option>
                                            <option value="BROKEN">Broken</option>
                                            <option value="NEW">New</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <input 
                                            type="text" placeholder="Detail description..."
                                            value={newDamage.description} onChange={(e) => setNewDamage({...newDamage, description: e.target.value})}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1e5aa0]"
                                        />
                                        <button 
                                            type="button" onClick={addDamageRecord}
                                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase transition hover:bg-gray-800 whitespace-nowrap"
                                        >
                                            + Add
                                        </button>
                                    </div>

                                    {damages.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {damages.map((dmg, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white border border-gray-100 p-2 rounded-md shadow-sm">
                                                    <div>
                                                        <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded mr-2">{dmg.area}</span>
                                                        <span className="text-xs text-gray-500 mr-2">[{dmg.severity}]</span>
                                                        <span className="text-sm font-medium text-gray-800">{dmg.description}</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeDamageRecord(idx)} className="text-red-400 hover:text-red-600 text-xl leading-none">&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ===== SERVICE SELECTION SECTION ===== */}
                                {ticketData.ticketType === "SERVICE" && (
                                    <>
                                        <hr className="border-gray-100" />
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                                                <FileCheck size={18} className="text-[#1e5aa0]" />
                                                Chọn dịch vụ cho xe
                                            </h3>

                                            {/* Mode Switcher */}
                                            <div className="mb-4">
                                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                                    Hình thức đặt dịch vụ
                                                </label>
                                                <select
                                                    value={serviceMode}
                                                    onChange={(e) => {
                                                        setServiceMode(e.target.value);
                                                        setSelectedServiceIds([]);
                                                        setSelectedAppointmentId("");
                                                    }}
                                                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none transition focus:bg-white border-gray-200 focus:border-[#1e5aa0] focus:ring-2 focus:ring-[#1e5aa0]/20 font-semibold"
                                                >
                                                    <option value="MANUAL">🔧 Chọn dịch vụ (Khách chưa đặt lịch hẹn)</option>
                                                    <option value="APPOINTMENT">📅 Khách đã có lịch hẹn</option>
                                                </select>
                                            </div>

                                            {/* MANUAL MODE - Infinite Scroll */}
                                            {serviceMode === "MANUAL" && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        Chọn các dịch vụ bên dưới. Cuộn xuống để xem thêm. Giá sẽ được snapshot vào ServiceOrder và sinh ServiceTask theo stepOrder.
                                                    </p>
                                                    <div
                                                        ref={serviceListRef}
                                                        onScroll={handleServiceScroll}
                                                        className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3"
                                                    >
                                                        {serviceOptions.map((service) => {
                                                            const checked = selectedServiceIds.includes(service._id);
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={service._id}
                                                                    onClick={() => toggleService(service._id)}
                                                                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                                                                        checked
                                                                            ? "border-[#1e5aa0] bg-blue-50 text-blue-900"
                                                                            : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                                                                    }`}
                                                                >
                                                                    <span className="font-semibold">{service.serviceName || "Unnamed service"}</span>
                                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                                        checked ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                                                                    }`}>
                                                                        {checked ? "✓ Đã chọn" : "Chọn"}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}

                                                        {/* Loading spinner */}
                                                        {isFetchingServices && (
                                                            <div className="flex items-center justify-center py-3 gap-2 text-gray-400">
                                                                <Cpu size={14} className="animate-spin" />
                                                                <span className="text-xs">Đang tải thêm dịch vụ...</span>
                                                            </div>
                                                        )}

                                                        {/* Nút Load More nếu thanh cuộn không hoạt động tốt */}
                                                        {serviceHasMore && !isFetchingServices && (
                                                            <button
                                                                type="button"
                                                                onClick={() => fetchServicesPage(servicePage + 1)}
                                                                className="w-full mt-2 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                                            >
                                                                + Tải thêm dịch vụ
                                                            </button>
                                                        )}

                                                        {/* End of list */}
                                                        {!serviceHasMore && serviceOptions.length > 0 && (
                                                            <p className="text-center text-xs text-gray-400 py-2 mt-2">
                                                                ✓ Đã hiển thị tất cả {serviceOptions.length} dịch vụ
                                                            </p>
                                                        )}

                                                        {/* Empty state */}
                                                        {serviceOptions.length === 0 && !isFetchingServices && (
                                                            <p className="text-xs text-gray-500 py-4 text-center">
                                                                Không có dịch vụ nào trong hệ thống.
                                                            </p>
                                                        )}
                                                    </div>

                                                    <p className="mt-2 text-xs text-gray-600">
                                                        Đã chọn: <b>{selectedServiceIds.length}</b> dịch vụ
                                                    </p>
                                                </div>
                                            )}

                                            {/* APPOINTMENT MODE */}
                                            {serviceMode === "APPOINTMENT" && (
                                                <div>
                                                    {!ticketData.customerPhone ? (
                                                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
                                                            <AlertCircle size={16} className="flex-shrink-0" />
                                                            <span>Vui lòng nhập <b>số điện thoại khách hàng</b> ở bước 1 để tra cứu lịch hẹn.</span>
                                                        </div>
                                                    ) : appointments.length === 0 ? (
                                                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-500 text-sm">
                                                            <Calendar size={16} className="flex-shrink-0" />
                                                            <span>Không tìm thấy lịch hẹn nào cho số <b>{ticketData.customerPhone}</b>.</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
                                                            {appointments.map((appt) => {
                                                                const isSelected = selectedAppointmentId === appt._id;
                                                                const serviceNames = appt.serviceIds?.map(s => s.serviceName || s).join(", ") || "N/A";
                                                                const appointedDate = appt.appointmentDate
                                                                    ? new Date(appt.appointmentDate).toLocaleDateString("vi-VN", {
                                                                        day: "2-digit", month: "2-digit", year: "numeric",
                                                                        hour: "2-digit", minute: "2-digit"
                                                                      })
                                                                    : "N/A";

                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={appt._id}
                                                                        onClick={() => {
                                                                            setSelectedAppointmentId(appt._id);
                                                                            const ids = appt.serviceIds?.map(s => s._id || s) || [];
                                                                            setSelectedServiceIds(ids);
                                                                        }}
                                                                        className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                                                                            isSelected
                                                                                ? "border-[#1e5aa0] bg-blue-50 ring-2 ring-[#1e5aa0]/20"
                                                                                : "border-gray-200 bg-white hover:border-blue-300"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs text-gray-400 font-mono mb-0.5">#{appt._id?.slice(-6).toUpperCase()}</p>
                                                                                <p className="text-sm font-bold text-gray-800 truncate">{serviceNames}</p>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <Calendar size={11} className="text-gray-400" />
                                                                                    <span className="text-xs text-gray-500">{appointedDate}</span>
                                                                                    {appt.zoneId && (
                                                                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                                                                                            Zone: {appt.zoneId?.zoneName || appt.zoneId}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                                                                                isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                                                                            }`}>
                                                                                {isSelected ? "✓ Chọn" : "Chọn"}
                                                                            </span>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {selectedAppointmentId && (
                                                        <p className="mt-2 text-xs text-emerald-700 font-semibold">
                                                            ✓ Đã chọn lịch hẹn — {selectedServiceIds.length} dịch vụ sẽ được áp dụng.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-4 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setStep(1)}
                                        className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-2/3 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_4px_14px_rgba(249,115,22,0.39)] flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {isLoading ? 'Saving...' : 'Complete Check-In'} <CheckCircle size={18} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ================= STEP 3 DONE ================= */}
                    {step === 3 && (
                        <div className="animate-in zoom-in-95 duration-500 h-full flex flex-col items-center justify-center text-center py-10">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-500 ring-8 ring-emerald-50">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-2">Check-in Complete!</h2>
                            <p className="text-gray-500 mb-8 max-w-sm">Vehicle has been checked in and is now ready in the dispatch queue. Please share this Tracking Code with the customer.</p>
                            
                            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-8 w-full max-w-sm mb-8 relative">
                                <div className="absolute top-0 right-0 p-3 text-gray-300"><QrCode size={40} /></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">QR Tracking Token</p>
                                <p className="text-2xl font-mono text-gray-900 font-bold bg-white p-3 rounded-lg border border-gray-100 shadow-sm break-all text-left">
                                    {createdTicket?.qrToken || 'DEMO-TOKEN-XYZ'}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <button 
                                    onClick={handlePrintTicket}
                                    className="bg-gray-800 text-white font-bold text-sm uppercase tracking-wider hover:bg-gray-700 px-6 py-3 rounded-full transition flex items-center gap-2"
                                >
                                    <Download size={18} /> Print Ticket (TXT)
                                </button>
                                <button 
                                    onClick={() => {
                                        setStep(1);
                                        setTicketData({
                                            licensePlate: '',
                                            vehicleType: 'CAR',
                                            ticketType: 'SERVICE',
                                            brand: '',
                                            model: '',
                                            color: '',
                                            customerName: '',
                                            customerPhone: '',
                                            zoneId: ''
                                        });
                                        setInspectionData({ odometer: '', fuelLevel: '50', condition: '' });
                                        setSelectedServiceIds([]);
                                        setCreatedTicket(null);
                                        setDamages([]);
                                        setServiceMode("MANUAL");
                                        setSelectedAppointmentId("");
                                        setAppointments([]);
                                    }}
                                    className="text-[#1e5aa0] font-bold text-sm uppercase tracking-wider hover:bg-blue-50 px-6 py-3 rounded-full transition"
                                >
                                    ↑ Start New Check-in
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}