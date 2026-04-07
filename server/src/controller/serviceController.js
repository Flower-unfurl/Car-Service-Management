const serviceService = require("../service/serviceService");
const ErrorException = require("../util/errorException");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const serviceUploadDir = path.join(__dirname, "../../uploads/services");

const parseJsonIfNeeded = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return value;
    }

    try {
        return JSON.parse(trimmed);
    } catch {
        return value;
    }
};

const toStringArray = (value) => {
    const parsed = parseJsonIfNeeded(value);

    if (Array.isArray(parsed)) {
        return parsed
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean);
    }

    if (typeof parsed === "string" && parsed.trim()) {
        return [parsed.trim()];
    }

    return [];
};

const toMaterialArray = (value) => {
    const parsed = parseJsonIfNeeded(value);
    const list = Array.isArray(parsed) ? parsed : [];

    return list
        .filter(
            (item) =>
                item?.materialId &&
                item?.quantity !== undefined &&
                item?.quantity !== null,
        )
        .map((item) => ({
            materialId: item.materialId,
            quantity: Number(item.quantity),
        }))
        .filter((item) => item.quantity > 0);
};

const toFiniteNumber = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const uniqueValues = (values) => {
    const seen = new Set();
    const output = [];

    values.forEach((item) => {
        if (!item || seen.has(item)) {
            return;
        }

        seen.add(item);
        output.push(item);
    });

    return output;
};

const getImageExtension = (contentType, imageUrl) => {
    const extensionByMime = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/bmp": ".bmp",
        "image/svg+xml": ".svg",
    };

    if (extensionByMime[contentType]) {
        return extensionByMime[contentType];
    }

    try {
        const candidate = path
            .extname(new URL(imageUrl).pathname || "")
            .toLowerCase();
        if (candidate && candidate.length <= 5) {
            return candidate;
        }
    } catch {
        return ".jpg";
    }

    return ".jpg";
};

