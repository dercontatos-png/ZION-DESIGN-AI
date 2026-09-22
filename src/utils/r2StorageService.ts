import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface R2Config {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  publicDomain?: string;
}

export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim() || "designbuilder";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    accountId,
    bucketName,
    accessKeyId,
    secretAccessKey,
    endpoint: process.env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`,
    publicDomain: process.env.R2_PUBLIC_DOMAIN?.trim() || `https://${accountId}.r2.cloudflarestorage.com/${bucketName}`
  };
}

export function isR2Active(): boolean {
  return getR2Config() !== null;
}

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
  const kDate = crypto.createHmac("sha256", "AWS4" + key).update(dateStamp).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(regionName).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(serviceName).digest();
  const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
  return kSigning;
}

/**
 * Upload an asset buffer directly to Cloudflare R2 using AWS SigV4
 */
export async function uploadToR2(
  key: string,
  data: Buffer,
  contentType: string = "application/octet-stream"
): Promise<{ success: boolean; url: string; key: string; error?: string }> {
  const config = getR2Config();
  if (!config) {
    return { success: false, url: "", key, error: "Cloudflare R2 is not configured." };
  }

  try {
    const cleanKey = key.replace(/^[/\\]+/, "");
    const host = `${config.accountId}.r2.cloudflarestorage.com`;
    const region = "auto";
    const service = "s3";

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);

    const payloadHash = crypto.createHash("sha256").update(data).digest("hex");
    const canonicalUri = `/${config.bucketName}/${cleanKey.split("/").map(encodeURIComponent).join("/")}`;

    // Canonical Headers (sorted lowercase)
    const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest = `PUT\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;

    const signingKey = getSignatureKey(config.secretAccessKey, dateStamp, region, service);
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const targetUrl = `https://${host}${canonicalUri}`;

    const response = await fetch(targetUrl, {
      method: "PUT",
      headers: {
        "Host": host,
        "Content-Type": contentType,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        "Authorization": authorization
      },
      body: data
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[R2 Upload Failed] HTTP ${response.status}:`, errText);
      return { success: false, url: "", key: cleanKey, error: `R2 HTTP ${response.status}: ${errText}` };
    }

    const publicUrl = `/designbuilder/${cleanKey}`;
    console.log(`[R2 Upload Success] Saved key "${cleanKey}" to bucket "${config.bucketName}"`);
    return { success: true, url: publicUrl, key: cleanKey };
  } catch (err: any) {
    console.error("[R2 Upload Exception]:", err);
    return { success: false, url: "", key, error: err.message || String(err) };
  }
}

/**
 * Fetch an asset buffer directly from Cloudflare R2 using AWS SigV4
 */
export async function downloadFromR2(key: string): Promise<{ data: Buffer; contentType: string } | null> {
  const config = getR2Config();
  if (!config) return null;

  try {
    const cleanKey = key.replace(/^[/\\]+/, "");
    const host = `${config.accountId}.r2.cloudflarestorage.com`;
    const region = "auto";
    const service = "s3";

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);

    const payloadHash = crypto.createHash("sha256").update("").digest("hex");
    const canonicalUri = `/${config.bucketName}/${cleanKey.split("/").map(encodeURIComponent).join("/")}`;

    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest = `GET\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;

    const signingKey = getSignatureKey(config.secretAccessKey, dateStamp, region, service);
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const targetUrl = `https://${host}${canonicalUri}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Host": host,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        "Authorization": authorization
      }
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    return { data: buffer, contentType };
  } catch (err) {
    console.error("[R2 Download Exception]:", err);
    return null;
  }
}

/**
 * Delete a single object from Cloudflare R2 using AWS SigV4
 */
export async function deleteFromR2(
  key: string
): Promise<{ success: boolean; key: string; error?: string }> {
  const config = getR2Config();
  if (!config) {
    return { success: false, key, error: "Cloudflare R2 is not configured." };
  }

  try {
    const cleanKey = key.replace(/^[/\\]+/, "");
    const host = `${config.accountId}.r2.cloudflarestorage.com`;
    const region = "auto";
    const service = "s3";

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);

    const payloadHash = crypto.createHash("sha256").update("").digest("hex");
    const canonicalUri = `/${config.bucketName}/${cleanKey.split("/").map(encodeURIComponent).join("/")}`;

    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest = `DELETE\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;

    const signingKey = getSignatureKey(config.secretAccessKey, dateStamp, region, service);
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const targetUrl = `https://${host}${canonicalUri}`;

    const response = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        "Host": host,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        "Authorization": authorization
      }
    });

    if (!response.ok && response.status !== 204) {
      const errText = await response.text();
      console.error(`[R2 Delete Failed] HTTP ${response.status}:`, errText);
      return { success: false, key: cleanKey, error: `R2 HTTP ${response.status}: ${errText}` };
    }

    console.log(`[R2 Delete Success] Removed key "${cleanKey}" from bucket "${config.bucketName}"`);
    return { success: true, key: cleanKey };
  } catch (err: any) {
    console.error("[R2 Delete Exception]:", err);
    return { success: false, key, error: err.message || String(err) };
  }
}

