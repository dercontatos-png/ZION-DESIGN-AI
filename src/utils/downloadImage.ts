/**
 * Downloads the original image directly from its base64 representation as an unaltered binary Blob,
 * preventing any browser canvas compression or pixel loss.
 */
export const downloadImage = (base64Data: string, formatoSelecionado: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) {
        // Fallback for non-base64 or direct links
        const link = document.createElement("a");
        link.href = base64Data;
        link.download = `Zion_Premium_Card_${Date.now()}.${formatoSelecionado.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
        return;
      }

      const originalMime = base64Data.match(/^data:([^;]+);/)?.[1] || "image/jpeg";
      const base64Content = match[2];
      
      // Decode base64 to raw binary bytes
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: originalMime });
      
      const blobUrl = URL.createObjectURL(blob);
      // Use original extension from mime or the requested extension (defaulting to the original format's extension for pristine fidelity)
      let extension = formatoSelecionado.toLowerCase();
      if (!formatoSelecionado) {
        extension = originalMime.split("/")[1] || "jpeg";
      }
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Zion_Premium_Card_${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the object URL after download is triggered
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 200);
      
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

