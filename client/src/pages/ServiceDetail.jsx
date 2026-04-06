import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Hoặc instance axios tùy chỉnh của bạn

const ServiceDetail = () => {
    const { id } = useParams(); // Lấy ID từ URL (ví dụ: /services/:id)
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
console.log(useParams())
    useEffect(() => {
        const fetchServiceDetail = async () => {
            try {
                setLoading(true);
                // Gọi tới API bạn vừa viết ở phía Backend
                const response = await axios.get(`http://localhost:5000/service/${id}`);
                
                if (response.data.success) {
                    setService(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching service detail:", err);
                setError(err.response?.data?.message || "Không thể tải chi tiết dịch vụ");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchServiceDetail();
    }, [id]);

    if (loading) return (
        <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="w-full py-10 text-center text-red-500 font-semibold">
            {error}
        </div>
    );

    if (!service) return <div className="text-center py-10">Dịch vụ không tồn tại.</div>;

    return (
        <div className="w-[75%] mx-auto font-sans py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Cột Trái: Hình ảnh */}
                <div className="w-full h-full min-h-[400px]">
                    <img
                        src={service.imageUrl && service.imageUrl[0] ? service.imageUrl[0] : "https://via.placeholder.com/800x600?text=No+Image"}
                        alt={service.serviceName}
                        className="w-full h-full object-cover shadow-sm rounded-lg"
                    />
                </div>

                {/* Cột Phải: Nội dung chi tiết */}
                <div className="flex flex-col">
                    {/* Tiêu đề */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-700 uppercase tracking-wide pb-3 border-b border-gray-300">
                            {service.serviceName} – DESCRIPTION
                        </h2>
                    </div>

                    {/* Giá và Thời gian (Optional - Thêm vào để đầy đủ thông tin) */}
                    <div className="mb-4 flex gap-4 text-sm font-medium">
                        <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            Price: ${service.price}
                        </span>
                        <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            Duration: {service.durationMinutes} mins
                        </span>
                    </div>

                    {/* Mô tả dài (render từng đoạn văn) */}
                    <div className="space-y-4 mb-8 text-gray-500 text-sm leading-relaxed text-justify">
                        {service.longDescription && service.longDescription.length > 0 ? (
                            service.longDescription.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))
                        ) : (
                            <p>{service.description}</p>
                        )}
                    </div>

                    {/* Danh sách các tính năng / lợi ích */}
                    <ul className="space-y-3">
                        {service.features?.map((feature, index) => (
                            <li
                                key={index}
                                className="flex items-start py-2 border-b border-gray-100 last:border-b-0"
                            >
                                {/* Dấu Check Icon màu xanh */}
                                <span className="mr-3 mt-0.5 text-blue-600 flex-shrink-0">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                                {/* Nội dung text */}
                                <span className="text-sm text-gray-600">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                    
                    {/* Nút hành động (Ví dụ: Đặt lịch) */}
                    <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300 uppercase text-sm">
                        Book This Service
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;