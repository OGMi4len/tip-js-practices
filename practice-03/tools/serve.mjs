import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.argv[2]) || 5503;

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
    try {
        const url = new URL(req.url, "http://localhost");
        const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
        const filePath = normalize(join(root, decodeURIComponent(pathname)));

        if (!filePath.startsWith(root)) {
            res.writeHead(403).end("Forbidden");
            return;
        }

        const stats = await stat(filePath);
        if (stats.isDirectory()) {
            res.writeHead(404).end("Not found");
            return;
        }

        const data = await readFile(filePath);
        const type = MIME[extname(filePath)] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": type });
        res.end(data);
    } catch {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`Сервер запущен: http://127.0.0.1:${port}/`);
});