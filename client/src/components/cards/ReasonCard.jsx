import React from 'react'

export default function ReasonCard({ item }) {
    return (
        <div key={item.id} className="bg-white p-8 shadow-sm border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group animate-in fade-in slide-in-from-right-4">
            <div className="w-16 h-16 bg-[#1e5aa0] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
            </div>
            <h3 className="text-[#1e5aa0] font-bold text-sm uppercase mb-4 tracking-wider">{item.title}</h3>
            <p className="text-gray-500 text-[13px] leading-relaxed">{item.desc}</p>
        </div>
    )
}
