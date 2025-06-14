
export async function transform(code: string): Promise<string> {
  // Adds 'use client' to the top of files returning JSX, only if not present
  if (
    code.includes("<") && // naive check for JSX
    !/['"]use client['"]/.test(code.slice(0, 40))
  ) {
    return '"use client"\n' + code;
  }
  return code;
}
