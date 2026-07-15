export const FormData = typeof window !== 'undefined' ? window.FormData : null;
export function formDataToBlob(formData) {
  return formData;
}
