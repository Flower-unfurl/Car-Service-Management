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
            messageApi.error("Unable to load service data.");
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
            messageApi.success("Service deleted successfully.");
            loadData();
        } catch (error) {
            messageApi.error(error?.response?.data?.message || "Unable to delete service.");
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
                messageApi.success("Service updated successfully.");
            } else {
                await axios.post(`${API_BASE}/service`, formData);
                messageApi.success("Service created successfully.");
            }

            setModalOpen(false);
            setExistingImages([]);
            setNewImageFiles([]);
            loadData();
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            messageApi.error(error?.response?.data?.message || "Unable to save service.");
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
            title: "Service",
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
            title: "Price",
            dataIndex: "price",
            key: "price",
            width: 120,
            render: (value) => `$${Number(value || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
        },
        {
            title: "Images",
            dataIndex: "imageUrl",
            key: "imageUrl",
            width: 130,
            render: (value) => {
                const list = Array.isArray(value) ? value.filter(Boolean) : [];
                if (!list.length) {
                    return <Text type="secondary">No images</Text>;
                }

                return (
                    <Space direction="vertical" size={4}>
                        <Image
                            width={70}
                            height={50}
                            style={{ objectFit: "cover", borderRadius: 8 }}
                            src={toAbsoluteImageUrl(list[0])}
                        />
                        <Text type="secondary">{list.length} image(s)</Text>
                    </Space>
                );
            },
        },
        {
            title: "Duration",
            dataIndex: "durationMinutes",
            key: "durationMinutes",
            width: 120,
            render: (value) => `${value || 0} min`,
        },
        {
            title: "Material Usage",
            dataIndex: "materialUsages",
            key: "materialUsages",
            render: (_, record) => {
                const list = Array.isArray(record?.materials)
                    ? record.materials
                    : Array.isArray(record?.materialUsages)
                      ? record.materialUsages
                      : [];
                if (!list.length) {
                    return <Text type="secondary">Not configured</Text>;
                }

                return (
                    <Space size={[4, 8]} wrap>
                        {list.map((item, idx) => {
                            const material = item?.materialId;
                            const materialId = material?._id || material;
                            const materialName =
                                material?.materialName || materialMap.get(materialId)?.materialName || "Material";
                            const unit = material?.unit || materialMap.get(materialId)?.unit || "unit";
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
            title: "Actions",
            key: "actions",
            width: 160,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Service"
                        description="Are you sure you want to delete this service?"
                        okText="Delete"
                        cancelText="Cancel"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />}>
                            Delete
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
                            Manage services, details, and material consumption for each service.
                        </Text>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={loadData}>
                                Reload
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                                Add Service
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                    <Card style={{ borderRadius: 14 }}>
                        <Statistic title="Total Services" value={services.length} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card style={{ borderRadius: 14 }}>
                        <Statistic
                            title="Services with Images"
                            value={serviceWithImagesCount}
                            valueStyle={{ color: "#1677ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card style={{ borderRadius: 14 }}>
                        <Statistic title="Material Links" value={totalMaterialLinks} />
                    </Card>
                </Col>
            </Row>

            <Card style={{ borderRadius: 18 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 14 }}>
                    <Col xs={24} md={10}>
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Search by name, description, or feature..."
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
                        emptyText: <Empty description="No services found" />,
                    }}
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <Descriptions size="small" column={1} bordered>
                                <Descriptions.Item label="Service Details">
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
                                <Descriptions.Item label="Images">
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
                                        <Text type="secondary">No images</Text>
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        ),
                    }}
                />
            </Card>

            <Modal
                title={editingService ? "Update Service" : "Add New Service"}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setNewImageFiles([]);
                    setExistingImages([]);
                }}
                onOk={handleSubmit}
                okText={editingService ? "Save Changes" : "Create"}
                cancelText="Cancel"
                width={860}
                confirmLoading={submitting}
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Row gutter={14}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="serviceName"
                                label="Service Name"
                                rules={[{ required: true, message: "Please enter service name" }]}
                            >
                                <Input placeholder="Example: Periodic Maintenance" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="description"
                                label="Short Description"
                                rules={[{ required: true, message: "Please enter description" }]}
                            >
                                <Input placeholder="Brief service description" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={14}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="price"
                                label="Price ($)"
                                rules={[{ required: true, message: "Please enter price" }]}
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="durationMinutes"
                                label="Duration (minutes)"
                                rules={[{ required: true, message: "Please enter duration" }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={14}>
                        <Col xs={24}>
                            <Form.Item name="longDescription" label="Service Details">
                                <Input placeholder="Example: Full brake system inspection and maintenance workflow" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Card
                        size="small"
                        title="Task List (Features)"
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
                                                rules={[{ required: true, message: "Please enter feature content" }]}
                                                style={{ minWidth: 420 }}
                                            >
                                                <Input placeholder={`Task ${index + 1}`} />
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
                                        Add Feature
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Card>

                    <Card
                        size="small"
                        title="Service Images"
                        style={{ borderRadius: 12, marginBottom: 12 }}
                    >
                        <Space direction="vertical" size={12} style={{ width: "100%" }}>
                            <div>
                                <Text strong>Existing Images</Text>
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
                                                            Remove Image
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </Space>
                                    ) : (
                                        <Text type="secondary">No saved images yet.</Text>
                                    )}
                                </div>
                            </div>

                            <Form.Item label="Upload Images from Device" style={{ marginBottom: 0 }}>
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
                                        <Text strong>Add image URLs for auto-download to server/uploads</Text>
                                        {fields.map((field) => (
                                            <Space
                                                key={field.key}
                                                align="baseline"
                                                style={{ display: "flex", marginBottom: 8 }}
                                            >
                                                <Form.Item
                                                    {...field}
                                                    name={field.name}
                                                    rules={[{ type: "url", message: "Invalid URL" }]}
                                                    style={{ minWidth: 420 }}
                                                >
                                                    <Input placeholder="https://example.com/image.jpg" />
                                                </Form.Item>
                                                <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                            </Space>
                                        ))}
                                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => add("")}>
                                            Add Image URL
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Space>
                    </Card>

                    <Card size="small" title="Material Usage per Service" style={{ borderRadius: 12 }}>
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
                                                rules={[{ required: true, message: "Please select a material" }]}
                                                style={{ minWidth: 280 }}
                                            >
                                                <Select
                                                    showSearch
                                                    placeholder="Select material"
                                                    options={materialOptions}
                                                    optionFilterProp="label"
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, "quantity"]}
                                                rules={[{ required: true, message: "Please enter quantity" }]}
                                            >
                                                <InputNumber min={0.01} step={0.01} placeholder="Quantity" />
                                            </Form.Item>
                                            <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                        </Space>
                                    ))}
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>
                                        Add Material Usage
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
