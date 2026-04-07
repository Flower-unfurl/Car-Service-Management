import { useMemo, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    Layout,
    Menu,
    Typography,
    Dropdown,
    Button,
    Space,
    Avatar,
    Grid,
    Breadcrumb,
    Drawer,
    Spin,
} from "antd";
import {
    AppstoreOutlined,
    BarsOutlined,
    CarOutlined,
    DashboardOutlined,
    DeploymentUnitOutlined,
    FileTextOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    SearchOutlined,
    SettingOutlined,
    ToolOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useUser } from "../../hooks/UseUser";
import "./AdminLayout.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const adminManagementItems = [
    { key: "/admin/dispatch", icon: <DashboardOutlined />, label: "Dispatch" },
    { key: "/admin/bookings", icon: <CarOutlined />, label: "Bookings" },
    { key: "/admin/zones", icon: <DeploymentUnitOutlined />, label: "Zones" },
    { key: "/admin/materials", icon: <ToolOutlined />, label: "Materials" },
];

const lookupItems = [{ key: "/admin/lookup", icon: <SearchOutlined />, label: "Tra cứu" }];
const serviceItems = [
    {
        key: "/admin/services",
        icon: <AppstoreOutlined />,
        label: "Quản lý dịch vụ",
    },
    {
        key: "/admin/invoices",
        icon: <FileTextOutlined />,
        label: "Hóa đơn",
    },
];

const menuItems = [
    { type: "group", label: "Quản trị", children: adminManagementItems },
    { type: "group", label: "Tra cứu", children: lookupItems },
    { type: "group", label: "Service", children: serviceItems },
];

const allMenuItems = [...adminManagementItems, ...lookupItems, ...serviceItems];

const titleMap = {
    "/admin/dispatch": "Dispatch",
    "/admin/bookings": "Bookings",
    "/admin/zones": "Zones",
    "/admin/materials": "Material",
    "/admin/lookup": "Tra cứu",
    "/admin/services": "Quản lý dịch vụ",
    "/admin/invoices": "Hóa đơn",
};

export default function AdminLayout() {
    const { user, loading, logout } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isMobile = !screens.lg;

    const selectedKey = useMemo(() => {
        const matched = allMenuItems
            .map((item) => item.key)
            .find((key) => location.pathname.startsWith(key));
        return matched || "/admin/dispatch";
    }, [location.pathname]);

    const pageTitle = titleMap[selectedKey] || "Admin";

    const navigationMenu = (
        <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => {
                setMobileOpen(false);
                navigate(key);
            }}
            className="admin-menu"
        />
    );

    if (loading) {
        return (
            <div className="admin-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!loading && user?.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    const userMenuItems = [
        {
            key: "back-home",
            label: <Link to="/">Ve trang chu</Link>,
            icon: <SettingOutlined />,
        },
        {
            key: "logout",
            label: "Dang xuat",
            icon: <LogoutOutlined />,
            danger: true,
        },
    ];

    const handleUserMenuClick = async ({ key }) => {
        if (key === "logout") {
            await logout();
            navigate("/signin");
        }
    };

    return (
        <Layout className="admin-shell">
            {!isMobile && (
                <Sider
                    width={280}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    className="admin-sider"
                    trigger={null}
                >
                    <div className="admin-brand">
                        <div className="admin-brand-icon">
                            <BarsOutlined />
                        </div>
                        {!collapsed && (
                            <div>
                                <Title level={4} className="admin-brand-title">
                                    Admin Console
                                </Title>
                                <Text className="admin-brand-subtitle">Car Service Management</Text>
                            </div>
                        )}
                    </div>
                    {navigationMenu}
                </Sider>
            )}

            <Layout>
                <Header className="admin-header">
                    <Space size={12}>
                        {isMobile ? (
                            <Button
                                icon={<MenuUnfoldOutlined />}
                                onClick={() => setMobileOpen(true)}
                                className="admin-ghost-btn"
                            />
                        ) : (
                            <Button
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed((prev) => !prev)}
                                className="admin-ghost-btn"
                            />
                        )}

                        <div>
                            <Text className="admin-header-title">{pageTitle}</Text>
                            <Breadcrumb
                                items={[
                                    { title: <HomeOutlined /> },
                                    { title: "Admin" },
                                    { title: pageTitle },
                                ]}
                            />
                        </div>
                    </Space>

                    <Dropdown
                        menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                        placement="bottomRight"
                        trigger={["click"]}
                    >
                        <Button className="admin-user-btn" type="text">
                            <Space>
                                <Avatar size="small" icon={<UserOutlined />} />
                                <span>{user?.name || "Admin"}</span>
                            </Space>
                        </Button>
                    </Dropdown>
                </Header>

                <Content className="admin-content">
                    <div className="admin-content-inner">
                        <Outlet />
                    </div>
                </Content>
            </Layout>

            <Drawer
                title="Admin Menu"
                placement="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                bodyStyle={{ padding: 0 }}
            >
                {navigationMenu}
            </Drawer>
        </Layout>
    );
}
