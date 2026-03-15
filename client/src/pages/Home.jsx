import React, { useState } from 'react';
import ServiceCard from '../components/cards/ServiceCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
    // Đã dịch nội dung sang Tiếng Anh và đổi giá tiền sang USD (mức giá tượng trưng)
    const services = [
        { _id: "svc001", serviceName: "Car Wash", description: "Standard exterior and interior wash", price: 15, vehicleType: "CAR", durationMinutes: 30, status: "ACTIVE" },
        { _id: "svc002", serviceName: "Oil Change", description: "Oil change and basic engine inspection", price: 45, vehicleType: "CAR", durationMinutes: 45, status: "ACTIVE" },
        { _id: "svc003", serviceName: "Interior Detail", description: "Deep cleaning of seats and cabin", price: 60, vehicleType: "CAR", durationMinutes: 60, status: "ACTIVE" },
        { _id: "svc004", serviceName: "Car Polishing", description: "Paint polishing for a shiny finish", price: 80, vehicleType: "CAR", durationMinutes: 90, status: "ACTIVE" },
        { _id: "svc005", serviceName: "Brake Check", description: "Check brake system and brake pads", price: 25, vehicleType: "CAR", durationMinutes: 30, status: "ACTIVE" },
        { _id: "svc006", serviceName: "Wheel Alignment", description: "Check and adjust wheel alignment", price: 40, vehicleType: "CAR", durationMinutes: 40, status: "ACTIVE" },
        { _id: "svc007", serviceName: "Engine Cleaning", description: "Thorough cleaning of the engine bay", price: 30, vehicleType: "CAR", durationMinutes: 35, status: "ACTIVE" },
        { _id: "svc008", serviceName: "Filter Replacement", description: "Inspect and replace engine air filter", price: 20, vehicleType: "CAR", durationMinutes: 20, status: "ACTIVE" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 4; // Hiển thị 5 card

    const nextSlide = () => {
        if (currentIndex < services.length - itemsPerPage) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* --- SECTION: OUR SERVICES --- */}
            <div className="py-15 w-full flex justify-center bg-gray-100">
                <div className="w-[75%]">
                    
                    {/* Header: Title + Nav Buttons */}
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                        <div className="relative">
                            <h2 className="text-md text-black leading-relaxed mb-1 line-clamp-2 ">
                                Our Services
                            </h2>
                            <div className="absolute -bottom-[14px] left-0 w-12 h-[3px] bg-[#1e5aa0]"></div>
                        </div>

                        {/* Navigation Buttons (Làm nhỏ lại w-8 h-8) */}
                        <div className="flex gap-1">
                            <button 
                                onClick={prevSlide}
                                className={`w-8 h-8 flex items-center justify-center transition-all duration-300 cursor-pointer
                                    ${currentIndex > 0 
                                        ? 'bg-[#1e5aa0] text-white' 
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                onClick={nextSlide}
                                className={`w-8 h-8 flex items-center justify-center transition-all duration-300 cursor-pointer
                                    ${currentIndex < services.length - itemsPerPage 
                                        ? 'bg-[#1e5aa0] text-white' 
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Services Grid (Chia 5 cột trên màn hình lớn) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {services.slice(currentIndex, currentIndex + itemsPerPage).map((service) => (
                            <div key={service._id} className="animate-in fade-in slide-in-from-right-5 duration-500">
                                <ServiceCard service={service} />
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}