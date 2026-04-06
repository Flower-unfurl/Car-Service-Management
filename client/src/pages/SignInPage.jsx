import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/UseUser";

export default function SignInPage() {
    const { setUser } = useUser();
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const validateForm = () => {
        let newErrors = {};
        if (!credentials.email) {
            newErrors.email = "Please enter your email.";
        } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!credentials.password) {
            newErrors.password = "Please enter your password.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const res = await axios.post(
                "http://localhost:5000/auth/signin",
                credentials,
                { withCredentials: true },
            );
            setUser(res.data.data); 
            console.log(res.data)
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            {/* Đã thêm rounded-2xl để bo góc khung lớn */}
            <div className="flex w-full max-w-[1100px] h-[700px] bg-white shadow-2xl overflow-hidden rounded-2xl">
                {/* Cột trái: Brand Identity */}
                <div className="hidden md:flex md:w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000"
                        alt="Garage"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1e5aa0]/80 flex flex-col justify-center px-12 text-white">
                        <h2 className="text-3xl font-bold uppercase tracking-wider mb-4">
                            AutoRepair Portal
                        </h2>
                        <div className="w-16 h-[3px] bg-white mb-6 rounded-full"></div>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Log in to experience 5-star car care service.
                        </p>
                    </div>
                </div>

                {/* Cột phải: Form */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-12 bg-white">
                    <div className="w-full max-w-md">
                        <h1 className="text-2xl font-bold text-center text-gray-800 uppercase mb-2">
                            Sign In To Car-Service
                        </h1>
                        <p className="text-center text-gray-500 text-sm mb-8">
                            Welcome back! Please sign in to continue
                        </p>

                        <div className="relative flex items-center mb-6">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-sm">
                                or
                            </span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                            noValidate
                        >
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Email Address
                                </label>
                                {/* Thêm rounded-lg vào input */}
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className={`w-full px-4 py-3 rounded-lg border outline-none transition text-sm ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#1e5aa0]"}`}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1 pl-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    {/* Thêm rounded-lg vào input */}
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        placeholder="Enter your password"
                                        className={`w-full px-4 py-3 pr-10 rounded-lg border outline-none transition text-sm ${errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#1e5aa0]"}`}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1 pl-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Thêm rounded-lg vào button */}
                            <button
                                type="submit"
                                className="w-full bg-[#1e5aa0] text-white py-3 mt-4 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#164a85] transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                                Continue <span className="text-lg">›</span>
                            </button>
                        </form>

                        <p className="mt-10 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a
                                href="/signup"
                                className="text-[#1e5aa0] font-bold hover:underline"
                            >
                                Sign up
                            </a>
                            <br />
                            Forgot password?{' '}
                            <a
                                href="/forgot-password"
                                className="text-[#1e5aa0] font-bold hover:underline"
                            >
                                Reset here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
