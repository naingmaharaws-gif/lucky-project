import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads an image file to Firebase Storage.
 * Falls back to Base64 data URL if Firebase Storage is unavailable or restricted.
 */
export async function uploadDogImage(file: File): Promise<string> {
  const fileName = `dogs/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  try {
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn("Firebase Storage upload failed or restricted, falling back to compressed Data URL:", error);
    return fileToDataUrl(file);
  }
}

/**
 * Convert file to Base64 data URL with client-side canvas resizing for fast storage
 */
export function fileToDataUrl(file: File, maxWidth = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
