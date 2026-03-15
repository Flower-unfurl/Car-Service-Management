import { Routes, Route } from "react-router-dom"
import Home from "../pages/home"
import Layout from "../components/layouts/Layout"
import ServiceDetail from "../pages/ServiceDetail"


function AppRoute() {
    return (
        <Routes >
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services/:serviceName" element={<ServiceDetail />} />
            </Route >
        </Routes>
    )
}

export default AppRoute