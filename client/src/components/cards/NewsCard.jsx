import React from 'react';

const NewsCard = ({ image, title, author, date, category, excerpt }) => {
    return (
        <div className="flex flex-col gap-4">
            {/* Ảnh bài viết */}
            <div className="overflow-hidden h-[180px]">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Thông tin bài viết */}
            <div className="flex flex-col gap-2">
                <h3 className="text-[#1e5aa0] font-bold text-[14px] uppercase leading-tight cursor-pointer hover:underline">
                    {title}
                </h3>

                <div className="text-gray-400 text-[11px] flex gap-2 uppercase tracking-wider">
                    <span>By {author}</span>
                    <span>/</span>
                    <span>{date}</span>
                    <span>/</span>
                    <span className="text-gray-500">{category}</span>
                </div>

                <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-3">
                    {excerpt}
                </p>
            </div>
        </div>
    );
};

export default NewsCard;