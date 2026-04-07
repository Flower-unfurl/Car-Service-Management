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
        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter.';
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one lowercase letter.';
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number.';
        } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one special character.';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
        <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">

            {/* LEFT: FORM */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="max-w-md w-full mx-auto">
                    <h1 className="text-2xl font-bold text-center text-gray-800 uppercase mb-8">
                        Create Account
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Name */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase mb-1 block">
                                Full Name
                            </label>
                            <input
                                name="name"
                                type="text"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition 
                                ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-[#1e5aa0]'}`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase mb-1 block">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                placeholder="example@mail.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition 
                                ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#1e5aa0]'}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase mb-1 block">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 pr-12 rounded-lg border text-sm outline-none transition 
                                    ${errors.password ? 'border-red-500' : 'border-gray-200 focus:border-[#1e5aa0]'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-white font-bold uppercase text-xs transition shadow 
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e5aa0] hover:bg-[#164a85]'}`}
                        >
                            {loading && !showOtpModal ? "Đang gửi OTP..." : "Continue ›"}
                        </button>
                    </form>

                    {/* 🔥 FIX: move xuống trong card */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Đã có tài khoản?{" "}
                        <a href="/signin" className="text-[#1e5aa0] font-semibold hover:underline">
                            Sign in
                        </a>
                        <br />
                        Quên mật khẩu?{" "}
                        <a href="/forgot-password" className="text-[#1e5aa0] font-semibold hover:underline">
                            Forgot password
                        </a>
                    </div>
                </div>
            </div>

            {/* RIGHT: IMAGE */}
            <div className="hidden md:block relative">
                <img
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000"
                    alt="Mechanic"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#1e5aa0]/80 flex flex-col justify-center items-end text-right px-10 text-white">
                    <h2 className="text-3xl font-bold uppercase mb-4">
                        Join Community
                    </h2>
                    <div className="w-16 h-[3px] bg-white mb-6 rounded-full"></div>
                    <p className="text-sm text-blue-100 italic max-w-xs">
                        "Caring for your car is like taking care of your loved ones."
                    </p>
                </div>
            </div>
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
            <OtpModal
                email={formData.email}
                onVerify={handleVerifyOtp}
                onCancel={() => setShowOtpModal(false)}
            />
        )}
    </div>
);
}