/**
 * List all objects in R2 under a given prefix using S3 ListObjectsV2
 */
export async function listR2Objects(
  prefix: string
): Promise<string[]> {
  const config = getR2Config();
  if (!config) return [];

  try {
    const cleanPrefix = prefix.replace(/^[/\\]+/, "");
    const host = `${config.accountId}.r2.cloudflarestorage.com`;
    const region = "auto";
    const service = "s3";

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);

    const payloadHash = crypto.createHash("sha256").update("").digest("hex");
    const canonicalUri = `/${config.bucketName}`;
    const queryString = `list-type=2&prefix=${encodeURIComponent(cleanPrefix)}`;

    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest = `GET\n${canonicalUri}\n${queryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;

    const signingKey = getSignatureKey(config.secretAccessKey, dateStamp, region, service);
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const targetUrl = `https://${host}${canonicalUri}?${queryString}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Host": host,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        "Authorization": authorization
      }
    });

    if (!response.ok) {
      console.error(`[R2 List Failed] HTTP ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    // Parse keys from XML response: <Key>...</Key>
    const keys: string[] = [];
    const keyRegex = /<Key>([^<]+)<\/Key>/g;
    let match;
    while ((match = keyRegex.exec(xmlText)) !== null) {
      keys.push(match[1]);
    }

    console.log(`[R2 List] Found ${keys.length} objects with prefix "${cleanPrefix}"`);
    return keys;
  } catch (err: any) {
    console.error("[R2 List Exception]:", err);
    return [];
  }
}

/**
 * Delete all R2 objects under a given prefix (e.g. "results/jobId/")
 * Uses listR2Objects to discover keys, then deleteFromR2 for each.
 * Also attempts known common paths as fallback.
 */
export async function deleteR2Prefix(
  prefix: string
): Promise<{ deleted: number; errors: number }> {
  const cleanPrefix = prefix.replace(/^[/\\]+/, "");
  let deleted = 0;
  let errors = 0;

  // Try listing objects first
  const keys = await listR2Objects(cleanPrefix);

  if (keys.length > 0) {
    // Delete all discovered keys
    for (const key of keys) {
      const result = await deleteFromR2(key);
      if (result.success) {
        deleted++;
      } else {
        errors++;
      }
    }
  } else {
    // Fallback: try known common paths for this prefix
    const knownSuffixes = [
      "result.avif", "result.png",
      "thumbnail.avif", "thumbnail.png"
    ];
    for (const suffix of knownSuffixes) {
      const key = `${cleanPrefix}${suffix}`;
      const result = await deleteFromR2(key);
      if (result.success) deleted++;
    }
  }

  console.log(`[R2 Prefix Delete] prefix="${cleanPrefix}": ${deleted} deleted, ${errors} errors`);
  return { deleted, errors };
}
