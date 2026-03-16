import React from 'react';
import { Plus, Minus } from 'lucide-react';

const AccordionItem = ({ title, content, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-200">
            <button
                className="w-full py-4 flex justify-between items-center text-left transition-all"
                onClick={onClick}
            >
                <span className={`text-[14px] font-medium uppercase tracking-tight ${isOpen ? 'text-[#1e5aa0]' : 'text-gray-600'}`}>
                    {title}
                </span>
                {isOpen ? (
                    <Minus size={16} className="text-[#1e5aa0]" />
                ) : (
                    <Plus size={16} className="text-gray-400" />
                )}
            </button>

            {/* Nội dung khi mở */}
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-4' : 'max-h-0'}`}>
                <p className="text-gray-500 text-[13px] leading-relaxed">
                    {content}
                </p>
            </div>
        </div>
    );
};

export default AccordionItem;