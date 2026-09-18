import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { InvoiceData, InvoiceItem } from '../types';
import { numberToIndianRupees } from './numberToWords';
import { calculateInvoiceTotals } from './invoiceCalculations';
import {
  formatInvoiceAmount,
  formatInvoiceDate,
  formatInvoiceQuantity,
  getInvoicePricingMeta,
  getInvoiceItemMeta,
  getInvoiceProductName,
  getInvoicePlaceOfSupply,
} from './invoiceFormatting';
import { gstLabel } from './invoiceCalculations';

function formatPdfAmount(amount: number): string {
  return formatInvoiceAmount(amount).replace(/^₹/, 'INR ');
}

export function getInvoicePdfExportData(invoiceData: InvoiceData) {
  const totals = calculateInvoiceTotals(invoiceData);
  return {
    invoiceNumber: invoiceData.invoiceNumber,
    invoiceDate: invoiceData.invoiceDate,
    items: invoiceData.items.map(item => ({
      description: getInvoiceProductName(item),
      quantity: item.qty,
      unit: item.unit,
      commissionAmount: item.commissionAmount,
    })),
    totalQuantity: invoiceData.items.reduce((sum, item) => sum + (item.qty || 0), 0),
    ...totals,
  };
}

export function getInvoicePdfFileName(invoiceNumber: string): string {
  const normalized = (invoiceNumber || '')
    .normalize('NFKD')
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9/ -]/g, '')
    .trim();
  const parts = normalized.split(/[\\/]+/).map(part => part.trim()).filter(Boolean);
  const numericParts = parts.filter(part => /^\d+$/.test(part) && !/^(?:19|20)\d{2}$/.test(part));
  const sequencePart = numericParts[numericParts.length - 1]
    || (/(?:19|20)\d{2}[- ]\d{2}/.test(normalized) ? undefined : normalized.match(/(?:^|[^\d])(\d{1,})(?:[^\d]|$)/)?.[1]);
  const sequence = sequencePart ? sequencePart.padStart(3, '0') : '001';
  return `Invoice_MCA_2026-27_${sequence}.pdf`;
}

function nonEmpty(value: string | undefined): string {
  return value?.trim() || '';
}

function lineCount(lines: string | string[]): number {
  return Array.isArray(lines) ? lines.length : lines ? 1 : 0;
}

/**
 * Generates a standards-based A4 invoice using the reference geometry as a guide.
 */
