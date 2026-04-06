import React, { useState, useRef, useEffect } from 'react';

export default function OtpModal({ length = 6, onVerify, onCancel, email }) {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (e, index) => {
        // Lấy chỉ ký tự số cuối cùng được nhập
        const value = e.target.value.replace(/[^0-9]/g, "").slice(-1);

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Chỉ chuyển ô tiếp theo khi thực sự có giá trị
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            e.preventDefault(); // Ngăn browser xử lý mặc định

            if (otp[index]) {
                // Ô đang có giá trị → chỉ xóa ô hiện tại, không lùi
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            } else if (index > 0) {
                // Ô đang trống → lùi về ô trước và xóa ô đó
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
        }

        // Cho phép dùng phím mũi tên di chuyển giữa các ô
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
        if (!data) return;

        const pasteData = data.slice(0, length).split("");
        const newOtp = new Array(length).fill("");

        pasteData.forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus vào ô sau ký tự cuối được dán (hoặc ô cuối)
        const focusIndex = Math.min(pasteData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = () => {
        const otpString = otp.join("");
        if (otpString.length < length) {
            alert(`Vui lòng nhập đủ ${length} chữ số`);
            return;
        }
        onVerify(otpString);
    };

    // Cho phép click vào ô đã có giá trị để sửa
    const handleClick = (index) => {
        inputRefs.current[index]?.select();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                <h2 className="text-xl font-bold mb-2">Xác thực OTP</h2>
                <p className="text-gray-500 text-sm mb-6">
                    Mã đã được gửi đến <br />
                    <b>{email}</b>
                </p>

                <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            inputMode="numeric" // Mở bàn phím số trên mobile
                            maxLength="2"       // Cho phép 2 để React detect onChange khi gõ đè
                            ref={(el) => (inputRefs.current[index] = el)}
                            value={data}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onClick={() => handleClick(index)}
                            className="w-12 h-14 border-2 rounded-lg text-center text-xl font-bold focus:border-[#1e5aa0] focus:ring-1 focus:ring-[#1e5aa0] outline-none transition-all"
                        />
                    ))}
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleSubmit}
                        disabled={otp.some(v => v === "")}
                        className="w-full py-3 bg-[#1e5aa0] text-white rounded-lg font-bold hover:bg-[#164a85] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Xác nhận
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-2 text-gray-400 text-sm hover:underline"
                    >
                        Hủy bỏ
                    </button>
                </div>
            </div>
        </div>
    );
}