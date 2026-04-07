import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Search, Phone, Calendar, Wrench, CircleDollarSign, XCircle, Settings, Clock, User } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const SettingsIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const LookupPage = () => {
    const { user, loading: contextLoading } = useContext(UserContext);
    const [phone, setPhone] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);
    const [searched, setSearched] = useState(false);
    const [message, setMessage] = useState(null);

    const isStaffOrAdmin = user && (user.role === 'ADMIN' || user.role === 'STAFF');

    // Debugging logs
    useEffect(() => {
        console.log("Current User Context:", user);
        console.log("Context Loading Status:", contextLoading);
    }, [user, contextLoading]);

    // Tự động tải lịch hẹn cá nhân khi vừa vào trang
    useEffect(() => {
        if (!contextLoading && user) {
            console.log("Triggering fetchMyAppointments because user is logged in.");
            fetchMyAppointments();
        }
    }, [user, contextLoading]);

    const fetchMyAppointments = async () => {
        setLoading(true);
        try {
            console.log("LookupPage: Fetching my appointments...");
            const response = await axios.get('http://localhost:5000/booking/my-appointments', { withCredentials: true });
            setAppointments(response.data);
            setSearched(true);
            console.log("LookupPage: Fetch success, found:", response.data.length);
        } catch (error) {
            console.error('LookupPage: Error fetching my-appointments:', error);
            setMessage({ type: 'error', text: 'Vui lòng đăng nhập để xem lịch hẹn của bạn.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (isStaffOrAdmin) {
            if (!phone.trim()) return;
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/booking/lookup/${phone.trim()}`, { withCredentials: true });
                setAppointments(response.data);
                setSearched(true);
            } catch (error) {
                console.error('Error searching appointments:', error);
                setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi tra cứu.' });
            } finally {
                setLoading(false);
            }
        } else {
            // Guest tìm theo ngày
            if (!searchDate) return;
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/booking/my-appointments/search?date=${searchDate}`, { withCredentials: true });
                setAppointments(response.data);
                setSearched(true);
            } catch (error) {
                console.error('Error searching my-appointments:', error);
                setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi tra cứu.' });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;

        setCancellingId(id);
        try {
            await axios.put(`http://localhost:5000/booking/${id}`, { status: 'CANCELLED' }, { withCredentials: true });
            setMessage({ type: 'success', text: 'Hủy lịch hẹn thành công!' });
            // Refresh local state
            setAppointments(prev => prev.map(appt =>
                appt._id === id ? { ...appt, status: 'CANCELLED' } : appt
            ));
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            setMessage({ type: 'error', text: 'Không thể hủy lịch lúc này. Vui lòng thử lại.' });
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ARRIVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const formatPrice = (price) => `$${price.toFixed(2)}`;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-[#1e5aa0] uppercase tracking-tight mb-2">
                        {isStaffOrAdmin ? 'Quản Lý Tra Cứu' : 'Lịch Hẹn Của Tôi'}
                    </h1>
                    <p className="text-gray-600 font-medium">
                        {isStaffOrAdmin
                            ? 'Tra cứu và quản lý lịch hẹn của khách hàng theo số điện thoại'
                            : 'Xem lịch sử và quản lý các dịch vụ bạn đã đặt'}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {isStaffOrAdmin ? (
                                    <Phone className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                            {isStaffOrAdmin ? (
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e5aa0] focus:border-[#1e5aa0] sm:text-sm transition-all"
                                    placeholder="Ví dụ: 0987654321"
                                    required
                                />
                            ) : (
                                <input
                                    type="date"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e5aa0] focus:border-[#1e5aa0] sm:text-sm transition-all"
                                    required
                                />
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-[#1e5aa0] hover:bg-[#164275] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e5aa0] transition-all"
                        >
                            {loading ? 'Đang tìm...' : (
                                <>
                                    <Search className="h-4 w-4 mr-2" />
                                    Tìm Kiếm
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                {/* Results Section */}
                {searched && (
                    <div className="space-y-6">
                        {appointments.length > 0 ? (
                            appointments.map((appt) => (
                                <div key={appt._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gray-100 p-3 rounded-xl">
                                                    <Calendar className="h-6 w-6 text-[#1e5aa0]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 font-medium">Thời gian hẹn</p>
                                                    <p className="text-lg font-bold text-gray-900">
                                                        {new Date(appt.expectedTime).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${getStatusStyle(appt.status)}`}>
                                                {appt.status}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                                            <div>
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                    <SettingsIcon size={14} /> Dịch vụ đã chọn
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {appt.serviceIds.map(s => (
                                                        <span key={s._id} className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm border border-gray-100">
                                                            {s.serviceName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:items-end justify-between">
                                                <div className="text-left md:text-right mb-4">
                                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tổng thanh toán</h3>
                                                    <p className="text-2xl font-black text-[#1e5aa0]">
                                                        {formatPrice(appt.serviceIds.reduce((sum, s) => sum + (s.price || 0), 0))}
                                                    </p>
                                                </div>

                                                {appt.status === 'BOOKED' && (
                                                    <button
                                                        onClick={() => handleCancel(appt._id)}
                                                        disabled={cancellingId === appt._id}
                                                        className={`inline-flex items-center px-4 py-2 border border-red-200 text-sm font-bold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors ${cancellingId === appt._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {cancellingId === appt._id ? (
                                                            <>
                                                                <div className="animate-spin h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full mr-2"></div>
                                                                Đang hủy...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Hủy Lịch Hẹn
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-sm text-gray-500">
                                            <p><b>Khu vực:</b> {appt.zoneId?.name || 'Đang cập nhật'}</p>
                                            <span className="mx-2">•</span>
                                            <p><b>Khách hàng:</b> {appt.customerName}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">
                                    {isStaffOrAdmin
                                        ? 'Không tìm thấy lịch hẹn nào cho số điện thoại này.'
                                        : 'Bạn không có lịch hẹn nào vào ngày này.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LookupPage;
