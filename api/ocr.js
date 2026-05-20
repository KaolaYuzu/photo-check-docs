import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { image } = req.body || {};
    if (!image || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION;
    const processorId = process.env.GOOGLE_PROCESSOR_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !location || !processorId || !clientEmail || !privateKey) {
      return res.status(500).json({ error: "Server OCR configuration is incomplete" });
    }

    const base64 = image.split(",")[1];
    const mimeType = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)?.[1] || "image/jpeg";

    const auth = new GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const endpoint = `https://${location}-documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;
    const aiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rawDocument: { content: base64, mimeType } }),
    });

    if (!aiRes.ok) return res.status(502).json({ error: "OCR service failed. Please try again with a clearer image." });

    const result = await aiRes.json();
    const doc = result.document || {};
    const rows = extractTables(doc);
    if (rows.length) return res.status(200).json(rows);

    return res.status(200).json(fallbackTextRows(doc.text || ""));
  } catch (error) {
    return res.status(500).json({ error: "OCR processing failed. Please try again." });
  }
}

function textFromLayout(documentText, layout) {
  const segments = layout?.textAnchor?.textSegments || [];
  return segments
    .map((s) => documentText.substring(Number(s.startIndex || 0), Number(s.endIndex || 0)))
    .join("")
    .replace(/\n/g, " ")
    .trim();
}

function extractTables(doc) {
  const documentText = doc.text || "";
  const output = [];

  for (const page of doc.pages || []) {
    for (const table of page.tables || []) {
      const headerRows = table.headerRows || [];
      const bodyRows = table.bodyRows || [];
      const headerCells = headerRows[0]?.cells || [];
      let headers = headerCells.map((cell, index) => textFromLayout(documentText, cell.layout) || `欄位${index + 1}`);

      const maxCells = Math.max(headers.length, ...bodyRows.map((row) => row.cells?.length || 0));
      if (!headers.length || headers.every((h) => /^欄位\d+$/.test(h))) {
        headers = Array.from({ length: maxCells || 1 }, (_, i) => `欄位${i + 1}`);
      } else if (headers.length < maxCells) {
        headers = [...headers, ...Array.from({ length: maxCells - headers.length }, (_, i) => `欄位${headers.length + i + 1}`)];
      }

      for (const row of bodyRows) {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = textFromLayout(documentText, row.cells?.[i]?.layout) || "";
        });
        if (Object.values(obj).some(Boolean)) output.push(obj);
      }
    }
  }

  return normalizeRows(output);
}

function normalizeRows(rows) {
  if (!rows.length) return [];
  const allKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  return rows.map((row) => {
    const out = {};
    allKeys.forEach((key) => { out[key] = row[key] ?? ""; });
    return out;
  });
}

function fallbackTextRows(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [{ 段落: "" }];

  const rows = lines.map((line, i) => {
    const parts = line.split(/\s{2,}|\t|：|:/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return { 項目: parts[0], 內容: parts.slice(1).join(" ") };
    return { 行號: String(i + 1), 內容: line };
  });
  return normalizeRows(rows);
}
