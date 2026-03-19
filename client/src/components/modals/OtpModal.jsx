import React, { useState, useRef, useEffect } from 'react';

export default function OtpModal({ length = 6, onVerify, onCancel, email }) {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef([]);

    // Tự động focus ô đầu tiên khi mở modal
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element, index) => {
        const value = element.value.replace(/[^0-9]/g, ""); // Chỉ cho phép nhập số
        if (!value) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // Lấy số cuối cùng nếu nhập đè
        setOtp(newOtp);

        // Tự động chuyển sang ô tiếp theo
        if (index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Xử lý nút Backspace để quay lại ô trước
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            }
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
        }
    };

    const handlePaste = (e) => {
        const data = e.clipboardData.getData("text").trim();
        if (!/^\d+$/.test(data)) return; // Chỉ nhận nếu là chuỗi số

        const pasteData = data.split("").slice(0, length);
        const newOtp = [...otp];
        
        pasteData.forEach((char, index) => {
            newOtp[index] = char;
        });
        setOtp(newOtp);

        // Focus vào ô cuối cùng sau khi dán
        const lastIndex = Math.min(pasteData.length, length - 1);
        inputRefs.current[lastIndex].focus();
    };

    const handleSubmit = () => {
        onVerify(otp.join(""));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                <h2 className="text-xl font-bold mb-2">Xác thực OTP</h2>
                <p className="text-gray-500 text-sm mb-6">Mã đã được gửi đến <br/> <b>{email}</b></p>
                
                <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            ref={(el) => (inputRefs.current[index] = el)}
                            value={data}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-14 border-2 rounded-lg text-center text-xl font-bold focus:border-[#1e5aa0] focus:ring-1 focus:ring-[#1e5aa0] outline-none transition-all"
                        />
                    ))}
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={handleSubmit}
                        className="w-full py-3 bg-[#1e5aa0] text-white rounded-lg font-bold hover:bg-[#164a85] transition"
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