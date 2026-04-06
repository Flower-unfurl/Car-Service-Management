import React, { useState } from 'react';
import { useUser } from '../../hooks/UseUser';
import {
    Phone, Mail, MapPin, Clock, Search,
    Facebook, Twitter, Instagram, ChevronDown, Menu, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout, loading } = useUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="mx-auto font-sans">
            {/* 1. Top bar: Socials & Call to action */}
            <div className='bg-gray-100 mx-auto'>
                <div className="w-[75%] mx-auto py-2 px-4 md:px-10 flex justify-between items-center text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-600" />
                        <span>Call us today and make an appointment: +1 522-356-7800</span>
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
                <div className="text-3xl font-black text-[#1e5aa0] tracking-tighter">
                    AUTOREPAIR
                </div>

                {/* Info Blocks (Responsive: Ẩn trên mobile nhỏ, hiện trên tablet trở lên) */}
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

            {/* 3. Navigation Bar (Màu xanh chủ đạo) */}
            <nav className={`w-[75%] mx-auto bg-[#1e5aa0] text-white transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col lg:flex-row justify-between items-center">
                    <ul className="flex flex-col lg:flex-row w-full lg:w-auto uppercase font-bold text-sm tracking-wide">
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400 flex items-center gap-1">
                            Home
                        </li>
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400 flex items-center gap-1">
                            Our Team <ChevronDown size={14} />
                        </li>
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400 flex items-center gap-1">
                            Works <ChevronDown size={14} />
                        </li>
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400 flex items-center gap-1">
                            Services <ChevronDown size={14} />
                        </li>
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400" onClick={() => window.location.href = '/booking'}>Đặt lịch</li>
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400" onClick={() => window.location.href = '/lookup'}>Tra cứu</li>
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400">Blog</li>
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer">Contact</li>
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer">
                            <Link to="/admin/zones">ADMIN ZONES</Link>
                        </li>
                        <li className="py-4 px-6 bg-orange-500 hover:bg-orange-600 font-extrabold cursor-pointer transition-all">
                            <Link to="/staff/entry">VEHICLE ENTRY</Link>
                        </li>
                    </ul>

                    <div className="hidden lg:block py-4 px-4 relative">
                        {loading ? null : user ? (
                            <div className="relative">
                                <span
                                    className="cursor-pointer font-semibold hover:bg-blue-700 px-2 py-1 rounded"
                                    onClick={() => setDropdownOpen((v) => !v)}
                                >
                                    {user.name}
                                </span>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-36 bg-white text-gray-800 rounded shadow-lg z-50">
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                            onClick={() => { setDropdownOpen(false); /* TODO: chuyển sang trang hồ sơ */ }}
                                        >
                                            Hồ sơ
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                            onClick={() => { logout(); setDropdownOpen(false); }}
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span
                                className="cursor-pointer font-semibold hover:bg-blue-700 px-2 py-1 rounded"
                                onClick={() => window.location.href = '/signin'}
                            >
                                Sign In
                            </span>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;