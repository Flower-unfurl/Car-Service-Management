import { Routes, Route } from "react-router-dom"
import Home from "../pages/home"
import Layout from "../components/layouts/Layout"
import ServiceDetail from "../pages/ServiceDetail"
import SignInPage from "../pages/SignInPage"
import SignUpPage from "../pages/SignupPage"
import StaffVehicleEntry from "../pages/StaffVehicleEntry"
import AdminZoneManagement from "../pages/AdminZoneManagement"


function AppRoute() {
    return (
        <Routes >
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services/:serviceName" element={<ServiceDetail />} />
                <Route path="/staff/entry" element={<StaffVehicleEntry />} />
                <Route path="/admin/zones" element={<AdminZoneManagement />} />
            </Route >
            <Route>
                <Route path="/signin/*" element={<SignInPage />} />
                <Route path="signup/*" element={<SignUpPage />} />
            </Route>
        </Routes>
    )
}

export default AppRoute