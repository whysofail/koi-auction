import multer from "multer";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./uploads");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Define how to name the file
  },
});

export default storage;
