import DataUriParser from "datauri";
import path from "path";
const getBuffer = (file) => {
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer);
};
export default getBuffer;
