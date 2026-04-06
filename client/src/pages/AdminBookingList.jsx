import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBookingList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ expectedTime: '' });

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/booking');
            setAppointments(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/booking/${id}`, { status: newStatus });
            fetchAppointments();
        } catch (error) {
            alert('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleEditClick = (appointment) => {
        setEditingId(appointment._id);
        // Chuyển ISO string sang format datetime-local (YYYY-MM-DDTHH:mm)
        const date = new Date(appointment.expectedTime);
        const localISO = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setEditForm({ expectedTime: localISO });
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`http://localhost:5000/booking/${editingId}`, {
                expectedTime: new Date(editForm.expectedTime).toISOString()
            });
            setEditingId(null);
            fetchAppointments();
        } catch (error) {
            alert('Lỗi khi cập nhật thời gian');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) return;
        try {
            await axios.delete(`http://localhost:5000/booking/${id}`);
            fetchAppointments();
        } catch (error) {
            alert('Lỗi khi xóa lịch hẹn');
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Quản Lý Lịch Hẹn</h1>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Khách Hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Biển Số</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Thời Gian Hẹn</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dịch Vụ</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng Thái</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                            <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{appointment.customerName}</div>
                                    <div className="text-sm text-gray-500">{appointment.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono font-bold border border-gray-200">
                                        {appointment.licensePlate}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {editingId === appointment._id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="datetime-local"
                                                value={editForm.expectedTime}
                                                onChange={(e) => setEditForm({ expectedTime: e.target.value })}
                                                className="border rounded px-2 py-1 text-xs"
                                            />
                                            <button onClick={handleSaveEdit} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Lưu</button>
                                            <button onClick={() => setEditingId(null)} className="bg-gray-300 px-2 py-1 rounded text-xs">Hủy</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {new Date(appointment.expectedTime).toLocaleString('vi-VN')}
                                            <button onClick={() => handleEditClick(appointment)} className="text-blue-500 hover:text-blue-700">
                                                ✏️
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="max-w-xs truncate">
                                        {appointment.serviceIds.map(s => s.serviceName).join(', ')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                        ${appointment.status === 'ARRIVED' ? 'bg-green-100 text-green-800' :
                                            appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'}`}>
                                        {appointment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                    {appointment.status === 'BOOKED' && (
                                        <button onClick={() => handleStatusUpdate(appointment._id, 'ARRIVED')} className="text-green-600 hover:text-green-900 font-bold">Xác Nhận Đến</button>
                                    )}
                                    <button onClick={() => handleDelete(appointment._id)} className="text-red-500 hover:text-red-700 font-bold">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminBookingList;
