import React, { useState } from 'react';
import { Clock, Car, ChevronRight } from 'lucide-react';

const ServiceCard = ({ service }) => {
    const [isRead, setIsRead] = useState(false);

    // Format giá tiền sang Đô la (USD)
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div
            // Thêm border-2, và hiệu ứng hover đổi màu viền sang xanh
            className={`w-full overflow-hidden transition-all duration-300 border-2 cursor-pointer group
                ${isRead 
                    ? 'bg-[#1e5aa0] text-white border-[#1e5aa0]' 
                    : 'bg-white text-gray-800 border-gray-100 hover:border-[#1e5aa0] hover:shadow-lg'}`}
        >
            {/* 1. Hình ảnh dịch vụ (Giảm chiều cao h-56 xuống h-40) */}
            <div className="relative h-40 w-full overflow-hidden">
                <img
                    src={service.imageUrl || "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800"}
                    alt={service.serviceName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-sm text-[#1e5aa0] text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <Car size={12} /> {service.vehicleType}
                </div>
            </div>

            {/* 2. Nội dung card (Giảm padding từ p-6 xuống p-4) */}
            <div className="p-4">
                <h3 className={`text-sm font-bold uppercase tracking-wide mb-2 line-clamp-1
                    ${isRead ? 'text-white' : 'text-[#1e5aa0]'}`}>
                    {service.serviceName}
                </h3>

                <p className={`text-[11px] leading-relaxed mb-4 line-clamp-2 
                     ${isRead ? 'text-blue-100' : 'text-gray-500'}`}>
                    {service.description}
                </p>

                {/* Thông tin thêm: Thời gian và Giá */}
                <div className="flex justify-between items-center mb-4 border-t pt-3 border-gray-200/30">
                    <div className="flex items-center gap-1.5 text-[11px] italic">
                        <Clock size={14} />
                        <span>{service.durationMinutes} mins</span>
                    </div>
                    <div className="font-black text-base">
                        {formatPrice(service.price)}
                    </div>
                </div>

                {/* 3. Nút Read More (Làm nhỏ padding và text size) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Ngăn event click lan ra ngoài nếu sau này ông bọc thẻ Link ở ngoài card
                        setIsRead(!isRead);
                    }}
                    className={`cursor-pointer w-full py-2 px-4 border-1 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2
                        ${isRead
                            ? 'bg-white text-[#1e5aa0] border-white hover:bg-blue-50'
                            : 'border-gray-200 text-[#1e5aa0] group-hover:bg-[#1e5aa0] group-hover:text-white group-hover:border-[#1e5aa0]'}`}
                >
                    {isRead ? 'DONE' : 'READ MORE'}
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default ServiceCard;