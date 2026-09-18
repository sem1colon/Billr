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
  
  // Exact margins matching reference PDF
  const marginX = 18.72;
  const contentWidth = pageWidth - marginX * 2; // ~557.84 pt
  let currentY = 18.72;

  // 1. Premium top banner with strong contrast and value hierarchy
  const bannerHeight = 28;
  const navy: [number, number, number] = [15, 23, 42];
  const slate: [number, number, number] = [51, 65, 85];
  doc.setFillColor(...navy);
  doc.rect(marginX, currentY, contentWidth, bannerHeight, 'FD');
  doc.setDrawColor(...navy);
  doc.setLineWidth(1);
  doc.rect(marginX, currentY, contentWidth, bannerHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageWidth / 2, currentY + 18, { align: 'center' });

  currentY += bannerHeight;

  // 2. Seller Agency Details Block
  const sellerBlockStartY = currentY;
  const sellerBlockHeight = 100;

  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, sellerBlockStartY, contentWidth, sellerBlockHeight, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate);
  doc.setFontSize(19);
  const sellerNameLines = doc.splitTextToSize(invoiceData.seller.name || 'Business name', contentWidth - 40);
  doc.text(sellerNameLines.slice(0, 2), pageWidth / 2, currentY + 28, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slate);
  const sellerAddressLines = doc.splitTextToSize(invoiceData.seller.address || '', contentWidth - 40);
  doc.text(sellerAddressLines.slice(0, 2), pageWidth / 2, currentY + 44, { align: 'center' });

  doc.text(invoiceData.seller.cityStateZip || '', pageWidth / 2, currentY + 57, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  const partnerLine = `Partner: ${invoiceData.seller.partnerName || '-'}  |  Ph: ${invoiceData.seller.phone || '-'}`;
  doc.text(doc.splitTextToSize(partnerLine, contentWidth - 40).slice(0, 1), pageWidth / 2, currentY + 69, { align: 'center' });

  doc.setFontSize(8.5);
  const gstinPanLine = `GSTIN No : ${invoiceData.seller.gstin}   PAN Number : ${invoiceData.seller.pan}`;
  doc.text(doc.splitTextToSize(gstinPanLine, contentWidth - 40).slice(0, 1), pageWidth / 2, currentY + 84, { align: 'center' });

  // Border around seller block
  doc.setDrawColor(...slate);
  doc.setLineWidth(1);
  doc.rect(marginX, sellerBlockStartY, contentWidth, sellerBlockHeight, 'S');

  currentY += sellerBlockHeight;

  // 3. Three-Column Parties & Meta Details Grid
  // Keep the PDF proportions identical to the 5/4/3 preview grid.
  const partiesBlockStartY = currentY;
  const partiesBlockHeight = 84;
  const col1Width = contentWidth * (5 / 12);
  const col2Width = contentWidth * (4 / 12);
  const col3Width = contentWidth - col1Width - col2Width;

  const col1X = marginX;
  const col2X = marginX + col1Width;
  const col3X = col2X + col2Width;

  // Draw vertical column dividers with stronger visual separation
  doc.setDrawColor(...slate);
  doc.rect(col1X, partiesBlockStartY, col1Width, partiesBlockHeight, 'S');
  doc.rect(col2X, partiesBlockStartY, col2Width, partiesBlockHeight, 'S');
  doc.rect(col3X, partiesBlockStartY, col3Width, partiesBlockHeight, 'S');

  // Col 1 Content: Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BILLED TO', col1X + 6, partiesBlockStartY + 12);

  doc.setFontSize(8.8);
  doc.text(doc.splitTextToSize(invoiceData.buyer.name || 'Buyer', col1Width - 12).slice(0, 1), col1X + 6, partiesBlockStartY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const buyerAddr = `${invoiceData.buyer.address}, ${invoiceData.buyer.cityStateZip}`;
  const splitBuyerAddr = doc.splitTextToSize(buyerAddr, col1Width - 12);
  doc.text(splitBuyerAddr.slice(0, 3), col1X + 6, partiesBlockStartY + 34);

  const buyerAddrEndY = partiesBlockStartY + 34 + Math.min(splitBuyerAddr.length, 3) * 8.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.text(`GSTIN: ${invoiceData.buyer.gstin}`, col1X + 6, Math.min(buyerAddrEndY + 4, partiesBlockStartY + 68));

  // Col 2 Content: Place of Supply
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Place of Supply / Service:', col2X + 6, partiesBlockStartY + 12);

  doc.setFontSize(8);
  doc.text(invoiceData.buyer.name, col2X + 6, partiesBlockStartY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const posText = getInvoicePlaceOfSupply(invoiceData.buyer.name, invoiceData.buyer.placeOfSupply);
  const splitPos = doc.splitTextToSize(posText, col2Width - 12);
  doc.text(splitPos.slice(0, 4), col2X + 6, partiesBlockStartY + 34);

  // Col 3 Content: INVOICE No. and DATE (split horizontally in middle)
  const metaHalfHeight = partiesBlockHeight / 2;
  doc.setDrawColor(...slate);
  doc.line(col3X, partiesBlockStartY + metaHalfHeight, col3X + col3Width, partiesBlockStartY + metaHalfHeight);

  // Top half: Invoice No with compact emphasis panel
  doc.setFillColor(244, 247, 250);
  doc.rect(col3X, partiesBlockStartY, col3Width, metaHalfHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('INVOICE No.', col3X + 6, partiesBlockStartY + 13);
  doc.setFontSize(8.8);
  const invoiceNumberLines = doc.splitTextToSize(invoiceData.invoiceNumber, col3Width - 12);
  doc.text(invoiceNumberLines.slice(0, 2), col3X + 6, partiesBlockStartY + 27);

  // Bottom half: Date
  doc.setFillColor(250, 250, 251);
  doc.rect(col3X, partiesBlockStartY + metaHalfHeight, col3Width, metaHalfHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('DATE', col3X + 6, partiesBlockStartY + metaHalfHeight + 13);
  doc.setFontSize(8.8);
  const invoiceDateLines = doc.splitTextToSize(formatInvoiceDate(invoiceData.invoiceDate), col3Width - 12);
  doc.text(invoiceDateLines.slice(0, 2), col3X + 6, partiesBlockStartY + metaHalfHeight + 27);

  // Keep the metadata labels and values vertically aligned within both cells.
  doc.setDrawColor(...slate);
  doc.setLineWidth(0.5);
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
          styles: { fontStyle: 'bold', fontSize: 7.6, fillColor: [241, 245, 249], textColor: [30, 41, 59], lineColor: [100, 116, 139], lineWidth: 0.5, cellPadding: { top: 4, right: 4, bottom: 4, left: 7 } },
        },
      ]);
    }

    groupItems.forEach(item => {
        const pricingLine = getInvoicePricingMeta(item).replace(/₹/g, 'INR ');
      tableBody.push([
        {
          content: [
            getInvoiceProductName(item),
            getInvoiceItemMeta(item),
            pricingLine,
          ].filter(Boolean).join('\n'),
          styles: { cellPadding: { top: 4, right: 3, bottom: 4, left: 11 }, fontSize: 7.6, lineColor: [203, 203, 203] },
        },
        item.hsnSacCode || '998311',
        formatInvoiceQuantity(item),
        formatPdfAmount(item.commissionAmount),
      ]);
    });
  });

  const { taxableValue, gstAmount, cgstAmount, sgstAmount, grandTotal, igstAmount } = getInvoicePdfExportData(invoiceData);
  const gstRate = invoiceData.gstRate || 0;

  // Summary Rows inside the Table
  tableBody.push([
    {
      content: 'Taxable Value',
      colSpan: 3,
      styles: { fontStyle: 'bold', halign: 'right' },
    },
    {
      content: formatPdfAmount(taxableValue),
      styles: { fontStyle: 'bold', halign: 'right' },
    },
  ]);

  tableBody.push([
    {
          content: `ADD: ${gstLabel(invoiceData.gstType, gstRate)}`,
      colSpan: 3,
      styles: { fontStyle: 'bold', halign: 'right' },
    },
    {
      content: formatPdfAmount(invoiceData.gstType === 'IGST' ? igstAmount : cgstAmount + sgstAmount),
      styles: { fontStyle: 'bold', halign: 'right' },
    },
  ]);

  const { roundOff } = calculateInvoiceTotals(invoiceData);
  if (roundOff !== 0) {
    tableBody.push([
      { content: 'Round Off', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: formatPdfAmount(roundOff), styles: { fontStyle: 'bold', halign: 'right' } },
    ]);
  }

  tableBody.push([
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
      fontSize: 8.4,
      fontStyle: 'bold',
      halign: 'center',
      lineColor: [15, 23, 42],
      lineWidth: 1,
    },
    styles: {
      fontSize: 7.8,
      textColor: [15, 23, 42],
      cellPadding: 4,
      lineColor: [148, 163, 184],
      lineWidth: 0.35,
      valign: 'middle',
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: contentWidth * 0.48, lineWidth: { right: 0.8 } },
      1: { halign: 'center', cellWidth: contentWidth * 0.14 },
      2: { halign: 'center', cellWidth: contentWidth * 0.14 },
      3: { halign: 'right', cellWidth: contentWidth * 0.24 },
    },
    margin: { left: marginX, right: marginX },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY || currentY + 180;
  doc.setDrawColor(...navy);
  doc.setLineWidth(1);
  doc.rect(marginX, currentY, contentWidth, finalTableY - currentY, 'S');
  currentY = finalTableY;

  // 5. Amount in Words Box with stronger emphasis on payable value
  const amountWords = numberToIndianRupees(grandTotal);
  const wordsBoxHeight = 34;

  doc.setFillColor(239, 246, 255);
  doc.rect(marginX, currentY, contentWidth, wordsBoxHeight, 'FD');
  doc.setDrawColor(...slate);
  doc.setLineWidth(0.8);
  doc.rect(marginX, currentY, contentWidth, wordsBoxHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('AMOUNT CHARGEABLE (IN WORDS)', marginX + 7, currentY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  const amountWordLines = doc.splitTextToSize(amountWords, contentWidth - 14);
  doc.text(amountWordLines.slice(0, 2), marginX + 7, currentY + 21);

  currentY += wordsBoxHeight;

  // 6. Bottom Split Box: Bank Details & PAN (Left) and Authorized Signatory (Right)
  const bottomBoxHeight = 76;
  const leftBottomWidth = contentWidth * 0.65;
  const rightBottomWidth = contentWidth - leftBottomWidth;
  const rightBottomX = marginX + leftBottomWidth;

  doc.setFillColor(249, 250, 251);
  doc.rect(marginX, currentY, leftBottomWidth, bottomBoxHeight, 'FD');
  doc.rect(rightBottomX, currentY, rightBottomWidth, bottomBoxHeight, 'FD');
  doc.setDrawColor(...slate);
  doc.rect(marginX, currentY, leftBottomWidth, bottomBoxHeight, 'S');
  doc.rect(rightBottomX, currentY, rightBottomWidth, bottomBoxHeight, 'S');

  // Left Side Content: PAN & Bank Details
  let bY = currentY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text(`COMPANY PAN: ${invoiceData.seller.pan || 'ABXFM3174B'}`, marginX + 7, bY);

  bY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text(`Note: Cheques payable to "${invoiceData.seller.name || 'MURTHY CHEMICAL AGENCIES'}"`, marginX + 7, bY);

  bY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`${invoiceData.seller.bankName || 'HDFC BANK'}, ${invoiceData.seller.bankBranch || 'SANJEVAREDDYNAGAR, HYDERABAD-500038.'}`, marginX + 7, bY);

  bY += 9;
  doc.setFont('helvetica', 'bold');
  doc.text(`A/C NO. ${invoiceData.seller.accountNo || '50200084425696'}`, marginX + 7, bY);

  bY += 9;
  doc.text(`IFSC CODE: ${invoiceData.seller.ifscCode || 'HDFC0000642'}`, marginX + 7, bY);

  // Right Side Content: For MURTHY CHEMICAL AGENCIES & Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text(`For ${invoiceData.seller.name || 'MURTHY CHEMICAL AGENCIES'}`, rightBottomX + rightBottomWidth / 2, currentY + 13, { align: 'center' });

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
