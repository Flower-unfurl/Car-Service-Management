import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Form,
    Image,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
    Upload,
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    UploadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const API_BASE = "http://localhost:5000";
const DEFAULT_PAGE_SIZE = 30;
const MAX_IMAGE_FILES = 10;

const toAbsoluteImageUrl = (value) => {
    if (!value || typeof value !== "string") return "";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${API_BASE}${value.startsWith("/") ? value : `/${value}`}`;
};

const getFirstLongDescription = (value) => {
    if (Array.isArray(value)) {
        return value.find((item) => typeof item === "string" && item.trim()) || "";
    }

    if (typeof value === "string") {
        return value;
    }

    return "";
};

const normalizeServicePayload = (values) => {
    const normalizedMaterials = (values.materialUsages || [])
        .filter((item) => item?.materialId && item?.quantity)
        .map((item) => ({
            materialId: item.materialId,
            quantity: Number(item.quantity),
        }));

    const normalizedFeatures = (values.features || [])
        .map((feature) => (typeof feature === "string" ? feature.trim() : ""))
        .filter(Boolean);

    const normalizedImageUrls = (values.imageUrls || [])
        .map((url) => (typeof url === "string" ? url.trim() : ""))
        .filter(Boolean);

    return {
        serviceName: values.serviceName?.trim(),
        description: values.description?.trim(),
        price: Number(values.price || 0),
        durationMinutes: Number(values.durationMinutes || 0),
        longDescription: values.longDescription?.trim() ? [values.longDescription.trim()] : [],
        features: normalizedFeatures,
        imageUrls: normalizedImageUrls,
        materialUsages: normalizedMaterials,
    };
};

async function fetchAllServices() {
    const all = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        const response = await axios.get(`${API_BASE}/service`, {
            params: { page, limit: DEFAULT_PAGE_SIZE },
        });

        const pageItems = Array.isArray(response.data?.data) ? response.data.data : [];
        all.push(...pageItems);

        hasMore = Boolean(response.data?.hasMore) && pageItems.length > 0;
        page += 1;

        if (page > 100) {
            break;
        }
    }

    return all;
}

export default function AdminServiceManagement() {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [services, setServices] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [editingService, setEditingService] = useState(null);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const materialMap = useMemo(() => {
        const map = new Map();
        materials.forEach((material) => {
            map.set(material._id, material);
        });
        return map;
    }, [materials]);

    const materialOptions = useMemo(
        () =>
            materials.map((material) => ({
                value: material._id,
                label: `${material.materialName} (${material.unit})`,
            })),
        [materials],
    );

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [allServices, materialResponse] = await Promise.all([
                fetchAllServices(),
                axios.get(`${API_BASE}/materials`),
            ]);

            setServices(allServices);
            setMaterials(Array.isArray(materialResponse.data) ? materialResponse.data : []);
        } catch {
            messageApi.error("Không thể tải dữ liệu dịch vụ.");
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openCreateModal = () => {
        setEditingService(null);
        form.resetFields();
        form.setFieldsValue({
            longDescription: "",
            features: [""],
            imageUrls: [],
            materialUsages: [],
        });
        setExistingImages([]);
        setNewImageFiles([]);
        setModalOpen(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);

        const serviceImages = Array.isArray(service.imageUrl) ? service.imageUrl.filter(Boolean) : [];
        const serviceFeatures =
            Array.isArray(service.features) && service.features.length > 0 ? service.features : [""];

        setExistingImages(serviceImages);
        setNewImageFiles([]);

        form.setFieldsValue({
            serviceName: service.serviceName,
            description: service.description,
            price: service.price,
            durationMinutes: service.durationMinutes,
            longDescription: getFirstLongDescription(service.longDescription),
            features: serviceFeatures,
            imageUrls: [],
            materialUsages: (service.materials || service.materialUsages || []).map((item) => ({
                materialId: item?.materialId?._id || item?.materialId,
                quantity: item?.quantity,
            })),
        });

        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE}/service/${id}`);
            messageApi.success("Xóa dịch vụ thành công.");
            loadData();
        } catch (error) {
            messageApi.error(error?.response?.data?.message || "Không thể xóa dịch vụ.");
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = normalizeServicePayload(values);

            const formData = new FormData();
            formData.append("serviceName", payload.serviceName || "");
            formData.append("description", payload.description || "");
            formData.append("price", String(payload.price || 0));
            formData.append("durationMinutes", String(payload.durationMinutes || 0));
            formData.append("longDescription", JSON.stringify(payload.longDescription));
            formData.append("features", JSON.stringify(payload.features));
            formData.append("materialUsages", JSON.stringify(payload.materialUsages));
            formData.append("existingImages", JSON.stringify(existingImages));
            formData.append("imageUrls", JSON.stringify(payload.imageUrls));

            newImageFiles.forEach((file) => {
                if (file.originFileObj) {
                    formData.append("images", file.originFileObj);
                }
            });

            setSubmitting(true);
            if (editingService?._id) {
                await axios.put(`${API_BASE}/service/${editingService._id}`, formData);
                messageApi.success("Cập nhật dịch vụ thành công.");
            } else {
                await axios.post(`${API_BASE}/service`, formData);
                messageApi.success("Tạo dịch vụ thành công.");
            }

            setModalOpen(false);
            setExistingImages([]);
            setNewImageFiles([]);
            loadData();
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            messageApi.error(error?.response?.data?.message || "Không thể lưu dịch vụ.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredServices = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) return services;

        return services.filter((item) => {
            const source = [item.serviceName, item.description, ...(item.features || [])]
                .join(" ")
                .toLowerCase();

            return source.includes(keyword);
        });
    }, [searchText, services]);

    const serviceWithImagesCount = useMemo(
        () => services.filter((service) => Array.isArray(service.imageUrl) && service.imageUrl.length > 0).length,
        [services],
    );

    const totalMaterialLinks = useMemo(
        () =>
            services.reduce((sum, service) => {
                const materialList = service.materials || service.materialUsages || [];
                return sum + materialList.length;
            }, 0),
        [services],
    );

    const columns = [
        {
            title: "Dịch vụ",
            dataIndex: "serviceName",
            key: "serviceName",
            render: (_, record) => (
                <div>
                    <Text strong>{record.serviceName}</Text>
                    <div>
                        <Text type="secondary">{record.description}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            width: 120,
            render: (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`,
        },
        {
            title: "Hình ảnh",
            dataIndex: "imageUrl",
            key: "imageUrl",
            width: 130,
            render: (value) => {
                const list = Array.isArray(value) ? value.filter(Boolean) : [];
                if (!list.length) {
                    return <Text type="secondary">Chưa có ảnh</Text>;
                }

                return (
                    <Space direction="vertical" size={4}>
                        <Image
                            width={70}
                            height={50}
                            style={{ objectFit: "cover", borderRadius: 8 }}
                            src={toAbsoluteImageUrl(list[0])}
                        />
                        <Text type="secondary">{list.length} ảnh</Text>
                    </Space>
                );
            },
        },
        {
            title: "Thời lượng",
            dataIndex: "durationMinutes",
            key: "durationMinutes",
            width: 120,
            render: (value) => `${value || 0} phút`,
        },
        {
            title: "Material tiêu tốn",
            dataIndex: "materialUsages",
            key: "materialUsages",
            render: (_, record) => {
                const list = Array.isArray(record?.materials)
                    ? record.materials
                    : Array.isArray(record?.materialUsages)
                      ? record.materialUsages
                      : [];
                if (!list.length) {
                    return <Text type="secondary">Chưa cấu hình</Text>;
                }

                return (
                    <Space size={[4, 8]} wrap>
                        {list.map((item, idx) => {
                            const material = item?.materialId;
                            const materialId = material?._id || material;
                            const materialName =
                                material?.materialName || materialMap.get(materialId)?.materialName || "Material";
                            const unit = material?.unit || materialMap.get(materialId)?.unit || "đv";
                            return (
                                <Tag key={`${materialId}-${idx}`} color="purple">
                                    {materialName}: {item.quantity} {unit}
                                </Tag>
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 160,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa dịch vụ"
                        description="Bạn có chắc chắn muốn xóa dịch vụ này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            {contextHolder}

            <Card styles={{ body: { paddingBottom: 12 } }} style={{ borderRadius: 18, marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                        <Title level={3} style={{ marginBottom: 0 }}>
                            Service Management
                        </Title>
                        <Text type="secondary">
                            Quản lý dịch vụ, chi tiết và định mức material tiêu tốn cho từng dịch vụ.
                        </Text>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={loadData}>
                                Tải lại
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                                Thêm dịch vụ
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                    <Card style={{ borderRadius: 14 }}>
                        <Statistic title="Tổng dịch vụ" value={services.length} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card style={{ borderRadius: 14 }}>
                        <Statistic
                            title="Dịch vụ có hình ảnh"
                            value={serviceWithImagesCount}
                            valueStyle={{ color: "#1677ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card style={{ borderRadius: 14 }}>
                        <Statistic title="Liên kết material" value={totalMaterialLinks} />
                    </Card>
                </Col>
            </Row>

            <Card style={{ borderRadius: 18 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 14 }}>
                    <Col xs={24} md={10}>
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Tìm dịch vụ theo tên, mô tả, feature..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                </Row>

                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={filteredServices}
                    loading={loading}
                    scroll={{ x: 980 }}
                    locale={{
                        emptyText: <Empty description="Chưa có dịch vụ" />,
                    }}
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <Descriptions size="small" column={1} bordered>
                                <Descriptions.Item label="Chi tiết dịch vụ">
                                    {getFirstLongDescription(record.longDescription) || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Features">
                                    {Array.isArray(record.features) && record.features.length > 0 ? (
                                        <Space size={[4, 8]} wrap>
                                            {record.features.map((feature, idx) => (
                                                <Tag key={`${feature}-${idx}`}>{feature}</Tag>
                                            ))}
                                        </Space>
                                    ) : (
                                        "-"
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Hình ảnh">
                                    {Array.isArray(record.imageUrl) && record.imageUrl.length > 0 ? (
                                        <Image.PreviewGroup>
                                            <Space size={[8, 8]} wrap>
                                                {record.imageUrl.map((imagePath, idx) => (
                                                    <Image
                                                        key={`${imagePath}-${idx}`}
                                                        width={120}
                                                        height={84}
                                                        style={{ objectFit: "cover", borderRadius: 8 }}
                                                        src={toAbsoluteImageUrl(imagePath)}
                                                    />
                                                ))}
                                            </Space>
                                        </Image.PreviewGroup>
                                    ) : (
                                        <Text type="secondary">Chưa có ảnh</Text>
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        ),
                    }}
                />
            </Card>

            <Modal
                title={editingService ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setNewImageFiles([]);
                    setExistingImages([]);
                }}
                onOk={handleSubmit}
                okText={editingService ? "Lưu thay đổi" : "Tạo mới"}
                cancelText="Hủy"
                width={860}
                confirmLoading={submitting}
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Row gutter={14}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="serviceName"
                                label="Tên dịch vụ"
                                rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
                            >
                                <Input placeholder="Ví dụ: Bảo dưỡng định kỳ" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="description"
                                label="Mô tả ngắn"
                                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                            >
                                <Input placeholder="Mô tả ngắn gọn dịch vụ" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={14}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="price"
                                label="Giá (đ)"
                                rules={[{ required: true, message: "Nhập giá" }]}
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="durationMinutes"
                                label="Thời lượng (phút)"
                                rules={[{ required: true, message: "Nhập thời lượng" }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={14}>
                        <Col xs={24}>
                            <Form.Item name="longDescription" label="Chi tiết dịch vụ">
                                <Input placeholder="Ví dụ: Quy trình kiểm tra và bảo dưỡng tổng thể hệ thống phanh" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Card
                        size="small"
                        title="Danh sách công việc (Features)"
                        style={{ borderRadius: 12, marginBottom: 12 }}
                    >
                        <Form.List name="features">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Space
                                            key={field.key}
                                            align="baseline"
                                            style={{ display: "flex", marginBottom: 8 }}
                                        >
                                            <Form.Item
                                                {...field}
                                                name={field.name}
                                                rules={[{ required: true, message: "Nhập nội dung feature" }]}
                                                style={{ minWidth: 420 }}
                                            >
                                                <Input placeholder={`Công việc ${index + 1}`} />
                                            </Form.Item>
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(field.name)}
                                                disabled={fields.length === 1}
                                            />
                                        </Space>
                                    ))}
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add("")}>
                                        Thêm feature
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>

                    <Card
                        size="small"
                        title="Hình ảnh dịch vụ"
                        style={{ borderRadius: 12, marginBottom: 12 }}
                    >
                        <Space direction="vertical" size={12} style={{ width: "100%" }}>
                            <div>
                                <Text strong>Ảnh hiện có</Text>
                                <div style={{ marginTop: 8 }}>
                                    {existingImages.length > 0 ? (
                                        <Space size={[10, 10]} wrap>
                                            {existingImages.map((imagePath, index) => (
                                                <div key={`${imagePath}-${index}`}>
                                                    <Image
                                                        width={110}
                                                        height={74}
                                                        style={{ objectFit: "cover", borderRadius: 8 }}
                                                        src={toAbsoluteImageUrl(imagePath)}
                                                    />
                                                    <div style={{ marginTop: 6 }}>
                                                        <Button
                                                            size="small"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => {
                                                                setExistingImages((prev) =>
                                                                    prev.filter((_, itemIndex) => itemIndex !== index),
                                                                );
                                                            }}
                                                        >
                                                            Xóa ảnh
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </Space>
                                    ) : (
                                        <Text type="secondary">Chưa có ảnh nào được lưu.</Text>
                                    )}
                                </div>
                            </div>

                            <Form.Item label="Tải ảnh từ máy" style={{ marginBottom: 0 }}>
                                <Upload
                                    accept="image/*"
                                    listType="picture-card"
                                    multiple
                                    beforeUpload={() => false}
                                    fileList={newImageFiles}
                                    onChange={({ fileList }) => {
                                        setNewImageFiles(fileList.slice(0, MAX_IMAGE_FILES));
                                    }}
                                >
                                    {newImageFiles.length >= MAX_IMAGE_FILES ? null : (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>

                            <Form.List name="imageUrls">
                                {(fields, { add, remove }) => (
                                    <>
                                        <Text strong>Gắn URL ảnh để hệ thống tự tải về server/uploads</Text>
                                        {fields.map((field) => (
                                            <Space
                                                key={field.key}
                                                align="baseline"
                                                style={{ display: "flex", marginBottom: 8 }}
                                            >
                                                <Form.Item
                                                    {...field}
                                                    name={field.name}
                                                    rules={[{ type: "url", message: "URL không hợp lệ" }]}
                                                    style={{ minWidth: 420 }}
                                                >
                                                    <Input placeholder="https://example.com/image.jpg" />
                                                </Form.Item>
                                                <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                            </Space>
                                        ))}
                                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => add("")}>
                                            Thêm URL ảnh
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Space>
                    </Card>

                    <Card size="small" title="Material tiêu tốn theo dịch vụ" style={{ borderRadius: 12 }}>
                        <Form.List name="materialUsages">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field) => (
                                        <Space
                                            key={field.key}
                                            align="baseline"
                                            style={{ display: "flex", marginBottom: 8 }}
                                        >
                                            <Form.Item
                                                {...field}
                                                name={[field.name, "materialId"]}
                                                rules={[{ required: true, message: "Chọn material" }]}
                                                style={{ minWidth: 280 }}
                                            >
                                                <Select
                                                    showSearch
                                                    placeholder="Chọn material"
                                                    options={materialOptions}
                                                    optionFilterProp="label"
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, "quantity"]}
                                                rules={[{ required: true, message: "Nhập số lượng" }]}
                                            >
                                                <InputNumber min={0.01} step={0.01} placeholder="Số lượng" />
                                            </Form.Item>
                                            <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                        </Space>
                                    ))}
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>
                                        Thêm material tiêu tốn
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>
                </Form>
            </Modal>
        </div>
    );
}
