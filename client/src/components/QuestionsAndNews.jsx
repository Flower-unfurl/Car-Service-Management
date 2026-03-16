import React, { useState } from 'react';
import AccordionItem from './AccordionItem';
import NewsCard from './cards/NewsCard';

const QuestionsAndNews = () => {
    const [openIndex, setOpenIndex] = useState(2); // Mặc định mở mục thứ 3 giống trong ảnh

    const faqs = [
        { title: "Who is AutoRepair?", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris elit ex, rhoncus a mauris at, consectetur placerat elit." },
        { title: "What services do we provide?", content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
        { title: "Our service and application", content: "Mauris elit ex, rhoncus a mauris at, consectetur placerat elit. Nam facilisis sollicitudin nunc. Etiam sed mattis urna, nec aliquam augue. In nisi dolor, tempor sit amet aliquet interdum." },
        { title: "Technology and Innovation", content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    ];

    const news = [
        {
            image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=500",
            title: "What Workshop Choose?",
            author: "John Doe",
            date: "18 Jan 2017",
            category: "Mechanics",
            excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec lipsum amet."
        },
        {
            image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=500",
            title: "Restoration of Car Paint",
            author: "John Doe",
            date: "15 Jan 2017",
            category: "Mechanics",
            excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin rutrum convallis ligula nec lipsum amet."
        }
    ];

    return (
        <section className="py-20 bg-white flex justify-center w-full">
            <div className="w-[75%] max-w-[1200px]">

                {/* Tiêu đề Section */}
                <div className="text-center mb-16 relative">
                    <h2 className="text-xl font-medium tracking-widest text-gray-800 uppercase">
                        Questions <span className="text-gray-500">&</span> News
                    </h2>
                    <div className="mt-4 flex justify-center">
                        {/* Thanh xanh nằm dưới chữ Questions */}
                        <div className="w-16 h-[2px] bg-[#1e5aa0]"></div>
                    </div>
                    <div className="absolute top-[50%] left-0 w-full h-[1px] bg-gray-100 -z-10"></div>
                </div>

                {/* Bố cục Grid 2 cột */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Cột trái: Accordion */}
                    <div className="flex flex-col border-t border-gray-200">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                title={faq.title}
                                content={faq.content}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                            />
                        ))}
                    </div>

                    {/* Cột phải: News */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {news.map((item, index) => (
                            <NewsCard key={index} {...item} />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default QuestionsAndNews;