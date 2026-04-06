import { Routes, Route } from "react-router-dom"
import Home from "../pages/home"
import Layout from "../components/layouts/Layout"
import ServiceDetail from "../pages/ServiceDetail"
import SignInPage from "../pages/SignInPage"
import SignUpPage from "../pages/SignupPage"
import OperationsListPage from "../pages/OperationsListPage"
import OperationsPage from "../pages/OperationsPage"


function AppRoute() {
    return (
        <Routes >
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services/:serviceName" element={<ServiceDetail />} />
                <Route path="/operations" element={<OperationsListPage />} />
                <Route path="/operations/:bookingId" element={<OperationsPage />} />
            </Route >
            <Route>
                <Route path="/signin/*" element={<SignInPage />} />
                <Route path="signup/*" element={<SignUpPage />} />
            </Route>
        </Routes>
    )
}

export default AppRoute