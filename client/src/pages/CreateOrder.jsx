import { useEffect, useState } from "react"
import axios from "axios"
import { Phone, Car, ClipboardList, CheckCircle2, ChevronRight, Clock, DollarSign, Loader2, Sparkles, User, ReceiptText } from "lucide-react"

export default function CreateOrder() {
  const [phone, setPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [plate, setPlate] = useState("")
  const [brand, setBrand] = useState("")
  const [carBrands, setCarBrands] = useState([])
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isBrandOpen, setIsBrandOpen] = useState(false)

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/service")
        console.log(res.data)
        setServices(res.data)
      } catch (err) {
        console.error("Fetch services error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Fetch brands from backend
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("http://localhost:5000/brand")
        setCarBrands(res.data.map(b => b.name))
      } catch (err) {
        console.error("Fetch brands error:", err)
      }
    }
    fetchBrands()
  }, [])

  // Toggle service selection
  const handleSelectService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  // Calculate total price
  const totalPrice = selectedServices.reduce((sum, id) => {
    const service = services.find(s => s._id === id)
    return sum + (service?.price || 0)
  }, 0)

  // Create order
  const handleCreateOrder = async () => {
    if (!phone || !customerName || !plate || !brand || selectedServices.length === 0) {
      alert("Please fill in all information and select at least one service")
      return
    }

    setSubmitting(true)
    try {
      const res = await axios.post("http://localhost:5000/order", {
        customerPhone: phone,
        customerName: customerName,
        licensePlate: plate,
        brand: brand,
        services: selectedServices
      })

      alert("🎉 Order created successfully!")
      // Reset form
      setPhone("")
      setCustomerName("")
      setPlate("")
      setBrand("")
      setSelectedServices([])
      console.log(res.data)
    } catch (err) {
      console.error("Create order error:", err)
      alert(" Error creating order. Please check again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e5aa0]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 pb-32 px-4 sm:px-6 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full max-w-6xl">
        {/* Main Boxed Container */}
        <div className="bg-white rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col lg:flex-row border border-white/50">

          {/* Left Side: Form & Services (Scrollable if needed) */}
          <div className="lg:w-[65%] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-[#1e5aa0]/10 flex items-center justify-center text-[#1e5aa0] shadow-inner">
                <Sparkles size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Order</h1>
                <p className="text-gray-400 text-sm font-medium">AutoRepair Professional Service Management</p>
              </div>
            </div>

            <div className="space-y-12">
              {/* Customer Info Section */}
              <section>
                <div className="flex items-center gap-2 mb-6 text-[#1e5aa0]">
                  <User size={18} className="font-bold" />
                  <h2 className="text-xs font-black uppercase tracking-widest">Customer Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-[#1e5aa0] transition-colors" />
                      <input
                        type="tel"
                        placeholder="0123 456 789"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#1e5aa0]/5 focus:border-[#1e5aa0] outline-none transition-all font-medium"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Customer Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-[#1e5aa0] transition-colors" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#1e5aa0]/5 focus:border-[#1e5aa0] outline-none transition-all font-medium"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">License Plate</label>
                    <div className="relative group">
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-[#1e5aa0] transition-colors" />
                      <input
                        type="text"
                        placeholder="30A-123.45"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#1e5aa0]/5 focus:border-[#1e5aa0] outline-none transition-all uppercase font-bold tracking-wider"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Car Brand</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsBrandOpen(!isBrandOpen)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#1e5aa0]/5 focus:border-[#1e5aa0] outline-none transition-all font-medium flex items-center justify-between text-left"
                      >
                        <Sparkles className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${brand ? 'text-[#1e5aa0]' : 'text-gray-300'}`} />
                        <span className={brand ? 'text-gray-900' : 'text-gray-400'}>
                          {brand || "Select Brand"}
                        </span>
                        <ChevronRight className={`text-gray-300 w-4 h-4 transition-transform duration-300 ${isBrandOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {isBrandOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsBrandOpen(false)}
                          ></div>
                          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            {carBrands.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-400 italic">Loading brands...</div>
                            ) : (
                              carBrands.map(b => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => {
                                    setBrand(b);
                                    setIsBrandOpen(false);
                                  }}
                                  className={`w-full px-6 py-3 text-left text-sm font-medium transition-colors hover:bg-[#1e5aa0]/5 ${brand === b ? 'text-[#1e5aa0] bg-[#1e5aa0]/5' : 'text-gray-700'}`}
                                >
                                  {b}
                                </button>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Services Section */}
              <section>
                <div className="flex items-center gap-2 mb-6 text-[#1e5aa0]">
                  <ClipboardList size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest">Select Services</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => handleSelectService(s._id)}
                      className={`relative text-left p-5 rounded-2xl transition-all duration-300 group border-2 ${selectedServices.includes(s._id)
                        ? 'bg-[#1e5aa0] border-[#1e5aa0] shadow-xl shadow-[#1e5aa0]/20 -translate-y-1'
                        : 'bg-gray-50/50 border-transparent hover:border-gray-200'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className={`font-bold tracking-tight transition-colors ${selectedServices.includes(s._id) ? 'text-white' : 'text-gray-900 group-hover:text-[#1e5aa0]'}`}>
                          {s.serviceName}
                        </h3>
                        {selectedServices.includes(s._id) && (
                          <div className="bg-white/20 p-1 rounded-full text-white">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                      </div>

                      <p className={`text-xs mb-4 line-clamp-2 transition-colors ${selectedServices.includes(s._id) ? 'text-blue-100' : 'text-gray-500'}`}>
                        {s.description || 'Dịch vụ bảo dưỡng chuyên nghiệp theo tiêu chuẩn hãng.'}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold ${selectedServices.includes(s._id) ? 'text-blue-200' : 'text-gray-400'}`}>
                          <Clock size={12} /> {s.durationMinutes || 30} MIN
                        </div>
                        <div className={`text-sm font-black ${selectedServices.includes(s._id) ? 'text-white' : 'text-[#1e5aa0]'}`}>
                          ${s.price}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right Side: Summary (Floating effect) */}
          <div className="lg:w-[35%] bg-gray-50/50 p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <ReceiptText className="text-[#1e5aa0]" size={24} />
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Order Details</h2>
              </div>

              {selectedServices.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">No services selected</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedServices.map(id => {
                    const s = services.find(srv => srv._id === id)
                    return (
                      <div key={id} className="group flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-50 hover:border-[#1e5aa0]/20 transition-all">
                        <div className="flex-1">
                          <span className="block text-xs font-bold text-gray-800 line-clamp-1">{s?.serviceName}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{s?.durationMinutes} min</span>
                        </div>
                        <span className="text-sm font-black text-[#1e5aa0] ml-4">${s?.price}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mt-10 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-black text-[#1e5aa0]">${totalPrice}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic">Tax and service fees included</p>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={submitting}
                className={`w-full py-5 rounded-2xl text-white font-black uppercase text-sm tracking-[0.1em] flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl active:scale-[0.98] hover:scale-[1.02] hover:brightness-110 ${submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-[#1e5aa0] to-[#1e4b82] shadow-[#1e5aa0]/30 hover:shadow-[#1e4b82]/40'
                  }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    Confirm Order
                    <ChevronRight size={20} className="bg-white/20 rounded-full p-0.5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 py-2">
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure Checkout System</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}