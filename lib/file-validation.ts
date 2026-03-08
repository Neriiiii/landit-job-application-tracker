const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
const ZIP_MAGIC = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const OLE_MAGIC = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0]);

function hasMagic(bytes: Uint8Array, magic: Uint8Array): boolean {
  if (bytes.length < magic.length) return false;
  for (let i = 0; i < magic.length; i++) {
    if (bytes[i] !== magic[i]) return false;
  }
  return true;
}

export async function isPdfContent(file: File): Promise<boolean> {
  const buf = await file.slice(0, 4).arrayBuffer();
  return hasMagic(new Uint8Array(buf), PDF_MAGIC);
}

export async function isWordDocumentContent(file: File): Promise<boolean> {
  const buf = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buf);
  return hasMagic(bytes, ZIP_MAGIC) || hasMagic(bytes, OLE_MAGIC);
}

export async function assertPdfContent(file: File): Promise<void> {
  const ok = await isPdfContent(file);
  if (!ok) throw new Error("File content is not a valid PDF.");
}

export async function assertPdfOrWordContent(file: File): Promise<void> {
  const isPdf = await isPdfContent(file);
  const isWord = await isWordDocumentContent(file);
  if (!isPdf && !isWord) throw new Error("File must be a PDF or Word document (.pdf, .doc, .docx).");
}
