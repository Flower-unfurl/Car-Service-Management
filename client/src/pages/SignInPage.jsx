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
            console.log(res.data);
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
            <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">
                {/* LEFT: IMAGE */}
                <div className="hidden md:block relative">
                    <img
                        src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000"
                        alt="Garage"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1e5aa0]/80 flex flex-col justify-center px-10 text-white">
                        <h2 className="text-3xl font-bold uppercase mb-4">
                            AutoRepair Portal
                        </h2>
                        <div className="w-16 h-[3px] bg-white mb-6 rounded-full"></div>
                        <p className="text-sm text-blue-100 max-w-xs">
                            Log in to experience 5-star car care service.
                        </p>
                    </div>
                </div>

                {/* RIGHT: FORM */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="max-w-md w-full mx-auto">
                        <h1 className="text-2xl font-bold text-center text-gray-800 uppercase mb-2">
                            Sign In
                        </h1>
                        <p className="text-center text-gray-500 text-sm mb-8">
                            Welcome back! Please sign in to continue
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                            noValidate
                        >
                            {/* Email */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase mb-1 block">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition
                                ${errors.email ? "border-red-500" : "border-gray-200 focus:border-[#1e5aa0]"}`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase mb-1 block">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        placeholder="Enter your password"
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 pr-12 rounded-lg border text-sm outline-none transition
                                    ${errors.password ? "border-red-500" : "border-gray-200 focus:border-[#1e5aa0]"}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                className="w-full bg-[#1e5aa0] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#164a85] transition shadow"
                            >
                                Continue ›
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 text-center text-sm text-gray-600">
                            Don't have an account?{" "}
                            <a
                                href="/signup"
                                className="text-[#1e5aa0] font-semibold hover:underline"
                            >
                                Sign up
                            </a>
                            <br />
                            Forgot password?{" "}
                            <a
                                href="/forgot-password"
                                className="text-[#1e5aa0] font-semibold hover:underline"
                            >
                                Reset here
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