export function createInvoicePdfDoc(invoiceData: InvoiceData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  
  const marginX = 28;
  const contentWidth = pageWidth - marginX * 2; // ~557.84 pt
  let currentY = marginX;

  // 1. Premium top banner with strong contrast and value hierarchy
  const bannerHeight = 20;
  const navy: [number, number, number] = [15, 23, 42];
  const slate: [number, number, number] = [51, 65, 85];
  doc.setFillColor(...navy);
  doc.rect(marginX, currentY, contentWidth, bannerHeight, 'FD');
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.5);
  doc.rect(marginX, currentY, contentWidth, bannerHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageWidth / 2, currentY + 16, { align: 'center' });

  currentY += bannerHeight;

  // 2. Seller Agency Details Block
  const sellerBlockStartY = currentY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const sellerName = nonEmpty(invoiceData.seller.name);
  const sellerNameLines = sellerName ? doc.splitTextToSize(sellerName, contentWidth - 40) : [];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const sellerAddressLines = invoiceData.seller.address
    ? doc.splitTextToSize(invoiceData.seller.address, contentWidth - 40)
    : [];
  const sellerPartnerLine = [
    nonEmpty(invoiceData.seller.partnerName) ? `Partner: ${nonEmpty(invoiceData.seller.partnerName)}` : '',
    nonEmpty(invoiceData.seller.phone) ? `Ph: ${nonEmpty(invoiceData.seller.phone)}` : '',
  ].filter(Boolean).join('  |  ');
  const sellerPartnerLines = sellerPartnerLine ? doc.splitTextToSize(sellerPartnerLine, contentWidth - 40) : [];
  const sellerGstinPanLine = [
    invoiceData.seller.gstin ? `GSTIN No : ${invoiceData.seller.gstin}` : '',
    invoiceData.seller.pan ? `PAN Number : ${invoiceData.seller.pan}` : '',
  ].filter(Boolean).join('   ');
  const sellerBlockHeight = Math.max(
    64,
    12 + lineCount(sellerNameLines) * 15 + lineCount(sellerAddressLines) * 8 + 8 + lineCount(sellerPartnerLines) * 8 + (sellerGstinPanLine ? 9 : 0) + 7,
  );

  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, sellerBlockStartY, contentWidth, sellerBlockHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate);
  doc.setFontSize(16);
  let sellerY = currentY + 19;
  doc.text(sellerNameLines, pageWidth / 2, sellerY, { align: 'center' });
  sellerY += lineCount(sellerNameLines) * 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  if (sellerAddressLines.length) {
    doc.text(sellerAddressLines, pageWidth / 2, sellerY, { align: 'center' });
    sellerY += sellerAddressLines.length * 8;
  }

  if (invoiceData.seller.cityStateZip) {
    doc.text(invoiceData.seller.cityStateZip, pageWidth / 2, sellerY, { align: 'center' });
    sellerY += 9;
  }
  if (sellerPartnerLines.length) {
    doc.setFont('helvetica', 'bold');
    doc.text(sellerPartnerLines, pageWidth / 2, sellerY, { align: 'center' });
    sellerY += sellerPartnerLines.length * 8 + 2;
  }

  doc.setFontSize(8.5);
  if (sellerGstinPanLine) {
    doc.text(sellerGstinPanLine, pageWidth / 2, sellerY, { align: 'center' });
  }

  // Border around seller block
  doc.setDrawColor(...slate);
  doc.setLineWidth(0.5);
  doc.rect(marginX, sellerBlockStartY, contentWidth, sellerBlockHeight, 'S');

  currentY += sellerBlockHeight;

  // 3. Three-Column Parties & Meta Details Grid
  // Keep the PDF proportions identical to the 5/4/3 preview grid.
  const partiesBlockStartY = currentY;
  const col1Width = contentWidth * (5 / 12);
  const col2Width = contentWidth * (4 / 12);
  const col3Width = contentWidth - col1Width - col2Width;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const buyerAddr = [invoiceData.buyer.address, invoiceData.buyer.cityStateZip].filter(Boolean).join(', ');
  const splitBuyerAddr = buyerAddr ? doc.splitTextToSize(buyerAddr, col1Width - 12) : [];
  const posText = getInvoicePlaceOfSupply(invoiceData.buyer.name, invoiceData.buyer.placeOfSupply);
  const splitPos = posText ? doc.splitTextToSize(posText, col2Width - 12) : [];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const invoiceNumberLines = invoiceData.invoiceNumber ? doc.splitTextToSize(invoiceData.invoiceNumber, col3Width - 12) : [];
  doc.setFontSize(10.5);
  const invoiceDateLines = doc.splitTextToSize(formatInvoiceDate(invoiceData.invoiceDate), col3Width - 12);
  const partiesBlockHeight = Math.max(
    70,
    42 + Math.max(splitBuyerAddr.length * 8.5, splitPos.length * 8.5, invoiceNumberLines.length * 12, invoiceDateLines.length * 12) + 20,
  );

  const col1X = marginX;
  const col2X = marginX + col1Width;
  const col3X = col2X + col2Width;

  // Col 1 Content: Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BILLED TO:', col1X + 6, partiesBlockStartY + 12);

  doc.setFontSize(8.8);
  doc.text(doc.splitTextToSize(invoiceData.buyer.name || '', col1Width - 12).slice(0, 1), col1X + 6, partiesBlockStartY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text(splitBuyerAddr, col1X + 6, partiesBlockStartY + 34);

  const buyerAddrEndY = partiesBlockStartY + 34 + splitBuyerAddr.length * 8.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  if (invoiceData.buyer.gstin) {
    doc.text(`GSTIN: ${invoiceData.buyer.gstin}`, col1X + 6, Math.min(buyerAddrEndY + 4, partiesBlockStartY + 68));
  }

  // Col 2 Content: Place of Supply
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Place of Supply / Service:', col2X + 6, partiesBlockStartY + 12);

  doc.setFontSize(8);
  doc.text(invoiceData.buyer.name || '', col2X + 6, partiesBlockStartY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(splitPos, col2X + 6, partiesBlockStartY + 34);

  // Col 3 Content: INVOICE No. and DATE (split horizontally in middle)
  const metaHalfHeight = partiesBlockHeight / 2;
  doc.setDrawColor(...slate);
  doc.line(col3X, partiesBlockStartY + metaHalfHeight, col3X + col3Width, partiesBlockStartY + metaHalfHeight);

  // Top half: Invoice No with compact emphasis panel
  doc.setFillColor(244, 247, 250);
  doc.rect(col3X, partiesBlockStartY, col3Width, metaHalfHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('INVOICE No.:', col3X + 6, partiesBlockStartY + 13);
  doc.setFontSize(11);
  doc.text(invoiceNumberLines, col3X + 6, partiesBlockStartY + 28);

  // Bottom half: Date
  doc.setFillColor(250, 250, 251);
  doc.rect(col3X, partiesBlockStartY + metaHalfHeight, col3Width, metaHalfHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('DATE:', col3X + 6, partiesBlockStartY + metaHalfHeight + 13);
  doc.setFontSize(10.5);
  doc.text(invoiceDateLines, col3X + 6, partiesBlockStartY + metaHalfHeight + 28);

  // Draw the grid after filling the cells so no border is covered by a background fill.
  doc.setDrawColor(...slate);
  doc.setLineWidth(0.5);
  doc.rect(col1X, partiesBlockStartY, contentWidth, partiesBlockHeight, 'S');
  doc.line(col2X, partiesBlockStartY, col2X, partiesBlockStartY + partiesBlockHeight);
  doc.line(col3X, partiesBlockStartY, col3X, partiesBlockStartY + partiesBlockHeight);
  doc.line(col3X, partiesBlockStartY + metaHalfHeight, col3X + col3Width, partiesBlockStartY + metaHalfHeight);

  currentY += partiesBlockHeight;

  // 4. Line Items Table Construction
  // Group items by Customer to match exact reference format
  const customerGroups = new Map<string, InvoiceItem[]>();
  invoiceData.items.forEach(item => {
    const cust = item.customer || 'General Items';
    if (!customerGroups.has(cust)) {
      customerGroups.set(cust, []);
    }
    customerGroups.get(cust)!.push(item);
  });

  const tableBody: RowInput[] = [];

  customerGroups.forEach((groupItems, custName) => {
    // If there's a valid customer name, add the Customer header row
    if (custName && custName !== 'General Items') {
      tableBody.push([
        {
          content: `CUSTOMER  |  ${custName}`,
          colSpan: 4,
          styles: { fontStyle: 'bold', fontSize: 6.8, fillColor: [241, 245, 249], textColor: [30, 41, 59], lineColor: [100, 116, 139], lineWidth: 0.5, cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 5 } },
        },
      ]);
    }

    groupItems.forEach(item => {
        const itemMeta = getInvoiceItemMeta(item);
        const pricingLine = getInvoicePricingMeta(item)
          .replace('Unit price:', 'Unit Price:')
          .replace('Commission rate:', 'Comm Rate:')
          .replace(/₹/g, 'INR ');
      tableBody.push([
        {
          content: [
            getInvoiceProductName(item),
            [itemMeta, pricingLine].filter(Boolean).join(' | '),
          ].filter(Boolean).join('\n'),
            styles: { cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 6 }, fontSize: 6.5, lineColor: [203, 203, 203] },
        },
        item.hsnSacCode || '',
        formatInvoiceQuantity(item),
        formatPdfAmount(item.commissionAmount),
      ]);
    });
  });

  const { taxableValue, gstAmount, cgstAmount, sgstAmount, grandTotal, igstAmount } = getInvoicePdfExportData(invoiceData);
  const gstRate = invoiceData.gstRate || 0;

  const summaryRows: RowInput[] = [
    [
      {
        content: 'Taxable Value',
        colSpan: 3,
        styles: { fontStyle: 'bold', halign: 'right' },
      },
      {
        content: formatPdfAmount(taxableValue),
        styles: { fontStyle: 'bold', halign: 'right' },
      },
    ],

    [
      {
        content: `ADD: ${gstLabel(invoiceData.gstType, gstRate)}`,
        colSpan: 3,
        styles: { fontStyle: 'bold', halign: 'right' },
      },
      {
        content: formatPdfAmount(invoiceData.gstType === 'IGST' ? igstAmount : cgstAmount + sgstAmount),
        styles: { fontStyle: 'bold', halign: 'right' },
      },
    ],
  ];

  const { roundOff } = calculateInvoiceTotals(invoiceData);
  if (roundOff !== 0) {
    summaryRows.push([
      { content: 'Round Off', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: formatPdfAmount(roundOff), styles: { fontStyle: 'bold', halign: 'right' } },
    ]);
  }

  summaryRows.push([
    {
      content: 'Total',
      colSpan: 3,
      styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] },
    },
    {
      content: formatPdfAmount(grandTotal),
      styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] },
    },
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [[
      { content: 'Description of Services', styles: { halign: 'left' } },
      { content: 'HSN/SAC CODE', styles: { halign: 'center' } },
      { content: 'Qty', styles: { halign: 'center' } },
      { content: 'Amount', styles: { halign: 'right' } },
    ]],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      halign: 'center',
      lineColor: [15, 23, 42],
      lineWidth: 0.5,
    },
    styles: {
      fontSize: 6.9,
      textColor: [15, 23, 42],
      cellPadding: 1.5,
      lineColor: [148, 163, 184],
      lineWidth: 0.35,
      valign: 'middle',
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: contentWidth * 0.48 },
      1: { halign: 'center', cellWidth: contentWidth * 0.14 },
      2: { halign: 'center', cellWidth: contentWidth * 0.14 },
      3: { halign: 'right', cellWidth: contentWidth * 0.24 },
    },
    pageBreak: 'auto',
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
    tableLineColor: [148, 163, 184],
    tableLineWidth: 0.35,
    margin: { top: marginX, right: marginX, bottom: marginX, left: marginX },
  });

  // 5. Amount in Words Box with stronger emphasis on payable value
  const amountWords = numberToIndianRupees(grandTotal);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  const amountWordLines = doc.splitTextToSize(amountWords, contentWidth - 14);
  const wordsBoxHeight = Math.max(28, 16 + amountWordLines.length * 8);

  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomBoxHeight = 64;
  const footerHeight = wordsBoxHeight + bottomBoxHeight;
  const itemTableY = (doc as any).lastAutoTable.finalY || currentY + 180;
  const summaryHeightEstimate = summaryRows.length * 18;
  if (itemTableY + summaryHeightEstimate + footerHeight > pageHeight - marginX) {
    doc.addPage();
    currentY = marginX;
  } else {
    currentY = itemTableY;
  }

  autoTable(doc, {
    startY: currentY,
    body: summaryRows,
    theme: 'grid',
    styles: {
      fontSize: 6.9,
      textColor: [15, 23, 42],
      cellPadding: 1.5,
      lineColor: [148, 163, 184],
      lineWidth: 0.35,
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: contentWidth * 0.48 },
      1: { halign: 'center', cellWidth: contentWidth * 0.14 },
      2: { halign: 'center', cellWidth: contentWidth * 0.14 },
      3: { halign: 'right', cellWidth: contentWidth * 0.24 },
    },
    margin: { left: marginX, right: marginX, bottom: marginX },
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
  });

  currentY = (doc as any).lastAutoTable.finalY || currentY + summaryHeightEstimate;
  if (currentY + footerHeight > pageHeight - marginX) {
    doc.addPage();
    currentY = marginX;
  }

  doc.setFillColor(239, 246, 255);
  doc.rect(marginX, currentY, contentWidth, wordsBoxHeight, 'FD');
  doc.setDrawColor(...slate);
  doc.setLineWidth(0.5);
  doc.rect(marginX, currentY, contentWidth, wordsBoxHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('AMOUNT CHARGEABLE (IN WORDS)', marginX + 7, currentY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.text(amountWordLines, marginX + 7, currentY + 21);

  currentY += wordsBoxHeight;

  // 6. Bottom Split Box: Bank Details & PAN (Left) and Authorized Signatory (Right)
  const leftBottomWidth = contentWidth * 0.65;
  const rightBottomWidth = contentWidth - leftBottomWidth;
  const rightBottomX = marginX + leftBottomWidth;

  doc.setFillColor(249, 250, 251);
  doc.rect(marginX, currentY, contentWidth, bottomBoxHeight, 'F');
  doc.setDrawColor(...slate);
  doc.setLineWidth(0.5);
  doc.rect(marginX, currentY, contentWidth, bottomBoxHeight, 'S');
  doc.line(rightBottomX, currentY, rightBottomX, currentY + bottomBoxHeight);

  // Left Side Content: PAN & Bank Details
  let bY = currentY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  if (invoiceData.seller.pan) {
    doc.text(`COMPANY PAN: ${invoiceData.seller.pan}`, marginX + 7, bY);
    bY += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  if (sellerName) {
    const chequePayeeLines = doc.splitTextToSize(`Cheques payable to "${sellerName}"`, leftBottomWidth - 14);
    doc.text(chequePayeeLines, marginX + 7, bY);
    bY += chequePayeeLines.length * 8 + 2;
  }

  bY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const bankLocation = [invoiceData.seller.bankName, invoiceData.seller.bankBranch].filter(value => value?.trim()).join(', ');
  if (bankLocation) {
    const bankLocationLines = doc.splitTextToSize(bankLocation, leftBottomWidth - 14);
    doc.text(bankLocationLines, marginX + 7, bY);
    bY += bankLocationLines.length * 8 + 1;
  }

  doc.setFont('helvetica', 'bold');
  if (invoiceData.seller.accountNo) {
    doc.text(`A/C NO. ${invoiceData.seller.accountNo}`, marginX + 7, bY);
    bY += 9;
  }

  if (invoiceData.seller.ifscCode) {
    doc.text(`IFSC CODE: ${invoiceData.seller.ifscCode}`, marginX + 7, bY);
  }

  // Right Side Content: Seller name and signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  if (sellerName) {
    const signatoryLines = doc.splitTextToSize(`For ${sellerName}`, rightBottomWidth - 16);
    doc.text(signatoryLines, rightBottomX + rightBottomWidth / 2, currentY + 13, { align: 'center' });
  }

  // Embedded Partner Signature
  if (invoiceData.showSignature !== false && invoiceData.seller.signatureUrl && invoiceData.seller.signatureUrl.startsWith('data:image')) {
    try {
      const imageProperties = doc.getImageProperties(invoiceData.seller.signatureUrl);
      const maxSignatureWidth = Math.min(104, rightBottomWidth - 16);
      const maxSignatureHeight = 34;
      const signatureScale = Math.min(
        maxSignatureWidth / imageProperties.width,
        maxSignatureHeight / imageProperties.height,
      );
      const signatureWidth = imageProperties.width * signatureScale;
      const signatureHeight = imageProperties.height * signatureScale;
      doc.addImage(
        invoiceData.seller.signatureUrl,
        imageProperties.fileType,
        rightBottomX + (rightBottomWidth - signatureWidth) / 2,
        currentY + 19 + (maxSignatureHeight - signatureHeight) / 2,
        signatureWidth,
        signatureHeight,
      );
    } catch (e) {
      console.warn('Could not render signature on PDF:', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('PARTNER', rightBottomX + rightBottomWidth / 2, currentY + bottomBoxHeight - 9, { align: 'center' });

  const pageCount = doc.getNumberOfPages();
  if (pageCount > 1) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...slate);
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      doc.setPage(pageNumber);
      doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - marginX, pageHeight - 12, { align: 'right' });
    }
  }

  return doc;
}

