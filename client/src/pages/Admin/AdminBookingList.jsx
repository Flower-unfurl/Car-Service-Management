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

    if (loading) return <div className="p-6 text-center">Đang tải...</div>;

    return (
        <div className="w-full p-4 md:p-6">
            <h1 className="mb-6 text-2xl font-bold text-gray-800 md:text-3xl">Quản Lý Lịch Hẹn</h1>
            <div className="rounded-xl border border-gray-100 bg-white shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1120px] divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Khách Hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Biển Số</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Thời Gian Hẹn</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Dịch Vụ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Trạng Thái</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {appointments.map((appointment) => (
                                <tr key={appointment._id} className="transition-colors hover:bg-gray-50">
                                    <td className="px-6 py-4 align-top">
                                        <div className="text-sm font-bold text-gray-900">{appointment.customerName || '-'}</div>
                                        <div className="text-sm text-gray-500">{appointment.phone || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <span className="inline-block rounded border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                                            {appointment.licensePlate || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 align-top">
                                        {editingId === appointment._id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="datetime-local"
                                                    value={editForm.expectedTime}
                                                    onChange={(e) => setEditForm({ expectedTime: e.target.value })}
                                                    className="rounded border px-2 py-1 text-xs"
                                                />
                                                <button onClick={handleSaveEdit} className="rounded bg-blue-500 px-2 py-1 text-xs text-white">Lưu</button>
                                                <button onClick={() => setEditingId(null)} className="rounded bg-gray-300 px-2 py-1 text-xs">Hủy</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {new Date(appointment.expectedTime).toLocaleString('vi-VN')}
                                                <button onClick={() => handleEditClick(appointment)} className="text-blue-500 hover:text-blue-700" title="Chỉnh sửa thời gian">
                                                    ✏️
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 align-top">
                                        <div className="max-w-md whitespace-normal break-words">
                                            {appointment.serviceIds.map((s) => s.serviceName).join(', ') || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap align-top">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold leading-5 
                                            ${appointment.status === 'ARRIVED' ? 'bg-green-100 text-green-800' :
                                                appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex min-w-[170px] items-center gap-3 text-sm font-medium whitespace-nowrap">
                                            {appointment.status === 'BOOKED' && (
                                                <button onClick={() => handleStatusUpdate(appointment._id, 'ARRIVED')} className="font-bold text-green-600 hover:text-green-900">Xác Nhận Đến</button>
                                            )}
                                            <button onClick={() => handleDelete(appointment._id)} className="font-bold text-red-500 hover:text-red-700">Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBookingList;
