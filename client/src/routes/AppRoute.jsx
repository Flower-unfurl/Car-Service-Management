import { Routes, Route } from "react-router-dom"
import Home from "../pages/home"
import Layout from "../components/layouts/Layout"
import ServiceDetail from "../pages/ServiceDetail"
import SignInPage from "../pages/SignInPage"
import SignUpPage from "../pages/SignupPage"
import AdminBookingList from '../pages/AdminBookingList';
import BookingPage from '../pages/BookingPage';
import LookupPage from '../pages/LookupPage';
import StaffVehicleEntry from "../pages/StaffVehicleEntry"
import AdminZoneManagement from "../pages/AdminZoneManagement"
import MaterialList from "../pages/Materials/MaterialList"




function AppRoute() {
    return (
        <Routes >
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services/:serviceName" element={<ServiceDetail />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/lookup" element={<LookupPage />} />
                <Route path="/admin/bookings" element={<AdminBookingList />} />
                <Route path="/staff/entry" element={<StaffVehicleEntry />} />
                <Route path="/admin/zones" element={<AdminZoneManagement />} />
                <Route path="/materials" element={<MaterialList />} />
            </Route >
            <Route>
                <Route path="/signin/*" element={<SignInPage />} />
                <Route path="signup/*" element={<SignUpPage />} />
            </Route>
        </Routes>
    )
}

export default AppRoute