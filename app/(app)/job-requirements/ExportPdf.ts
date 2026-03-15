"use client";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MAX_PAGES = 2;

export async function exportElementToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const originalWidth = element.style.width;
  const originalMinWidth = element.style.minWidth;
  const originalMaxWidth = element.style.maxWidth;
  const originalMinHeight = element.style.minHeight;
  const originalMaxHeight = element.style.maxHeight;
  const originalPosition = element.style.position;
  const originalLeft = element.style.left;
  const originalTop = element.style.top;
  const originalZIndex = element.style.zIndex;

  element.style.width = "210mm";
  element.style.minWidth = "210mm";
  element.style.maxWidth = "210mm";
  element.style.minHeight = "297mm";
  element.style.maxHeight = "594mm"; // 2 × A4
  element.style.position = "fixed";
  element.style.left = "-9999px";
  element.style.top = "0";
  element.style.zIndex = "-1";

  await new Promise((r) => requestAnimationFrame(r));

  try {
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgWidth = A4_WIDTH_MM;
    const imgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width;
    const totalPages = Math.min(MAX_PAGES, Math.max(1, Math.ceil(imgHeight / A4_HEIGHT_MM)));

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    for (let p = 0; p < totalPages; p++) {
      if (p > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "PNG", 0, -(p * A4_HEIGHT_MM), imgWidth, imgHeight);
    }

    pdf.save(filename);
  } finally {
    element.style.width = originalWidth;
    element.style.minWidth = originalMinWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.minHeight = originalMinHeight;
    element.style.maxHeight = originalMaxHeight;
    element.style.position = originalPosition;
    element.style.left = originalLeft;
    element.style.top = originalTop;
    element.style.zIndex = originalZIndex;
  }
}

export async function exportElementToPdfAsBlob(element: HTMLElement): Promise<Blob> {
  const originalWidth = element.style.width;
  const originalMinWidth = element.style.minWidth;
  const originalMaxWidth = element.style.maxWidth;
  const originalMinHeight = element.style.minHeight;
  const originalMaxHeight = element.style.maxHeight;
  const originalPosition = element.style.position;
  const originalLeft = element.style.left;
  const originalTop = element.style.top;
  const originalZIndex = element.style.zIndex;

  element.style.width = "210mm";
  element.style.minWidth = "210mm";
  element.style.maxWidth = "210mm";
  element.style.minHeight = "297mm";
  element.style.maxHeight = "594mm"; // 2 × A4
  element.style.position = "fixed";
  element.style.left = "-9999px";
  element.style.top = "0";
  element.style.zIndex = "-1";

  await new Promise((r) => requestAnimationFrame(r));

  try {
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgWidth = A4_WIDTH_MM;
    const imgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width;
    const totalPages = Math.min(MAX_PAGES, Math.max(1, Math.ceil(imgHeight / A4_HEIGHT_MM)));

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    for (let p = 0; p < totalPages; p++) {
      if (p > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "PNG", 0, -(p * A4_HEIGHT_MM), imgWidth, imgHeight);
    }

    return pdf.output("blob");
  } finally {
    element.style.width = originalWidth;
    element.style.minWidth = originalMinWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.minHeight = originalMinHeight;
    element.style.maxHeight = originalMaxHeight;
    element.style.position = originalPosition;
    element.style.left = originalLeft;
    element.style.top = originalTop;
    element.style.zIndex = originalZIndex;
  }
}

const JPEG_QUALITY = 0.82;

export async function exportElementToPdfAsBlobCompressed(
  element: HTMLElement
): Promise<Blob> {
  const originalWidth = element.style.width;
  const originalMinWidth = element.style.minWidth;
  const originalMaxWidth = element.style.maxWidth;
  const originalMinHeight = element.style.minHeight;
  const originalMaxHeight = element.style.maxHeight;
  const originalPosition = element.style.position;
  const originalLeft = element.style.left;
  const originalTop = element.style.top;
  const originalZIndex = element.style.zIndex;

  element.style.width = "210mm";
  element.style.minWidth = "210mm";
  element.style.maxWidth = "210mm";
  element.style.minHeight = "297mm";
  element.style.maxHeight = "594mm"; // 2 × A4
  element.style.position = "fixed";
  element.style.left = "-9999px";
  element.style.top = "0";
  element.style.zIndex = "-1";

  await new Promise((r) => requestAnimationFrame(r));

  try {
    const canvas = await html2canvas(element, {
      scale: 1.2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgWidth = A4_WIDTH_MM;
    const imgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width;
    const totalPages = Math.min(
      MAX_PAGES,
      Math.max(1, Math.ceil(imgHeight / A4_HEIGHT_MM))
    );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    for (let p = 0; p < totalPages; p++) {
      if (p > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "JPEG", 0, -(p * A4_HEIGHT_MM), imgWidth, imgHeight);
    }

    return pdf.output("blob");
  } finally {
    element.style.width = originalWidth;
    element.style.minWidth = originalMinWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.minHeight = originalMinHeight;
    element.style.maxHeight = originalMaxHeight;
    element.style.position = originalPosition;
    element.style.left = originalLeft;
    element.style.top = originalTop;
    element.style.zIndex = originalZIndex;
  }
}
