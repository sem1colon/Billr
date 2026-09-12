import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { InvoiceData, InvoiceItem } from '../types';
import { numberToIndianRupees } from './numberToWords';

/**
 * Generates an exact match PDF document replicating reference format (Inv.004_121102.pdf)
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

  // 1. Top Shaded Banner: "TAX INVOICE"
  const bannerHeight = 15.6;
  doc.setFillColor(192, 192, 192); // Gray shade (RGB 0.75, 0.75, 0.75)
  doc.rect(marginX, currentY, contentWidth, bannerHeight, 'FD');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(marginX, currentY, contentWidth, bannerHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('TAX INVOICE', pageWidth / 2, currentY + 11.5, { align: 'center' });

  currentY += bannerHeight;

  // 2. Seller Agency Details Block
  const sellerBlockStartY = currentY;
  const sellerBlockHeight = 85;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.seller.name || 'MURTHY CHEMICAL AGENCIES', pageWidth / 2, currentY + 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(invoiceData.seller.address || '104 Rukmini Apartment Yousufguda Check Post', pageWidth / 2, currentY + 36, { align: 'center' });

  const partnerPhone = `${invoiceData.seller.cityStateZip || 'Hyderabad-500045.'} Partner:- ${invoiceData.seller.partnerName || 'R.S.N.MURTHY'} Ph: ${invoiceData.seller.phone || '9849187125'}`;
  doc.text(partnerPhone, pageWidth / 2, currentY + 48, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  const gstinPanLine = `GSTIN No : ${invoiceData.seller.gstin || '36ABXFM3174B1Z1'}   PAN Number : ${invoiceData.seller.pan || 'ABXFM3174B'}`;
  doc.text(gstinPanLine, pageWidth / 2, currentY + 62, { align: 'center' });

  // Border around seller block
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(marginX, sellerBlockStartY, contentWidth, sellerBlockHeight, 'S');

  currentY += sellerBlockHeight;

  // 3. Three-Column Parties & Meta Details Grid
  // Column 1: Billed To (width: ~44%)
  // Column 2: Place of Supply (width: ~36%)
  // Column 3: Invoice No & Date (width: ~20%)
  const partiesBlockStartY = currentY;
  const partiesBlockHeight = 78;
  const col1Width = contentWidth * 0.44;
  const col2Width = contentWidth * 0.36;
  const col3Width = contentWidth - col1Width - col2Width;

  const col1X = marginX;
  const col2X = marginX + col1Width;
  const col3X = col2X + col2Width;

  // Draw vertical column dividers
  doc.rect(col1X, partiesBlockStartY, col1Width, partiesBlockHeight, 'S');
  doc.rect(col2X, partiesBlockStartY, col2Width, partiesBlockHeight, 'S');
  doc.rect(col3X, partiesBlockStartY, col3Width, partiesBlockHeight, 'S');

  // Col 1 Content: Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Billed To:', col1X + 6, partiesBlockStartY + 12);

  doc.setFontSize(8.5);
  doc.text(invoiceData.buyer.name || 'PRAJ INDUSTRIES LIMITED', col1X + 6, partiesBlockStartY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const buyerAddr = `${invoiceData.buyer.address}, ${invoiceData.buyer.cityStateZip}`;
  const splitBuyerAddr = doc.splitTextToSize(buyerAddr, col1Width - 12);
  doc.text(splitBuyerAddr.slice(0, 3), col1X + 6, partiesBlockStartY + 34);

  const buyerAddrEndY = partiesBlockStartY + 34 + Math.min(splitBuyerAddr.length, 3) * 8.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`GSTIN No:- ${invoiceData.buyer.gstin || '27AAACP6090Q1ZS'}`, col1X + 6, Math.min(buyerAddrEndY + 4, partiesBlockStartY + 68));

  // Col 2 Content: Place of Supply
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Place of Supply / Service:', col2X + 6, partiesBlockStartY + 12);

  doc.setFontSize(8);
  doc.text('PRAJ INDUSTRIES LTD', col2X + 6, partiesBlockStartY + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const posText = invoiceData.buyer.placeOfSupply || "PE's Manufacturing, 402/403/1098\nAt Pirangut, Urawade, Tal: Mulshi, Dist: Pune - 412108.";
  const splitPos = doc.splitTextToSize(posText, col2Width - 12);
  doc.text(splitPos, col2X + 6, partiesBlockStartY + 34);

  // Col 3 Content: INVOICE No. and DATE (split horizontally in middle)
  const metaHalfHeight = partiesBlockHeight / 2;
  doc.line(col3X, partiesBlockStartY + metaHalfHeight, col3X + col3Width, partiesBlockStartY + metaHalfHeight);

  // Top half: Invoice No
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('INVOICE No.', col3X + 6, partiesBlockStartY + 13);
  doc.setFontSize(8.5);
  doc.text(invoiceData.invoiceNumber || '004/26-27', col3X + 6, partiesBlockStartY + 27);

  // Bottom half: Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DATE', col3X + 6, partiesBlockStartY + metaHalfHeight + 13);
  doc.setFontSize(8.5);
  doc.text(invoiceData.invoiceDate || '10-Aug-26', col3X + 6, partiesBlockStartY + metaHalfHeight + 27);

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
          content: `Customer : ${custName}`,
          styles: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [0, 0, 0] },
        },
        {
          content: '',
          styles: { fillColor: [245, 245, 245] },
        },
        {
          content: '',
          styles: { fillColor: [245, 245, 245] },
        },
      ]);
    }

    groupItems.forEach(item => {
      // Build standard description string matching reference:
      // "Inv.No. 800086408, dt. 28.01.26, SPIRIZYME ADV ULTI, 360kg, Commission @ 16.5"
      let desc = '';
      if (item.invNo) desc += `Inv. No. ${item.invNo}`;
      if (item.date) desc += `${desc ? ', ' : ''}dt. ${item.date}`;
      
      // Clean product description (remove redundant customer suffix if embedded)
      let prodName = item.description.replace(/\s*\([^)]*\)\s*$/, '').trim();
      if (prodName) desc += `${desc ? ', ' : ''}${prodName}`;
      
      if (item.qty) desc += `, ${item.qty.toLocaleString()}${item.unit || 'kg'}`;
      if (item.commissionRate) desc += `, Commission @ ${item.commissionRate}`;

      const amountFormatted = item.commissionAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      tableBody.push([
        desc || item.description,
        item.hsnSacCode || '998311',
        amountFormatted,
      ]);
    });
  });

  const taxableValue = invoiceData.items.reduce((s, i) => s + (i.commissionAmount || 0), 0);
  const gstRate = invoiceData.gstRate || 18;
  const gstAmount = Number(((taxableValue * gstRate) / 100).toFixed(2));
  const grandTotal = Number((taxableValue + gstAmount + (invoiceData.roundOff || 0)).toFixed(2));

  // Summary Rows inside the Table
  tableBody.push([
    {
      content: 'Taxable Value',
      styles: { fontStyle: 'bold', halign: 'right' },
    },
    '',
    {
      content: taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      styles: { fontStyle: 'bold', halign: 'right' },
    },
  ]);

  tableBody.push([
    {
      content: `ADD: IGST ${gstRate}%`,
      styles: { fontStyle: 'bold', halign: 'right' },
    },
    '',
    {
      content: gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      styles: { fontStyle: 'bold', halign: 'right' },
    },
  ]);

  tableBody.push([
    {
      content: 'Total',
      styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] },
    },
    {
      content: '',
      styles: { fillColor: [240, 240, 240] },
    },
    {
      content: grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] },
    },
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [[
      'Description of Services',
      'HSN/SAC CODE',
      'Amount',
    ]],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [192, 192, 192],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      lineColor: [0, 0, 0],
      lineWidth: 0.8,
    },
    styles: {
      fontSize: 7.5,
      textColor: [0, 0, 0],
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: contentWidth * 0.65 },
      1: { halign: 'center', cellWidth: contentWidth * 0.15 },
      2: { halign: 'right', cellWidth: contentWidth * 0.20 },
    },
    margin: { left: marginX, right: marginX },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY || currentY + 180;
  currentY = finalTableY;

  // 5. Amount in Words Box
  const amountWords = numberToIndianRupees(grandTotal);
  const wordsBoxHeight = 18;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(marginX, currentY, contentWidth, wordsBoxHeight, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Amount Chargeable (in words):', marginX + 6, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(amountWords, marginX + 6, currentY + 14);

  currentY += wordsBoxHeight;

  // 6. Bottom Split Box: Bank Details & PAN (Left) and Authorized Signatory (Right)
  const bottomBoxHeight = 68;
  const leftBottomWidth = contentWidth * 0.65;
  const rightBottomWidth = contentWidth - leftBottomWidth;
  const rightBottomX = marginX + leftBottomWidth;

  doc.rect(marginX, currentY, leftBottomWidth, bottomBoxHeight, 'S');
  doc.rect(rightBottomX, currentY, rightBottomWidth, bottomBoxHeight, 'S');

  // Left Side Content: PAN & Bank Details
  let bY = currentY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`Company's PAN : ${invoiceData.seller.pan || 'ABXFM3174B'}`, marginX + 6, bY);

  bY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(`Note:- Please make cheques in favor of "${invoiceData.seller.name || 'MURTHY CHEMICAL AGENCIES'}"`, marginX + 6, bY);

  bY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`${invoiceData.seller.bankName || 'HDFC BANK'}, ${invoiceData.seller.bankBranch || 'SANJEVAREDDYNAGAR, HYDERABAD-500038.'}`, marginX + 6, bY);

  bY += 9;
  doc.setFont('helvetica', 'bold');
  doc.text(`A/C NO. ${invoiceData.seller.accountNo || '50200084425696'}`, marginX + 6, bY);

  bY += 9;
  doc.text(`ISFC CODE: ${invoiceData.seller.ifscCode || 'HDFC0000642'}`, marginX + 6, bY);

  // Right Side Content: For MURTHY CHEMICAL AGENCIES & Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`For ${invoiceData.seller.name || 'MURTHY CHEMICAL AGENCIES'}`, rightBottomX + rightBottomWidth - 6, currentY + 12, { align: 'right' });

  // Embedded Partner Signature
  if (invoiceData.seller.signatureUrl && invoiceData.seller.signatureUrl.startsWith('data:image')) {
    try {
      doc.addImage(
        invoiceData.seller.signatureUrl,
        'PNG',
        rightBottomX + (rightBottomWidth - 80) / 2,
        currentY + 16,
        80,
        28
      );
    } catch (e) {
      console.warn('Could not render signature on PDF:', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Partner', rightBottomX + rightBottomWidth - 6, currentY + bottomBoxHeight - 8, { align: 'right' });

  return doc;
}

export function generateInvoicePDF(invoiceData: InvoiceData, openPrintDialog = false): void {
  const doc = createInvoicePdfDoc(invoiceData);

  // Save / Print
  if (openPrintDialog) {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    const cleanNum = (invoiceData.invoiceNumber || 'Invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Invoice_${cleanNum}.pdf`);
  }
}

export async function shareInvoicePDF(invoiceData: InvoiceData): Promise<boolean> {
  const doc = createInvoicePdfDoc(invoiceData);
  const cleanNum = (invoiceData.invoiceNumber || 'Invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Invoice_${cleanNum}.pdf`;

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
