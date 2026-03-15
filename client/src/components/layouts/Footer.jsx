import React from 'react';
import {
    ChevronRight, MapPin, Phone, Mail, Clock,
    Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';

const SOCIAL_MEDIA = [Facebook, Twitter, Mail, Instagram, Linkedin]
const SHORT_NAVIGATION_LEFT = ["Home", "Our Team", "Work", "Services"]
const SHORT_NAVIGATION_RIGHT = ["Sign In", "Register", "My Account", "FAQ"]
const RECENT_POST = [
    { title: "Engine services & renovation", date: "11 Jan 2017", img: "https://via.placeholder.com/60" },
    { title: "Polishing of automotive paint", date: "08 Jan 2017", img: "https://via.placeholder.com/60" },
    { title: "Changing the oil & air filters", date: "05 Jan 2017", img: "https://via.placeholder.com/60" }
]
const CONTACT_US = [
    { icon: MapPin, text: "Manchester M41 7TB, United Kingdom" },
    { icon: Phone, text: "+1 522-356-7800" },
    { icon: Mail, text: "support@autorepair.com" },
    { icon: Clock, text: "Monday to Friday: 8:00 - 18:00" }
]

const Footer = () => {
    return (
        <footer className="w-full font-sans text-gray-300 text-left">
            <div className="bg-[#1e5aa0] py-8 w-full flex justify-center">
                <div className="w-full md:w-[75%] px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-white text-md md:text-xl font-semibold text-center md:text-left">
                        Our company and car service run since 1982
                    </h2>
                    <button className="bg-white text-[#1e5aa0] px-6 py-2 text-sm font-bold uppercase hover:bg-gray-100 transition-colors whitespace-nowrap">
                        Our Team
                    </button>
                </div>
            </div>

            <div className="bg-[#0e2236] py-16 w-full flex justify-center">
                <div className="w-full md:w-[75%] px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div>
                        <h3 className="text-white font-bold text-md mb-6 uppercase relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-[#1e5aa0]">
                            About Us
                        </h3>
                        <p className="text-xs leading-7 mb-6 text-gray-400">
                            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum non odio pellentesque enim elementum posuere quis vitae tellus.
                        </p>
                        <div className="flex gap-2 mt-2">
                            {SOCIAL_MEDIA.map((Icon, index) => (
                                <a key={index} href="#" className="bg-[#1e5aa0] p-2 hover:bg-blue-700 transition-all">
                                    <Icon size={16} className="text-white fill-current" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold text-md mb-6 uppercase relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-[#1e5aa0]">
                            Short Navigation
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <ul className="space-y-3">
                                {SHORT_NAVIGATION_LEFT?.map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-gray-400 text-xs hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer">
                                        <ChevronRight size={14} className="text-blue-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <ul className="space-y-3">
                                {SHORT_NAVIGATION_RIGHT?.map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-gray-400 text-xs hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer">
                                        <ChevronRight size={14} className="text-blue-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold text-md mb-6 uppercase relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-[#1e5aa0]">
                            Recent Posts
                        </h3>
                        <div className="space-y-4">
                            {RECENT_POST?.map((post, i) => (
                                <div key={i} className="flex gap-4 items-center group cursor-pointer">
                                    <img
                                        src={post.img}
                                        alt="thumb"
                                        className="w-14 h-14 object-cover border border-gray-700 group-hover:border-blue-500"
                                    />
                                    <div>
                                        <h4 className="text-xs text-gray-400 group-hover:text-white transition-colors">
                                            {post.title}
                                        </h4>
                                        <span className="text-[10px] text-gray-500 uppercase">
                                            {post.date}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold text-md mb-6 uppercase relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-[#1e5aa0]">
                            Contact Us
                        </h3>
                        <ul className="space-y-4 text-xs text-gray-400">
                            {CONTACT_US.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <li key={index} className="flex items-center gap-3">
                                        <Icon size={18} className="text-white shrink-0" />
                                        <span>{item.text}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                </div>
            </div>

            <div className="bg-[#081a2b] py-6 w-full flex justify-center">
                <div className="w-full md:w-[75%] px-4 flex flex-col md:flex-row justify-between items-start text-[11px] uppercase tracking-widest text-gray-400">
                    <p className="mb-4 md:mb-0">© 2026 AutoRepair.</p>
                    <ul className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        {['Home', 'Our Team', 'Works', 'Services', 'Blog', 'Contact'].map((item) => (
                            <li key={item} className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center">
                                {item}
                                {item !== 'Contact' && <span className="ml-4 text-gray-600">|</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;