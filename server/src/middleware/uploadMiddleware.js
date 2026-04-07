const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ErrorException = require("../util/errorException");

const serviceUploadDir = path.join(__dirname, "../../uploads/services");
const materialUploadDir = path.join(__dirname, "../../uploads/materials");

const ensureUploadDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const createUploader = ({ destinationPath, filePrefix, maxFiles }) => {
    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
            ensureUploadDir(destinationPath);
            cb(null, destinationPath);
        },
        filename: (_req, file, cb) => {
            const safeExt = path.extname(file.originalname || "").toLowerCase() || ".jpg";
            const filename = `${filePrefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
            cb(null, filename);
        },
    });

    return multer({
        storage,
        fileFilter,
        limits: {
            files: maxFiles,
            fileSize: 5 * 1024 * 1024,
        },
    });
};

const fileFilter = (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
        cb(new ErrorException(400, "Chỉ chấp nhận file hình ảnh."));
        return;
    }

    cb(null, true);
};

const uploadServiceImages = createUploader({
    destinationPath: serviceUploadDir,
    filePrefix: "service",
    maxFiles: 10,
});

const uploadMaterialImage = createUploader({
    destinationPath: materialUploadDir,
    filePrefix: "material",
    maxFiles: 1,
});

module.exports = {
    uploadServiceImages,
    uploadMaterialImage,
};