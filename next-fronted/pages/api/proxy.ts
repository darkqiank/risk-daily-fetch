import { getLinkPreview } from "link-preview-js";

export default async function handler(req: any, res: any) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    const metadata = await getLinkPreview(url, {
      timeout: 3000,
    });

    res.status(200).json(metadata);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
}
