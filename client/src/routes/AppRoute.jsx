import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import Layout from "../components/layouts/Layout";
import AdminLayout from "../components/layouts/AdminLayout";
import ServiceDetail from "../pages/ServiceDetail";
import SignInPage from "../pages/SignInPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import AdminBookingList from "../pages/Admin/AdminBookingList";
import BookingPage from "../pages/BookingPage";
import LookupPage from "../pages/LookupPage";
import StaffVehicleEntry from "../pages/StaffVehicleEntry";
import AdminZoneManagement from "../pages/Admin/AdminZoneManagement";
import AdminDispatchPage from "../pages/Admin/AdminDispatchPage";
import MaterialList from "../pages/Materials/MaterialList";
import SignUpPage from "../pages/SignupPage";
import StaffTaskBoard from "../pages/Staff/StaffTaskBoard";
import InspectionDetailPage from "../pages/InspectionDetailPage";
import AdminServiceManagement from "../pages/Admin/AdminServiceManagement";
import AdminInvoiceManagement from "../pages/Admin/AdminInvoiceManagement";
import GuestTrackingPage from "../pages/GuestTrackingPage";

function AppRoute() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/staff" element={<Navigate to="/staff/tasks" replace />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/lookup" element={<LookupPage />} />
                <Route path="/guest-tracking" element={<GuestTrackingPage />} />
                <Route path="/staff/entry" element={<StaffVehicleEntry />} />
                <Route path="/staff/tasks" element={<StaffTaskBoard />} />
                <Route path="/staff/materials" element={<MaterialList />} />
                <Route path="/staff/lookup" element={<LookupPage />} />
                {/* <Route path="/staff/services" element={<AdminServiceManagement />} /> */}
                <Route path="/staff/invoices" element={<AdminInvoiceManagement />} />
                <Route path="/staff/inspection/:ticketId" element={<InspectionDetailPage />} />
                {/* <Route path="/materials" element={<MaterialList />} /> */}
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dispatch" replace />} />
                <Route path="dispatch" element={<AdminDispatchPage />} />
                <Route path="bookings" element={<AdminBookingList />} />
                <Route path="zones" element={<AdminZoneManagement />} />
                <Route path="materials" element={<MaterialList />} />
                <Route path="lookup" element={<LookupPage />} />
                <Route path="services" element={<AdminServiceManagement />} />
                <Route path="invoices" element={<AdminInvoiceManagement />} />
            </Route>
            <Route>
                <Route path="/signin/*" element={<SignInPage />} />
                <Route path="/signup/*" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
        </Routes>
    );
}

export default AppRoute;