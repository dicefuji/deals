import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

import { getRecommendations } from "./services/getRecommendations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");

const demoRequest = {
  query: "Dinner",
  budget: 35,
  maxEtaMinutes: 45,
  prioritizeBogo: true
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function serveStatic(response, filePath) {
  const extension = path.extname(filePath);
  const contentTypeMap = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8"
  };
  const content = await readFile(filePath);
  response.writeHead(200, {
    "Content-Type": contentTypeMap[extension] || "text/plain; charset=utf-8"
  });
  response.end(content);
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        browserUseConfigured: Boolean(process.env.BROWSER_USE_API_KEY && process.env.BROWSER_USE_PROFILE_ID),
        model: process.env.BROWSER_USE_MODEL || "browser-use-2.0"
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/demo") {
      sendJson(response, 200, await getRecommendations({ ...demoRequest, mode: "mock" }));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/recommendations") {
      const userInput = await parseBody(request);
      const mode = userInput.mode === "mock" ? "mock" : "live";
      sendJson(response, 200, await getRecommendations({ ...userInput, mode }));
      return;
    }

    if (request.method === "GET") {
      const staticPath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      await serveStatic(response, path.join(publicDir, staticPath));
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    const missingConfig = error.message.includes("Missing required environment variable");
    const hint = missingConfig
      ? "Set `BROWSER_USE_API_KEY` and `BROWSER_USE_PROFILE_ID` before starting the app, then retry live mode."
      : "Live mode now uses Browser Use Cloud with a synced DoorDash profile.";

    sendJson(response, 500, {
      error: error.message,
      hint,
      debug: error.debug || null
    });
  }
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

server.listen(port, host, () => {
  console.log(`Deals app running at http://${host}:${port}`);
});
