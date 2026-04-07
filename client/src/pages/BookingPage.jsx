import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Lock } from 'lucide-react';
import { useUser } from '../hooks/UseUser';

const BookingPage = () => {
    const navigate = useNavigate();
    const { user, loading: userLoading } = useUser();
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        email: '',
        licensePlate: '',
        expectedTime: '',
        time: '',
        selectedServiceIds: []
    });

    // Auto-fill form data when user context is available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                customerName: user.name || prev.customerName,
                email: user.email || prev.email
            }));
        }
    }, [user]);


    const [ticketId, setTicketId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get('http://localhost:5000/service/dropdown');
                console.log(response.data.data);
                setServices(response.data.data);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };
        fetchServices();
    }, []);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleServiceToggle = (serviceId) => {
        const updated = formData.selectedServiceIds.includes(serviceId)
            ? formData.selectedServiceIds.filter(id => id !== serviceId)
            : [...formData.selectedServiceIds, serviceId];
        setFormData({ ...formData, selectedServiceIds: updated });
    };

    const handleTicketFetch = async () => {
        if (!ticketId) {
            setMessage({ type: 'error', text: 'Vui lòng nhập mã Ticket' });
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/ticket/${ticketId}`);
            const ticket = response.data.data;
            if (ticket) {
                setFormData({
                    ...formData,
                    customerName: ticket.customerName || '',
                    phone: ticket.customerPhone || '',
                    licensePlate: ticket.licensePlate || ''
                });
                setMessage({ type: 'success', text: 'Đã tự động điền thông tin từ Ticket!' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Không tìm thấy Ticket hoặc lỗi hệ thống.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage(null);

        try {
            const combinedDateTime = `${formData.expectedTime}T${formData.time}:00+07:00`;
            const payload = {
                customerName: formData.customerName,
                phone: formData.phone,
                email: formData.email,
                licensePlate: formData.licensePlate,
                expectedTime: combinedDateTime,
                serviceIds: formData.selectedServiceIds,
                ticketId: ticketId // Thêm mã ticket vào payload 🎟️
            };

            const response = await axios.post('http://localhost:5000/booking', payload, { withCredentials: true });
            setMessage({ type: 'success', text: response.data.message });
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e5aa0]"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-10 h-10 text-[#1e5aa0]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">Yêu cầu đăng nhập</h2>
                        <p className="text-gray-500">Vui lòng đăng nhập để có thể đặt lịch hẹn và theo dõi lịch trình của bạn.</p>
                    </div>
                    <button
                        onClick={() => navigate('/signin', { state: { from: '/booking' } })}
                        className="w-full bg-[#1e5aa0] text-white py-3 rounded-xl font-bold hover:bg-[#164275] transition-all flex items-center justify-center gap-2"
                    >
                        Đăng Nhập Ngay
                    </button>
                    <p className="text-sm text-gray-400">Bạn chưa có tài khoản? <span onClick={() => navigate('/signup')} className="text-[#1e5aa0] font-bold cursor-pointer hover:underline">Đăng ký</span></p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={{
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
        }}>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl">
                <div className="bg-[#1e5aa0] px-8 py-6 rounded-t-2xl">
                    <h1 className="text-2xl font-bold text-white">Đặt Lịch Hẹn Dịch Vụ</h1>
                    <p className="text-blue-100 italic mt-1">Nhanh chóng - Chuyên nghiệp - Tận tâm</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg flex justify-between items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span>{message.text}</span>
                            <button onClick={() => setMessage(null)} className="text-sm font-bold opacity-50 hover:opacity-100">✕</button>
                        </div>
                    )}

                    {/* Ô NHẬP TICKET ĐỂ TỰ ĐIỀN */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-3">
                        <label className="block text-sm font-bold text-blue-800 uppercase tracking-wide">
                            🎟️ Bạn đã có phiếu tiếp nhận (Ticket)?
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Nhập mã Ticket (VD: 65f123...)"
                                value={ticketId}
                                onChange={(e) => setTicketId(e.target.value)}
                                className="flex-1 rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-4 border bg-white"
                            />
                            <button
                                type="button"
                                onClick={handleTicketFetch}
                                disabled={loading || !ticketId}
                                className="bg-[#1e5aa0] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#164275] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
                            >
                                {loading ? '...' : 'Áp Dụng'}
                            </button>
                        </div>
                        <p className="text-xs text-blue-600 italic">* Hệ thống sẽ tự động điền thông tin khách hàng và biển số xe từ phiếu của bạn.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                            <input
                                type="text"
                                name="customerName"
                                required
                                value={formData.customerName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                                placeholder="0987654321"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (để nhận xác nhận)</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                                placeholder="vuilongnhapgmail@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Biển số xe</label>
                            <input
                                type="text"
                                name="licensePlate"
                                required
                                value={formData.licensePlate}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                                placeholder="60-A1 12345"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ngày hẹn</label>
                            <input
                                type="date"
                                name="expectedTime"
                                required
                                value={formData.expectedTime}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Giờ hẹn</label>
                            <input
                                type="time"
                                name="time"
                                required
                                value={formData.time}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                            />
                        </div>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn dịch vụ</label>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex flex-wrap gap-2 items-center bg-white border border-gray-300 rounded-lg py-3 px-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 text-left cursor-pointer transition-all hover:border-blue-300 min-h-[52px]"
                        >
                            {formData.selectedServiceIds.length === 0 ? (
                                <span className="text-gray-400">Nhấn để chọn dịch vụ...</span>
                            ) : (
                                services
                                    .filter(s => formData.selectedServiceIds.includes(s._id))
                                    .map(s => (
                                        <span
                                            key={s._id}
                                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 group"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleServiceToggle(s._id);
                                            }}
                                        >
                                            {s.serviceName}
                                            <span className="text-blue-400 group-hover:text-blue-600 transition-colors">✕</span>
                                        </span>
                                    ))
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                {formData.selectedServiceIds.length > 0 && (
                                    <span className="text-xs font-bold text-[#1e5aa0] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                        {formData.selectedServiceIds.length} dịch vụ
                                    </span>
                                )}
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                {services.length > 0 ? (
                                    services.map(service => {
                                        const isSelected = formData.selectedServiceIds.includes(service._id);
                                        return (
                                            <button
                                                key={service._id}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleServiceToggle(service._id);
                                                }}
                                                className={`flex w-full text-left justify-between items-center p-4 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 border rounded-md flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 scale-110 shadow-sm' : 'border-gray-300 group-hover:border-blue-400'
                                                        }`}>
                                                        {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                            {service.serviceName}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">Dịch vụ bảo trì chuyên nghiệp</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-[#1e5aa0] bg-blue-50 px-3 py-1 rounded-full text-sm">
                                                    ${service.price?.toFixed(2) || '0.00'}
                                                </span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="p-4 text-center text-gray-500 italic">
                                        Đang tải danh sách dịch vụ...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* HIỂN THỊ TỔNG TIỀN */}
                    {formData.selectedServiceIds.length > 0 && (
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-700">Tổng tiền dịch vụ dự kiến:</span>
                                <span className="text-2xl font-black text-[#1e5aa0]">
                                    ${services
                                        .filter(s => formData.selectedServiceIds.includes(s._id))
                                        .reduce((sum, s) => sum + (s.price || 0), 0)
                                        .toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading || formData.selectedServiceIds.length === 0}
                            className={`w-full py-3 px-4 rounded-md shadow-sm text-white font-bold text-lg transition-all ${loading || formData.selectedServiceIds.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#1e5aa0] hover:bg-[#164275] transform hover:scale-[1.01]'
                                }`}
                        >
                            {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingPage;
