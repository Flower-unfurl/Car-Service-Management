import React, { useState, useRef } from 'react';
import axios from 'axios';
import OtpModal from '../components/modals/OtpModal';

export default function SignUpPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // State quản lý việc hiển thị modal OTP
    const [showOtpModal, setShowOtpModal] = useState(false);

    // Tránh spam click
    const isSubmitting = useRef(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required.';
        if (!formData.email) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format.';
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // BƯỚC 1: Gọi API yêu cầu OTP
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting.current) return;

        if (validateForm()) {
            isSubmitting.current = true;
            setLoading(true);

            try {
                // Gọi API gửi OTP thay vì signup trực tiếp
                await axios.post(
                    "http://localhost:5000/auth/request-otp",
                    formData
                );

                // Nếu gửi email thành công, mở Modal nhập OTP
                setShowOtpModal(true);

            } catch (error) {
                if (error.response) {
                    alert("Lỗi: " + error.response.data.message);
                } else {
                    alert("Lỗi kết nối mạng");
                }
            } finally {
                isSubmitting.current = false;
                setLoading(false);
            }
        }
    };

    // BƯỚC 2: Gọi API đăng ký (kèm thông tin + OTP)
    const handleVerifyOtp = async (otpCode) => {
        setLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:5000/auth/signup",
                { ...formData, otp: otpCode } // Gửi kèm cả form data và OTP code
            );

            alert("Đăng ký thành công: " + response.data.message);
            
            // Tắt Modal và reset form
            setShowOtpModal(false);
            setFormData({ name: '', email: '', password: '' });
            
            // TODO: Bạn có thể thêm lệnh chuyển trang (navigate('/login')) ở đây

        } catch (error) {
            if (error.response) {
                alert("Lỗi xác thực: " + error.response.data.message);
            } else {
                alert("Lỗi kết nối mạng");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4 relative">
            <div className="flex w-full max-w-[1100px] bg-white shadow-2xl overflow-hidden flex-row-reverse rounded-2xl">

                {/* Cột phải: Hình ảnh & Overlay */}
                <div className="hidden md:flex md:w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000"
                        alt="Mechanic"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1e5aa0]/85 flex flex-col justify-center px-12 text-white text-right">
                        <h2 className="text-3xl font-bold uppercase tracking-wider mb-4">Join Community</h2>
                        <div className="w-16 h-[3px] bg-white mb-6 ml-auto rounded-full"></div>
                        <p className="text-blue-100 text-sm italic">"Caring for your car is like taking care of your loved ones."</p>
                    </div>
                </div>

                {/* Cột trái: Form */}
                <div className="w-full md:w-1/2 p-10 bg-white">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-2xl font-bold text-center text-gray-800 uppercase mb-8">Create Account</h1>
                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            {/* Input Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                                <input name="name" type="text" placeholder="Enter your name" value={formData.name} className={`w-full px-4 py-3 rounded-lg border outline-none transition text-sm ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-[#1e5aa0]'}`} onChange={handleChange} />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Input Email */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                                <input name="email" type="email" placeholder="example@mail.com" value={formData.email} className={`w-full px-4 py-3 rounded-lg border outline-none transition text-sm ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#1e5aa0]'}`} onChange={handleChange} />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Input Password */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                                <div className="relative">
                                    <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} className={`w-full px-4 py-3 pr-10 rounded-lg border outline-none transition text-sm ${errors.password ? 'border-red-500' : 'border-gray-200 focus:border-[#1e5aa0]'}`} onChange={handleChange} />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-lg text-white font-bold uppercase text-xs transition shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e5aa0] hover:bg-[#164a85]'}`}
                            >
                                {loading && !showOtpModal ? "Đang gửi OTP..." : "Continue ›"}
                            </button>
                        </form>
                    </div>
                </div>

            </div>

            {/* Hiển thị Modal OTP khi showOtpModal = true */}
            {!showOtpModal && (
                <OtpModal 
                    email={formData.email} 
                    onVerify={handleVerifyOtp} 
                    onCancel={() => setShowOtpModal(false)} 
                />
            )}
            
        </div>
    );
}