const saveImageFromUrl = async (imageUrl) => {
    let parsedUrl;
    try {
        parsedUrl = new URL(imageUrl);
    } catch {
        throw new ErrorException(400, `URL hình ảnh không hợp lệ: ${imageUrl}`);
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new ErrorException(
            400,
            `URL hình ảnh phải bắt đầu bằng http/https: ${imageUrl}`,
        );
    }

    try {
        await fs.promises.mkdir(serviceUploadDir, { recursive: true });

        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            maxRedirects: 5,
        });

        const contentType = response?.headers?.["content-type"] || "";
        if (!contentType.startsWith("image/")) {
            throw new ErrorException(
                400,
                `URL không trỏ tới tệp hình ảnh: ${imageUrl}`,
            );
        }

        const extension = getImageExtension(contentType, imageUrl);
        const filename = `service-url-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        const filePath = path.join(serviceUploadDir, filename);

        await fs.promises.writeFile(filePath, Buffer.from(response.data));

        return `/uploads/services/${filename}`;
    } catch (error) {
        if (error instanceof ErrorException) {
            throw error;
        }

        throw new ErrorException(400, `Không thể tải ảnh từ URL: ${imageUrl}`);
    }
};

const buildServicePayload = async (
    req,
    fallbackImages = [],
    { isCreate = false } = {},
) => {
    const body = req.body || {};
    const payload = {};

    const serviceName =
        typeof body.serviceName === "string"
            ? body.serviceName.trim()
            : undefined;
    const description =
        typeof body.description === "string"
            ? body.description.trim()
            : undefined;
    const price = toFiniteNumber(body.price);
    const durationMinutes = toFiniteNumber(body.durationMinutes);
    const vehicleType =
        typeof body.vehicleType === "string"
            ? body.vehicleType.trim()
            : undefined;
    const status =
        typeof body.status === "string" ? body.status.trim() : undefined;

    if (serviceName !== undefined) payload.serviceName = serviceName;
    if (description !== undefined) payload.description = description;
    if (price !== undefined) payload.price = price;
    if (durationMinutes !== undefined)
        payload.durationMinutes = durationMinutes;
    if (vehicleType) payload.vehicleType = vehicleType;
    if (status) payload.status = status;

    const hasLongDescription = Object.prototype.hasOwnProperty.call(
        body,
        "longDescription",
    );
    const hasFeatures = Object.prototype.hasOwnProperty.call(body, "features");
    const hasMaterials =
        Object.prototype.hasOwnProperty.call(body, "materialUsages") ||
        Object.prototype.hasOwnProperty.call(body, "materials");
    const hasImageInputs =
        Object.prototype.hasOwnProperty.call(body, "existingImages") ||
        Object.prototype.hasOwnProperty.call(body, "imageUrls") ||
        (req.files || []).length > 0;

    if (isCreate || hasLongDescription) {
        payload.longDescription = toStringArray(body.longDescription);
    }

    if (isCreate || hasFeatures) {
        payload.features = toStringArray(body.features);
    }

    if (isCreate || hasMaterials) {
        const normalizedMaterials = toMaterialArray(
            body.materialUsages ?? body.materials,
        );
        payload.materialUsages = normalizedMaterials;
        payload.materials = normalizedMaterials;
    }

    if (isCreate || hasImageInputs) {
        const hasExistingImagesField = Object.prototype.hasOwnProperty.call(
            body,
            "existingImages",
        );
        const existingImages = hasExistingImagesField
            ? toStringArray(body.existingImages)
            : toStringArray(fallbackImages);
        const uploadedImages = (req.files || []).map(
            (file) => `/uploads/services/${file.filename}`,
        );
        const imageUrls = toStringArray(body.imageUrls);
        const downloadedImages = [];

        for (const imageUrl of imageUrls) {
            const imagePath = await saveImageFromUrl(imageUrl);
            downloadedImages.push(imagePath);
        }

        payload.imageUrl = uniqueValues([
            ...existingImages,
            ...uploadedImages,
            ...downloadedImages,
        ]);
    }

    return payload;
};

const getServices = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 4;
        console.log(page);

        const { services, total } = await serviceService.getAllServices({
            page,
            limit,
        });
        // console.log(page, services)
        res.status(200).json({
            data: services,
            total,
            page,
            limit,
            hasMore: (page + 1) * limit < total,
        });
    } catch (error) {
        next(error);
    }
};




const getDropdownServices = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        const result = await serviceService.getAllServicesForDropdown(
            page,
            limit,
        );

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Kiểm tra định dạng ObjectId của MongoDB (nếu bạn dùng MongoDB)
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new ErrorException(400, "Mã dịch vụ (ID) không hợp lệ.");
        }

        const service = await serviceService.getServiceById(id);

        if (!service) {
            throw new ErrorException(404, "Không tìm thấy dịch vụ yêu cầu.");
        }

        res.status(200).json({
            success: true,
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

const createService = async (req, res, next) => {
    try {
        const serviceData = await buildServicePayload(req, [], {
            isCreate: true,
        });
        if (!serviceData.serviceName) {
            throw new ErrorException(400, "Tên dịch vụ là bắt buộc.");
        }
        if (!serviceData.description) {
            throw new ErrorException(400, "Mô tả dịch vụ là bắt buộc.");
        }
        const createdService = await serviceService.createService(serviceData);
        res.status(201).json({
            message: "Tạo dịch vụ thành công",
            data: createdService,
        });
    } catch (error) {
        next(error);
    }
};

const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentService = await serviceService.getServiceById(id);

        if (!currentService) {
            throw new ErrorException(
                404,
                "Không tìm thấy dịch vụ để cập nhật.",
            );
        }

        const updateData = await buildServicePayload(
            req,
            currentService.imageUrl || [],
            { isCreate: false },
        );
        const updatedService = await serviceService.updateService(
            id,
            updateData,
        );

        if (!updatedService) {
            throw new ErrorException(
                404,
                "Không tìm thấy dịch vụ để cập nhật.",
            );
        }

        res.status(200).json({
            message: "Cập nhật dịch vụ thành công",
            data: updatedService,
        });
    } catch (error) {
        next(error);
    }
};

const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedService = await serviceService.deleteService(id);

        if (!deletedService) {
            throw new ErrorException(404, "Không tìm thấy dịch vụ để xóa.");
        }

        res.status(200).json({ message: "Xóa dịch vụ thành công." });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getDropdownServices,
};
