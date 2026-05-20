import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body || {};

    if (!image || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "Missing image base64 data" });
    }

    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION;
    const processorId = process.env.GOOGLE_PROCESSOR_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !location || !processorId || !clientEmail || !privateKey) {
      return res.status(500).json({ error: "Missing Google Document AI environment variables" });
    }

    const base64 = image.split(",")[1];
    const mimeType = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)?.[1] || "image/jpeg";

    const auth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;

    if (!token) {
      return res.status(500).json({ error: "Failed to get Google access token" });
    }

    const endpoint = `https://${location}-documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;

    const aiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rawDocument: {
          content: base64,
          mimeType,
        },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return res.status(500).json({ error: `Document AI failed: ${errText}` });
    }

    const result = await aiRes.json();
    const text = result.document?.text || "";
    const rows = parseDocumentTextToRows(text);

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message || "OCR processing failed" });
  }
}

function parseDocumentTextToRows(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [{ 內容: "" }];

  return lines.map((line, index) => {
    const parts = line
      .split(/\s{2,}|\t|：|:/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      return {
        項目: parts[0],
        內容: parts.slice(1).join(" "),
      };
    }

    return {
      行號: String(index + 1),
      內容: line,
    };
  });
}
