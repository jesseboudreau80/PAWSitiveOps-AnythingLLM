const fs = require("fs");
const path = require("path");
const { MimeDetector } = require("./mime");

/**
 * The folder where documents are stored to be stored when
 * processed by the collector.
 */
const documentsFolder =
  process.env.NODE_ENV === "production"
    ? path.resolve("/storage/documents") // hardcoded to Render storage mount.
    : path.resolve(__dirname, "../../../server/storage/documents");

/**
 * Checks if a file is text by checking the mime type and then falling back to buffer inspection.
 * This way we can capture all the cases where the mime type is not known but still parseable as text
 * without having to constantly add new mime type overrides.
 * @param {string} filepath - The path to the file.
 * @returns {boolean} - Returns true if the file is text, false otherwise.
 */
function isTextType(filepath) {
  if (!fs.existsSync(filepath)) return false;
  const result = isKnownTextMime(filepath);
  if (result.valid) return true; // Known text type
  if (result.reason !== "generic") return false; // If any other reason than generic
  return parseableAsText(filepath); // Fallback to parsing as text via buffer inspection
}

/**
 * Checks if a file is known to be text by checking the mime type.
 * @param {string} filepath - The path to the file.
 * @returns {Object} - Returns an object with valid:boolean and reason:string.
 */
function isKnownTextMime(filepath) {
  try {
    const mimeLib = new MimeDetector();
    const mime = mimeLib.getType(filepath);
    if (mimeLib.badMimes.includes(mime))
      return { valid: false, reason: "bad_mime" };

    const type = mime.split("/")[0];
    if (mimeLib.nonTextTypes.includes(type))
      return { valid: false, reason: "non_text_mime" };

    return { valid: true, reason: "valid_mime" };
  } catch (e) {
    return { valid: false, reason: "generic" };
  }
}

/**
 * Checks if a file is parseable as text by forcing it to be read as text in utf8 encoding.
 * If the file looks too much like a binary file, it will return false.
 * @param {string} filepath - The path to the file.
 * @returns {boolean} - Returns true if the file is parseable as text, false otherwise.
 */
function parseableAsText(filepath) {
  try {
    const fd = fs.openSync(filepath, "r");
    const buffer = Buffer.alloc(1024);
    const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
    fs.closeSync(fd);

    const content = buffer.subarray(0, bytesRead).toString("utf8");
    const nullCount = (content.match(/\0/g) || []).length;
    const controlCount = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;

    const threshold = bytesRead * 0.1;
    return nullCount + controlCount < threshold;
  } catch {
    return false;
  }
}

/**
 * Safely deletes a file if it exists and is not a directory.
 * @param {string} filepath - The path to the file.
 */
function trashFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  try {
    if (fs.lstatSync(filepath).isDirectory()) return;
  } catch {
    return;
  }
  fs.rmSync(filepath);
}

/**
 * Returns a human-readable creation date for a file, or "unknown" if unavailable.
 * @param {string} filepath - The path to the file.
 * @returns {string}
 */
function createdDate(filepath) {
  try {
    const { birthtimeMs, birthtime } = fs.statSync(filepath);
    if (birthtimeMs === 0) throw new Error("Invalid stat for file!");
    return birthtime.toLocaleString();
  } catch {
    return "unknown";
  }
}

/**
 * Writes JSON data to the server's documents folder and returns metadata.
 * @param {Object} data
 * @param {string} filename
 * @param {string|null} destinationOverride
 * @returns {Object}
 */
function writeToServerDocuments(data = {}, filename, destinationOverride = null) {
  const destination = destinationOverride
    ? path.resolve(destinationOverride)
    : path.resolve(documentsFolder, "custom-documents");

  if (!fs.existsSync(destination))
    fs.mkdirSync(destination, { recursive: true });

  const destinationFilePath = path.resolve(destination, filename) + ".json";
  fs.writeFileSync(destinationFilePath, JSON.stringify(data, null, 4), { encoding: "utf-8" });

  return {
    ...data,
    location: destinationFilePath.split(path.sep).slice(-2).join(path.sep),
  };
}

/**
 * Wipes collector hotdir and tmp storage, ignoring missing directories.
 */
async function wipeCollectorStorage() {
  const cleanHotDir = new Promise((resolve) => {
    const directory = path.resolve(__dirname, "../../hotdir");
    fs.readdir(directory, (err, files) => {
      if (err || !Array.isArray(files)) return resolve();
      for (const file of files) {
        if (file === "__HOTDIR__.md") continue;
        try { fs.rmSync(path.join(directory, file)); } catch {}
      }
      resolve();
    });
  });

  const cleanTmpDir = new Promise((resolve) => {
    const directory = path.resolve(__dirname, "../../storage/tmp");
    fs.readdir(directory, (err, files) => {
      if (err || !Array.isArray(files)) return resolve();
      for (const file of files) {
        if (file === ".placeholder") continue;
        try { fs.rmSync(path.join(directory, file)); } catch {}
      }
      resolve();
    });
  });

  await Promise.all([cleanHotDir, cleanTmpDir]);
  console.log(`Collector hot directory and tmp storage wiped!`);
}

/**
 * Checks if the `inner` path is within `outer` path.
 */
function isWithin(outer, inner) {
  if (outer === inner) return false;
  const rel = path.relative(outer, inner);
  return !rel.startsWith(`..${path.sep}`) && rel !== "..";
}

/**
 * Normalizes and validates a filepath to prevent directory traversal.
 */
function normalizePath(filepath = "") {
  const result = path
    .normalize(filepath.trim())
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .trim();
  if (["..", ".", "/"].includes(result)) throw new Error("Invalid path.");
  return result;
}

/**
 * Sanitizes a filename by removing invalid characters.
 */
function sanitizeFileName(fileName) {
  if (!fileName) return fileName;
  return fileName.replace(/[<>:"\/\\|?*]/g, "");
}

module.exports = {
  trashFile,
  isTextType,
  createdDate,
  writeToServerDocuments,
  wipeCollectorStorage,
  normalizePath,
  isWithin,
  sanitizeFileName,
  documentsFolder,
};
