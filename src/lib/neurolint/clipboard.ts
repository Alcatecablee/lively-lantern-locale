
export async function copyToClipboard(text: string) {
  if (navigator?.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // fallback for unsupported environments
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
