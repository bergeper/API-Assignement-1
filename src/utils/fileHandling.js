const fsPromises = require("fs/promises");
const path = require("path");

exports.fileExists = async (filePath) =>
  !!(await fsPromises.stat(filePath).catch((e) => false));

exports.readJsonFile = async (filePath) =>
  JSON.parse(await fsPromises.readFile(filePath, { encoding: "utf-8" }));

exports.deleteFile = async (filePath) => await fsPromises.unlink(filePath);

exports.productDirectory = path.join(__dirname, "..", "data", "products");
exports.cartDirectory = path.join(__dirname, "..", "data", "carts");
