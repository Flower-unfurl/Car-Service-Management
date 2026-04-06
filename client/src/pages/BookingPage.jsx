import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingPage = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [availableZones, setAvailableZones] = useState([]);
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        email: '',
        licensePlate: '',
        expectedTime: '',
        time: '',
        selectedServiceIds: []
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get('http://localhost:5000/service');
                setServices(response.data.data);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };
        fetchServices();
    }, []);

    // Theo dõi ngày giờ và dịch vụ để cập nhật Zone trống
    useEffect(() => {
        const checkAvailability = async () => {
            if (formData.expectedTime && formData.time && formData.selectedServiceIds.length > 0) {
                try {
                    const params = new URLSearchParams();
                    params.append('expectedTime', `${formData.expectedTime}T${formData.time}:00+07:00`);
                    formData.selectedServiceIds.forEach(id => params.append('serviceIds', id));

                    const response = await axios.get(`http://localhost:5000/booking/available-zones?${params.toString()}`);
                    setAvailableZones(response.data);
                } catch (error) {
                    console.error('Error checking availability:', error);
                }
            } else {
                setAvailableZones([]);
            }
        };
        const timer = setTimeout(checkAvailability, 500); // Debounce
        return () => clearTimeout(timer);
    }, [formData.expectedTime, formData.time, formData.selectedServiceIds]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (availableZones.length === 0) return;

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
                serviceIds: formData.selectedServiceIds
            };

            const response = await axios.post('http://localhost:5000/booking', payload);
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

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={{
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
        }}>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-[#1e5aa0] px-8 py-6">
                    <h1 className="text-2xl font-bold text-white">Đặt Lịch Hẹn Dịch Vụ</h1>
                    <p className="text-blue-100 italic mt-1">Nhanh chóng - Chuyên nghiệp - Tận tâm</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn dịch vụ</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {services.map(service => (
                                <div
                                    key={service._id}
                                    onClick={() => handleServiceToggle(service._id)}
                                    className={`cursor-pointer p-4 border rounded-lg transition-all ${formData.selectedServiceIds.includes(service._id)
                                        ? 'border-[#1e5aa0] bg-blue-50 ring-2 ring-blue-100'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                                    <p className="text-sm text-gray-500">${service.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HIỂN THỊ TỔNG TIỀN VÀ KHU VỰC CÒN TRỐNG */}
                    {formData.selectedServiceIds.length > 0 && (
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                <span className="text-lg font-bold text-gray-700">Tổng tiền dịch vụ:</span>
                                <span className="text-2xl font-black text-[#1e5aa0]">
                                    ${services
                                        .filter(s => formData.selectedServiceIds.includes(s._id))
                                        .reduce((sum, s) => sum + s.price, 0)
                                        .toFixed(2)}
                                </span>
                            </div>

                            {formData.expectedTime && formData.time && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">🛠️ Khu vực còn trống tại thời điểm này:</h3>
                                    {availableZones.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {availableZones.map(zone => (
                                                <span key={zone._id} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                                    {zone.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-red-500 text-sm font-medium">⚠️ Xin lỗi, không còn khoang trống vào khung giờ này. Vui lòng chọn giờ khác!</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading || formData.selectedServiceIds.length === 0 || availableZones.length === 0}
                            className={`w-full py-3 px-4 rounded-md shadow-sm text-white font-bold text-lg transition-all ${loading || formData.selectedServiceIds.length === 0 || availableZones.length === 0
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
