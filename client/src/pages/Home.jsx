import React, { useEffect, useState } from "react";
import ServiceCard from "../components/cards/ServiceCard";
import {
    Car,
    ChevronLeft,
    ChevronRight,
    Disc,
    Zap,
    Wrench,
    Users,
    Monitor,
    ShieldCheck,
    Clock,
    Settings,
    Award,
    Headphones,
} from "lucide-react";
import ReasonCard from "../components/cards/ReasonCard";
import QuestionsAndNews from "../components/QuestionsAndNews";
import axios from "axios";

const reasons = [
    {
        id: 1,
        title: "Professional Services",
        icon: <Wrench size={32} />,
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec.",
    },
    {
        id: 2,
        title: "Skilled Workers",
        icon: <Users size={32} />,
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec.",
    },
    {
        id: 3,
        title: "Repair & Electronics",
        icon: <Monitor size={32} />,
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec.",
    },
    {
        id: 4,
        title: "Long Term Warranty",
        icon: <ShieldCheck size={32} />,
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec.",
    },
    {
        id: 5,
        title: "Quick Turnaround",
        icon: <Clock size={32} />,
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec.",
    },
    {
        id: 6,
        title: "Advanced Tools",
        icon: <Settings size={32} />,
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec.",
    },
    {
        id: 7,
        title: "Certified Quality",
        icon: <Award size={32} />,
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec.",
    },
    {
        id: 8,
        title: "24/7 Support",
        icon: <Headphones size={32} />,
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec.",
    },
];

const LIMIT = 4;

export default function Home() {
    const [services, setServices] = useState([]);
    const [reasonIdx, setReasonIdx] = useState(0);
    const [page, setPage] = useState(0); // page đã fetch
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Logic Next/Prev cho Reasons
    const nextReason = () => {
        if (reasonIdx < reasons.length - LIMIT)
            setReasonIdx((prev) => prev + 1);
    };
    const prevReason = () => {
        if (reasonIdx > 0) setReasonIdx((prev) => prev - 1);
    };

    // Fetch lần đầu
    useEffect(() => {
        fetchServices(0);
    }, []);

    const fetchServices = async (pageToFetch) => {
        setLoading(true);
        console.log(pageToFetch)
        try {
            const res = await axios.get(
                `http://localhost:5000/service?page=${pageToFetch}&limit=${LIMIT}`,
            );
            
            const { data, hasMore } = res.data;

            setServices(data);
            setHasMore(hasMore);
            setPage(pageToFetch);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const nextService = () => {
        if (hasMore && !loading) {
            fetchServices(page + 1);
        }
    };

    const prevService = () => {
        if (page > 0 && !loading) {
            fetchServices(page - 1);
        }
    };

    const canNext = hasMore;
    const canPrev = page > 0;

    return (
        <div className="min-h-screen bg-white">
            <section className="py-20 bg-gray-50 flex justify-center w-full">
                <div className="w-[75%] max-w-[1200px]">
                    <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4 relative">
                        <div className="relative">
                            <h2 className="text-xl font-medium text-gray-800 uppercase tracking-tight">
                                Why Choose Us?
                            </h2>
                            <div className="absolute -bottom-[17px] left-0 w-20 h-[3px] bg-[#1e5aa0]"></div>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={prevReason}
                                className={`w-8 h-8 flex items-center justify-center transition-all duration-300 ${reasonIdx > 0 ? "bg-[#1e5aa0] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={nextReason}
                                className={`w-8 h-8 flex items-center justify-center transition-all duration-300 ${reasonIdx < reasons.length - LIMIT ? "bg-[#1e5aa0] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {reasons
                            .slice(reasonIdx, reasonIdx + LIMIT)
                            .map((item) => (
                                <ReasonCard item={item} />
                            ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white flex justify-center w-full">
                <div className="w-[75%] max-w-[1200px]">
                    <div className="text-center mb-16 relative">
                        <h2 className="text-xl font-medium tracking-widest text-gray-800 uppercase">
                            About{" "}
                            <span className="text-[#1e5aa0] font-bold">
                                AutoRepair
                            </span>
                        </h2>
                        <div className="mt-4 flex justify-center">
                            <div className="w-16 h-[2px] bg-[#1e5aa0]"></div>
                        </div>
                        <div className="absolute top-[50%] left-0 w-full h-[1px] bg-gray-100 -z-10"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex items-start gap-4">
                            <div className="text-[#1e5aa0] flex-shrink-0 mt-1">
                                <Zap size={40} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[#1e5aa0] font-semibold text-sm uppercase mb-2 tracking-wider">
                                    Renovation Engine
                                </h3>
                                <p className="text-gray-500 text-[13px] leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit. Proin rutrum convallis
                                    ligula nec lipsum amet.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="text-[#1e5aa0] flex-shrink-0 mt-1">
                                <Disc size={40} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[#1e5aa0] font-semibold text-sm uppercase mb-2 tracking-wider">
                                    Brake Pads
                                </h3>
                                <p className="text-gray-500 text-[13px] leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit. Proin rutrum convallis
                                    ligula nec lipsum amet.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="text-[#1e5aa0] flex-shrink-0 mt-1">
                                <Car size={40} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[#1e5aa0] font-semibold text-sm uppercase mb-2 tracking-wider">
                                    Car Wash & Care
                                </h3>
                                <p className="text-gray-500 text-[13px] leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit. Proin rutrum convallis
                                    ligula nec lipsum amet.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
                    <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop"
                            alt="Engine Repair"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000&auto=format&fit=crop"
                            alt="Oil Change"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop"
                            className="w-full h-full object-cover"
                            alt="background"
                        />
                    </div>

                    <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=1000&auto=format&fit=crop"
                            alt="Diagnostics"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            <section className="py-15 pt-3 w-full flex justify-center bg-gray-100">
                <div className="w-[75%] py-10">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                        <div className="relative">
                            <h2 className="text-xl text-black leading-relaxed mb-1 uppercase font-medium">
                                Our Services
                            </h2>
                            <div className="absolute -bottom-[14px] left-0 w-12 h-[3px] bg-[#1e5aa0]"></div>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={prevService}
                                disabled={!canPrev}
                                className={`w-8 h-8 flex items-center justify-center transition-all duration-300 
                                    ${canPrev ? "bg-[#1e5aa0] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={nextService}
                                disabled={!canNext || loading}
                                className={`w-8 h-8 flex items-center justify-center transition-all duration-300 
                                    ${canNext ? "bg-[#1e5aa0] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                            >
                                {loading ? (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <ChevronRight size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {services.map((service) => (
                            <div
                                key={service._id}
                                className="animate-in fade-in slide-in-from-right-5 duration-500"
                            >
                                <ServiceCard service={service} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <QuestionsAndNews />
        </div>
    );
}
