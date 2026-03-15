import React from 'react';
const service = {
    _id: "69b6e2e161c3290112b2bf1a",
    serviceName: "Car Wash",
    description: "Standard exterior and interior wash",
    price: 15,
    vehicleType: "CAR",
    durationMinutes: 30,
    status: "ACTIVE",
    imageUrl: [
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80",
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80"
    ],
    longDescription: [
        "Our standard car wash service gives your vehicle a clean and shiny appearance. We use specialized car-safe soap that protects the paint while effectively removing dirt and mud from the exterior surface.",
        "In addition to exterior cleaning, we also perform basic interior vacuuming, wipe the dashboard, and clean the windows to provide a comfortable driving space."
    ],
    features: [
        "Full exterior foam wash.",
        "Vacuum cleaning for floor and seats.",
        "Cleaning of windshield and side windows.",
        "Basic tire cleaning and shine treatment."
    ]
}

const ServiceDetail = () => {
    return (
        <div className="w-[75%] mx-auto font-sans py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="w-full h-full min-h-[400px]">
                    <img
                        src={service.imageUrl[0]}
                        alt={service.serviceName}
                        className="w-full h-full object-cover shadow-sm"
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

                    {/* Mô tả dài (render từng đoạn văn) */}
                    <div className="space-y-4 mb-8 text-gray-500 text-sm leading-relaxed text-justify">
                        {service.longDescription?.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
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
                </div>

            </div>
        </div>
    );
};

export default ServiceDetail;