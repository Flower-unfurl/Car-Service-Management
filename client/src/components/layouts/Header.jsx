import React, { useEffect, useState } from "react";
import { useUser } from "../../hooks/UseUser";
import {
    Phone,
    MapPin,
    Clock,
    Facebook,
    Twitter,
    Instagram,
    ChevronDown,
    Menu,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout, loading } = useUser();
    const [services, setServices] = useState([]);
    const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [operationDropdownOpen, setOperationDropdownOpen] = useState(false);

    const adminLinks = [
        { to: "/admin/dispatch", label: "Dispatch" },
        { to: "/admin/bookings", label: "Bookings" },
        { to: "/admin/zones", label: "Zones" },
        { to: "/admin/materials", label: "Materials" },
    ];

    const staffLinks = [
        { to: "/staff/tasks", label: "My Tasks" },
        { to: "/staff/entry", label: "Vehicle Entry" },
    ];

    const operationLinks = user?.role === "ADMIN" ? adminLinks : user?.role === "STAFF" ? staffLinks : [];

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const res = await axios.get("http://localhost:5000/service/dropdown");
                if (res.data.success) {
                    setServices(res.data.data);
                }
            } catch (err) {
                console.error("Lỗi fetch services:", err);
            }
        };
        fetchDropdownData();
    }, []);

    return (
        <header className="mx-auto font-sans">
            {/* 1. Top bar: Socials & Call to action */}
            <div className="bg-gray-100 mx-auto">
                <div className="w-[75%] mx-auto py-2 px-4 md:px-10 flex justify-between items-center text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-600" />
                        <span>
                            Call us today and make an appointment: +1 522-356-7800
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Facebook size={14} className="cursor-pointer hover:text-blue-600" />
                        <Twitter size={14} className="cursor-pointer hover:text-blue-400" />
                        <span className="font-bold cursor-pointer">G+</span>
                        <Instagram size={14} className="cursor-pointer hover:text-pink-500" />
                    </div>
                </div>
            </div>

            {/* 2. Middle bar: Logo & Contact Info */}
            <div className="w-[75%] mx-auto bg-white py-6 px-4 md:px-10 flex flex-wrap justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-3xl font-black text-[#1e5aa0] tracking-tighter">
                    AUTOREPAIR
                </Link>

                {/* Info Blocks */}
                <div className="hidden lg:flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Phone size={20} className="text-blue-700 fill-current" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">+1 522-356-7800</p>
                            <p className="text-xs text-gray-500 underline">support@autorepair.com</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <MapPin size={20} className="text-blue-700" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">Phoenix Way, Stretford</p>
                            <p className="text-xs text-gray-500">Manchester M41 7TB, UK</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Clock size={20} className="text-blue-700" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">8:00 - 18:00</p>
                            <p className="text-xs text-gray-500">Monday to Friday</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-gray-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* 3. Navigation Bar */}
            <nav className={`w-[75%] mx-auto bg-[#1e5aa0] text-white transition-all duration-300 ${isMenuOpen ? "block" : "hidden lg:block"}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col lg:flex-row justify-between items-center">
                    <ul className="flex flex-col lg:flex-row w-full lg:w-auto uppercase font-bold text-sm tracking-wide">
                        <li className="hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400">
                            <Link to="/" className="flex items-center gap-1 py-4 px-4 w-full">Home</Link>
                        </li>

                        {/* Services Dropdown */}
                        <li
                            className="relative hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400 group"
                            onMouseEnter={() => setServiceDropdownOpen(true)}
                            onMouseLeave={() => setServiceDropdownOpen(false)}
                            onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)} // Hỗ trợ mobile
                        >
                            <div className="flex items-center gap-1 py-4 px-4 w-full">
                                Services <ChevronDown size={14} />
                            </div>
                            
                            {serviceDropdownOpen && (
                                <ul className="absolute top-full left-0 w-48 bg-white text-gray-800 shadow-xl z-[60] border-t-2 border-orange-500">
                                    {services.map((item) => (
                                        <li key={item._id} className="hover:bg-gray-100 border-b border-gray-100">
                                            <Link
                                                to={`/services/${item._id}`}
                                                className="block px-4 py-3 text-sm font-medium capitalize"
                                            >
                                                {item.serviceName}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>

                        <li className="hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400">
                            <Link to="/booking" className="block py-4 px-4 w-full">Đặt lịch</Link>
                        </li>
                        <li className="hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400">
                            <Link to="/lookup" className="block py-4 px-4 w-full">Tra cứu</Link>
                        </li>

                        {operationLinks.length > 0 && (
                            <li
                                className="relative hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400"
                                onMouseEnter={() => setOperationDropdownOpen(true)}
                                onMouseLeave={() => setOperationDropdownOpen(false)}
                                onClick={() => setOperationDropdownOpen((prev) => !prev)}
                            >
                                <div className="flex items-center gap-1 py-4 px-4 w-full">
                                    {user?.role === "ADMIN" ? "Quản trị" : "Công việc"} <ChevronDown size={14} />
                                </div>

                                {operationDropdownOpen && (
                                    <ul className="absolute top-full left-0 w-52 bg-white text-gray-800 shadow-xl z-[60] border-t-2 border-orange-500">
                                        {operationLinks.map((item) => (
                                            <li key={item.to} className="hover:bg-gray-100 border-b border-gray-100">
                                                <Link
                                                    to={item.to}
                                                    className="block px-4 py-3 text-sm font-semibold"
                                                    onClick={() => setOperationDropdownOpen(false)}
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        )}

                        {user?.role === "ADMIN" && (
                            <li className="bg-orange-500 hover:bg-orange-600 font-extrabold cursor-pointer transition-all">
                                <Link to="/admin/dispatch" className="block py-4 px-6 w-full">DISPATCH BOARD</Link>
                            </li>
                        )}

                        {user?.role === "STAFF" && (
                            <li className="bg-orange-500 hover:bg-orange-600 font-extrabold cursor-pointer transition-all">
                                <Link to="/staff/tasks" className="block py-4 px-6 w-full">MY TASKS</Link>
                            </li>
                        )}
                    </ul>

                    {/* User Auth Section */}
                    <div className="py-4 px-4 relative w-full lg:w-auto text-center lg:text-left">
                        {loading ? null : user ? (
                            <div className="relative inline-block">
                                <span
                                    className="cursor-pointer font-semibold hover:bg-blue-700 px-2 py-1 rounded"
                                    onClick={() => setDropdownOpen((v) => !v)}
                                >
                                    {user.name}
                                </span>
                                {dropdownOpen && (
                                    <div className="absolute right-0 lg:right-0 left-0 lg:left-auto mt-2 w-36 bg-white text-gray-800 rounded shadow-lg z-50 mx-auto">
                                        <Link
                                            to="/profile"
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Hồ sơ
                                        </Link>
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-medium"
                                            onClick={() => {
                                                logout();
                                                setDropdownOpen(false);
                                            }}
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/signin"
                                className="cursor-pointer font-semibold hover:bg-blue-700 px-4 py-2 rounded inline-block"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;