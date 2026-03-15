import React, { useState } from 'react';
import ServiceCard from '../components/cards/ServiceCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
const services = [
  {
    _id: "69b6e76f61c3290112b2bf26",
    serviceName: "Car Wash",
    description: "Standard exterior and interior wash",
    price: 15,
    vehicleType: "CAR",
    durationMinutes: 30,
    status: "ACTIVE",
    imageUrl: [
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80",
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80",
      "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&q=80"
    ],
    longDescription: [
      "Our standard car wash service brings a clean and shiny look to your vehicle. We use specialized soaps that do not harm the paint, combined with soft cleaning tools to remove dirt and mud on the car body.",
      "Besides exterior cleaning, we also perform basic vacuuming inside the cabin, wipe down the dashboard, and clean the windows, providing a comfortable and fresh interior space for you."
    ],
    features: [
      "Comprehensive foam wash for the exterior.",
      "Vacuuming of floors and seats.",
      "Cleaning of the windshield and windows.",
      "Basic tire cleaning and shining."
    ]
  },
  {
    _id: "69b6e76f61c3290112b2bf27",
    serviceName: "Oil Change",
    description: "Oil change and basic engine inspection",
    price: 45,
    vehicleType: "CAR",
    durationMinutes: 45,
    status: "ACTIVE",
    imageUrl: [
      "https://images.unsplash.com/photo-1632823471565-1ec2a71ec8bf?w=800&q=80",
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80"
    ],
    longDescription: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae tincidunt arcu. Maecenas sollicitudin, nibh ac imperdiet facilisis, est sem vulputate magna, at auctor urna ligula sit amet nisl. Phasellus turpis sem, suscipit nec nisl ut, tempus vehicula ligula. Quisque aliquam iaculis ipsum nec iaculis.",
      "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nullam non suscipit sapien. Integer tincidunt sagittis purus et pulvinar. Nam molestie risus est, egestas auctor lacus eleifend vitae."
    ],
    features: [
      "Nunc molestie libero accumsan convallis finibus.",
      "Mauris ac sapien facilisis, luctus lorem ac, auctor sapien.",
      "Pellentesque eget iaculis dolor, sit amet condimentum nisl.",
      "Aenean ut mi ac orci malesuada gravida.",
      "Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Donec lobortis nisi est, quis ullamcorper lacus consequat sed."
    ]
  },
  {
    _id: "69b6e76f61c3290112b2bf28",
    serviceName: "Interior Detail",
    description: "Deep cleaning of seats and cabin",
    price: 60,
    vehicleType: "CAR",
    durationMinutes: 60,
    status: "ACTIVE",
    imageUrl: [
      "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80",
      "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800&q=80",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80"
    ],
    longDescription: [
      "Restore the beauty and freshness to your car's interior space with our deep interior detailing service. We meticulously clean every detail, from door jambs and glove compartments to the car ceiling.",
      "Specifically, fabric seats will be steam-cleaned to remove stubborn stains, while leather seats will be gently cleaned and conditioned with premium products to keep the leather soft, prevent cracking, and extend its lifespan."
    ],
    features: [
      "Hot steam cleaning for carpets and fabric seats.",
      "Cleaning and conditioning of leather seats.",
      "Odor removal and antibacterial treatment for the AC system.",
      "Detailed cleaning of the dashboard, door panels, and crevices."
    ]
  },
  {
    _id: "69b6e76f61c3290112b2bf29",
    serviceName: "Car Polishing",
    description: "Paint polishing for a shiny finish",
    price: 80,
    vehicleType: "CAR",
    durationMinutes: 90,
    status: "ACTIVE",
    imageUrl: [
      "https://images.unsplash.com/photo-1552930294-6b595f4c2974?w=800&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
      "https://images.unsplash.com/photo-1550524514-9b30c44c538a?w=800&q=80"
    ],
    longDescription: [
      "Car paint polishing helps remove swirl marks, water spots, and surface oxidation, restoring a shiny, like-new finish to the paint. This process requires meticulous attention and high technique to avoid wearing down the original paint layer.",
      "After polishing, we apply a protective wax layer to enhance the shine, create a water-repellent effect, and protect the car paint from the harmful effects of UV rays."
    ],
    features: [
      "Multi-step machine polishing to remove swirl marks.",
      "Restoration of the original shine and color.",
      "Application of protective wax for enhanced deep gloss.",
      "Removal of stains and tar stuck on the surface."
    ]
  },
  {
    _id: "69b6e76f61c3290112b2bf2a",
    serviceName: "Brake Check",
    description: "Check brake system and brake pads",
    price: 25,
    vehicleType: "CAR",
    durationMinutes: 30,
    status: "ACTIVE",
    imageUrl: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
      "https://images.unsplash.com/photo-1506015391300-4152148407dc?w=800&q=80"
    ],
    longDescription: [
      "The braking system is the most important safety element on your vehicle. Our comprehensive brake inspection service will evaluate the operating condition of the entire system to ensure the car always stops safely and promptly.",
      "Our technicians will remove the wheels to measure brake pad wear, check the condition of the brake discs for scratches or warping, and inspect the brake fluid level and quality."
    ],
    features: [
      "Measuring brake pad thickness.",
      "Checking the surface and warping of brake discs.",
      "Checking for leaks and measuring brake fluid moisture.",
      "Inspecting brake caliper operation."
    ]
  },
  {
    _id: "69b6e76f61c3290112b2bf2b",
    serviceName: "Wheel Alignment",
    description: "Check and adjust wheel alignment",
    price: 40,
    vehicleType: "CAR",
    durationMinutes: 40,
    status: "ACTIVE",
    imageUrl: [
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80",
      "https://images.unsplash.com/photo-1635784063857-41712a2df149?w=800&q=80",
      "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&q=80"
    ],
    longDescription: [
      "Wheel alignment ensures the wheels are parallel to each other and perpendicular to the road according to the manufacturer's specifications. This helps the car drive straight, without pulling to the side or experiencing steering wheel vibrations.",
      "Using a modern 3D machinery system, we accurately adjust Camber, Caster, and Toe angles. Regular alignment not only makes driving safer and more comfortable but also extends tire life."
    ],
    features: [
      "Checking wheel alignment angles with 3D technology.",
      "Adjusting Camber, Caster, and Toe angles.",
      "Dynamic tire balancing (if necessary).",
      "Test driving to ensure a straight steering wheel and no pulling."
    ]
  },
  {
    _id: "69b6e76f61c3290112b2bf2c",
    serviceName: "Engine Cleaning",
    description: "Thorough cleaning of the engine bay",
    price: 30,
    vehicleType: "CAR",
    durationMinutes: 35,
    status: "ACTIVE",
    imageUrl: [
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80",
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
      "https://images.unsplash.com/photo-1586264560467-f584852d439b?w=800&q=80"
    ],
    longDescription: [
      "Cleaning the engine bay not only improves aesthetics but also helps the engine dissipate heat better, maintains stable performance, and limits the risk of fire hazards caused by long-term accumulated grease.",
      "We carefully cover sensitive electronic components before using specialized cleaning solutions to break down grease and dirt. Afterward, the engine bay is blow-dried and coated with a conditioner to refresh the plastic and rubber parts."
    ],
    features: [
      "Safely masking electrical systems and the ECU box.",
      "Removing grease and rust with specialized degreasers.",
      "Blow-drying the entire engine bay with compressed air.",
      "Conditioning plastic and rubber details in the engine bay."
    ]
  },
  {
    _id: "69b6e76f61c3290112b2bf2d",
    serviceName: "Filter Replacement",
    description: "Inspect and replace engine air filter",
    price: 20,
    vehicleType: "CAR",
    durationMinutes: 20,
    status: "ACTIVE",
    imageUrl: [
      "https://images.unsplash.com/photo-1600049253457-36e4f3a9e325?w=800&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80"
    ],
    longDescription: [
      "The engine air filter acts as the lungs of your car, preventing dirt and impurities from entering the combustion chamber. A clean air filter helps the engine run smoothly, optimizes fuel combustion, and increases power output.",
      "We will remove and check the condition of your current air filter. If the filter is overly dirty or clogged, we will replace it with a new OEM standard product, helping your car's engine 'breathe' easier."
    ],
    features: [
      "Checking the dirt level of the engine air filter.",
      "Cleaning the air filter housing.",
      "Replacing with a new high-quality air filter (OEM).",
      "Checking the cabin air filter upon customer request."
    ]
  }
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
            <div className="py-15 pt-3 w-full flex justify-center bg-gray-100">
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