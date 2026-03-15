import { Routes, Route } from "react-router-dom"
import Home from "../pages/home"
import Layout from "../components/layouts/Layout"


function AppRoute() {
    return (
        <Routes >
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
            </Route >
        </Routes>
    )
}

export default AppRoute