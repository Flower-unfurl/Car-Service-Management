import React, { useState } from 'react';
import {
    Phone, Mail, MapPin, Clock, Search,
    Facebook, Twitter, Instagram, ChevronDown, Menu, X
} from 'lucide-react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                            Home <ChevronDown size={14} />
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
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer border-b lg:border-none border-blue-400">Blog</li>
                        <li className="py-4 px-4 hover:bg-blue-700 cursor-pointer">Contact</li>
                    </ul>

                    <div className="hidden lg:block py-4 px-4 cursor-pointer hover:bg-blue-700">
                        <Search size={20} />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;