async function createExportPdfDoc(invoiceData: InvoiceData): Promise<jsPDF> {
  return createInvoicePdfDoc(invoiceData);
}

export async function generateInvoicePDF(invoiceData: InvoiceData, openPrintDialog = false): Promise<void> {
  const doc = await createExportPdfDoc(invoiceData);

  // Save / Print
  if (openPrintDialog) {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    doc.save(getInvoicePdfFileName(invoiceData.invoiceNumber));
  }
}

export async function shareInvoicePDF(invoiceData: InvoiceData): Promise<boolean> {
  const doc = await createExportPdfDoc(invoiceData);
  const fileName = getInvoicePdfFileName(invoiceData.invoiceNumber);

  try {
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `GST Tax Invoice ${invoiceData.invoiceNumber}`,
        text: `Tax Invoice ${invoiceData.invoiceNumber} from ${invoiceData.seller.name}`,
        files: [file],
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title: `GST Tax Invoice ${invoiceData.invoiceNumber}`,
        text: `Tax Invoice ${invoiceData.invoiceNumber} from ${invoiceData.seller.name}`,
      });
      return true;
    }
  } catch (err) {
    if ((err as any)?.name !== 'AbortError') {
      console.warn('Web Share failed or cancelled:', err);
    }
  }

  // Default fallback: direct download
  doc.save(fileName);
  return false;
}
