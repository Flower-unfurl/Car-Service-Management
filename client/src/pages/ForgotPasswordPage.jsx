import React, { useState } from "react";
import OtpModal from "../components/modals/OtpModal";
import axios from "axios";
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(4); // 1: nhập email, 2: nhập OTP, 3: nhập mật khẩu mới
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Bước 1: Gửi OTP về email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!email) {
            setError("Vui lòng nhập email");
            return;
        }
        setLoading(true);
        try {
            await axios.post("http://localhost:5000/auth/request-reset-otp", {
                email,
            });
            setStep(2);
            setSuccess("Mã OTP đã được gửi đến email của bạn.");
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi gửi OTP");
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Xác thực OTP qua OtpModal
    const handleVerifyOtp = async (otpCode) => {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            // Gửi otpCode nhận được từ Modal lên server để kiểm tra
            await axios.post("http://localhost:5000/auth/verify-reset-otp", {
                email,
                otp: otpCode,
            });

            // QUAN TRỌNG: Lưu otpCode vào state của trang ForgotPasswordPage
            setOtp(otpCode);

            setStep(3);
            setSuccess("Xác thực OTP thành công. Hãy nhập mật khẩu mới.");
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi xác thực OTP");
        } finally {
            setLoading(false);
        }
    };

    // Bước 3: Đổi mật khẩu mới
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        // Kiểm tra độ mạnh mật khẩu
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError(
                "Mật khẩu phải từ 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt",
            );
            return;
        }
        setLoading(true);
        try {
            await axios.post("http://localhost:5000/auth/reset-password", {
                email,
                otp,
                newPassword,
            });
            setSuccess(
                "Đổi mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.",
            );
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi đổi mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-center mb-6">
                    Quên mật khẩu
                </h2>
                {error && (
                    <div className="text-red-500 text-center mb-3">{error}</div>
                )}
                {success && (
                    <div className="text-green-600 text-center mb-3">
                        {success}
                    </div>
                )}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-lg border outline-none transition text-sm border-gray-200 focus:border-[#1e5aa0]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email đăng ký"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg text-white font-bold uppercase text-xs transition shadow-md bg-[#1e5aa0] hover:bg-[#164a85]"
                        >
                            {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
                        </button>
                    </form>
                )}
                {step === 2 && (
                    <OtpModal
                        email={email}
                        onVerify={handleVerifyOtp}
                        onCancel={() => setStep(1)}
                        length={6}
                    />
                )}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-lg border outline-none transition text-sm border-gray-200 focus:border-[#1e5aa0]"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg text-white font-bold uppercase text-xs transition shadow-md bg-[#1e5aa0] hover:bg-[#164a85]"
                        >
                            {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                        </button>
                    </form>
                )}
                {step === 4 && (
                    <div className="text-center space-y-5">
                        <div className="flex justify-center">
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg
                                    className="w-12 h-12 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <p className="text-gray-600">
                            Mật khẩu của bạn đã được cập nhật thành công. Bây
                            giờ bạn có thể đăng nhập bằng mật khẩu mới.
                        </p>
                        <Link
                            to="/signin" // Thay đổi đường dẫn này cho đúng với Route của bạn (vd: /login)
                            className="block w-full py-3 rounded-lg text-white font-bold uppercase text-xs transition shadow-md bg-[#1e5aa0] hover:bg-[#164a85] text-center"
                        >
                            Quay lại Đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
