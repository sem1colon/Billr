import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData } from '../types';
import { numberToIndianRupees } from './numberToWords';

export function generateInvoicePDF(invoiceData: InvoiceData, openPrintDialog = false): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  let currentY = 14;

  // 1. Top Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('GST TAX INVOICE', pageWidth / 2, currentY, { align: 'center' });

  currentY += 4;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('(ORIGINAL FOR RECIPIENT • RULE 46 OF CGST RULES, 2017)', pageWidth / 2, currentY, { align: 'center' });

  currentY += 5;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // 2. Seller Agency Banner
  currentY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(invoiceData.seller.name, pageWidth / 2, currentY, { align: 'center' });

  currentY += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${invoiceData.seller.address}, ${invoiceData.seller.cityStateZip}`, pageWidth / 2, currentY, { align: 'center' });

  currentY += 3.8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(
    `State: Telangana (36)   |   GSTIN: ${invoiceData.seller.gstin}   |   PAN: ${invoiceData.seller.pan}   |   Phone: ${invoiceData.seller.phone}`,
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  currentY += 3.8;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // 3. Buyer & Invoice Specs Grid
  currentY += 4;
  const gridTopY = currentY;
  const colWidth = (pageWidth - margin * 2 - 4) / 2;
  const boxHeight = 44;

  // Left Box: Buyer
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, gridTopY, colWidth, boxHeight, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, gridTopY, colWidth, boxHeight, 'S');

  let buyerY = gridTopY + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('DETAILS OF RECEIVER / BILLED TO:', margin + 3, buyerY);

  buyerY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(invoiceData.buyer.name || 'PRAJ INDUSTRIES LIMITED', margin + 3, buyerY);

  buyerY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(51, 65, 85);
  const buyerFullAddr = `${invoiceData.buyer.address}, ${invoiceData.buyer.cityStateZip}`;
  const splitBuyerAddr = doc.splitTextToSize(buyerFullAddr, colWidth - 6);
  doc.text(splitBuyerAddr.slice(0, 2), margin + 3, buyerY);

  buyerY += Math.min(splitBuyerAddr.length, 2) * 3.2 + 1;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const gstinPanLine = `GSTIN: ${invoiceData.buyer.gstin || 'N/A'}${invoiceData.buyer.pan ? `   |   PAN: ${invoiceData.buyer.pan}` : ''}`;
  doc.text(gstinPanLine, margin + 3, buyerY);

  if (invoiceData.buyer.placeOfSupply) {
    buyerY += 4.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('PLACE OF SUPPLY / DELIVERY / SERVICE:', margin + 3, buyerY);
    buyerY += 3.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    const posFormatted = invoiceData.buyer.placeOfSupply.replace(/\n/g, ', ');
    const splitPos = doc.splitTextToSize(posFormatted, colWidth - 6);
    doc.text(splitPos.slice(0, 2), margin + 3, buyerY);
  }

  // Right Box: Specs
  const rightBoxX = margin + colWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.rect(rightBoxX, gridTopY, colWidth, boxHeight, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(rightBoxX, gridTopY, colWidth, boxHeight, 'S');

  let specsY = gridTopY + 4.5;
  const renderSpecRow = (label: string, value: string, isBoldVal = true) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, rightBoxX + 3, specsY);
    
    doc.setFont('helvetica', isBoldVal ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, rightBoxX + colWidth - 3, specsY, { align: 'right' });
    specsY += 5.5;
  };

  renderSpecRow('INVOICE No.:', invoiceData.invoiceNumber);
  renderSpecRow('Invoice Date:', invoiceData.invoiceDate);
  renderSpecRow('Place of Supply:', 'Maharashtra (Code: 27)');
  renderSpecRow('Supply Category:', `Inter-State (IGST ${invoiceData.gstRate || 18}%)`);
  renderSpecRow('SAC / Service Code:', '998311 (Agency Services)');
  renderSpecRow('Reverse Charge (RCM):', 'No');

  currentY = gridTopY + boxHeight + 4;

  // 4. Line Items Table (with Quantity, Unit Price, Commission Rate & Amount)
  const tableRows = invoiceData.items.map((item, index) => {
    let desc = item.description;
    if (item.invNo || item.date) {
      desc += `\n(Inv #${item.invNo || ''}${item.date ? ` dt ${item.date}` : ''})`;
    }
    const qtyStr = `${item.qty.toLocaleString()} ${item.unit || 'kg'}`;
    const unitPriceStr = item.unitPrice ? `INR ${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-';
    const commRateStr = item.commissionRate ? `@${item.commissionRate.toFixed(2)}/${item.unit || 'kg'}` : '-';
    const amountStr = item.commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return [
      String(index + 1),
      desc,
      item.hsnSacCode || '998311',
      qtyStr,
      unitPriceStr,
      commRateStr,
      amountStr,
    ];
  });

  const taxableValue = invoiceData.items.reduce((s, i) => s + (i.commissionAmount || 0), 0);
  const gstRate = invoiceData.gstRate || 18;
  const gstAmount = Number(((taxableValue * gstRate) / 100).toFixed(2));
  const grandTotal = Number((taxableValue + gstAmount + (invoiceData.roundOff || 0)).toFixed(2));
  const amountWords = numberToIndianRupees(grandTotal);

  autoTable(doc, {
    startY: currentY,
    head: [[
      '#',
      'Description of Services & Chemical Goods',
      'HSN/SAC',
      'Quantity',
      'Unit Price',
      'Comm. Rate',
      'Amount (INR)',
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'right', cellWidth: 18 },
      4: { halign: 'right', cellWidth: 22 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'right', cellWidth: 25, fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  // Calculate position after table
  const finalY = (doc as any).lastAutoTable.finalY || currentY + 40;
  currentY = finalY + 4;

  // Check if we have enough space for calculations and footer, else add new page
  if (currentY > 230) {
    doc.addPage();
    currentY = 16;
  }

  // 5. Bank Account & Tax Computation Box
  const summaryBoxWidth = colWidth;
  const leftSummaryX = margin;
  const rightSummaryX = margin + colWidth + 4;

  // Left: Bank Details Box
  doc.setFillColor(248, 250, 252);
  doc.rect(leftSummaryX, currentY, summaryBoxWidth, 34, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(leftSummaryX, currentY, summaryBoxWidth, 34, 'S');

  let bankY = currentY + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BANK ACCOUNT DETAILS FOR PAYMENT:', leftSummaryX + 3, bankY);

  bankY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Bank Name: ${invoiceData.seller.bankName}`, leftSummaryX + 3, bankY);
  bankY += 3.5;
  doc.text(`Branch: ${invoiceData.seller.bankBranch}`, leftSummaryX + 3, bankY);
  bankY += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.text(`Current A/C: ${invoiceData.seller.accountNo}`, leftSummaryX + 3, bankY);
  bankY += 3.5;
  doc.text(`IFSC Code: ${invoiceData.seller.ifscCode}`, leftSummaryX + 3, bankY);
  bankY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(invoiceData.seller.notes || 'Payment via Direct Bank Transfer (RTGS / NEFT / IMPS)', leftSummaryX + 3, bankY);

  // Right: Tax Calculation Box
  doc.setFillColor(248, 250, 252);
  doc.rect(rightSummaryX, currentY, summaryBoxWidth, 34, 'F');
  doc.rect(rightSummaryX, currentY, summaryBoxWidth, 34, 'S');

  let calcY = currentY + 5;
  const renderCalcRow = (label: string, amount: number, isGrand = false) => {
    doc.setFont('helvetica', isGrand ? 'bold' : 'normal');
    doc.setFontSize(isGrand ? 9 : 8);
    doc.setTextColor(isGrand ? 15 : 71, isGrand ? 23 : 85, isGrand ? 42 : 105);
    doc.text(label, rightSummaryX + 3, calcY);
    doc.text(`INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, rightSummaryX + summaryBoxWidth - 3, calcY, { align: 'right' });
    calcY += isGrand ? 6 : 5;
  };

  renderCalcRow('Total Taxable Value:', taxableValue);
  renderCalcRow(`Integrated GST (${gstRate}%):`, gstAmount);
  if (invoiceData.roundOff !== 0) {
    renderCalcRow('Round Off:', invoiceData.roundOff);
  }
  doc.setDrawColor(203, 213, 225);
  doc.line(rightSummaryX + 2, calcY - 1, rightSummaryX + summaryBoxWidth - 2, calcY - 1);
  calcY += 1.5;
  renderCalcRow('Grand Total:', grandTotal, true);

  currentY += 38;

  // 6. Amount in Words Box
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - margin * 2, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, pageWidth - margin * 2, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Total Amount in Words: ', margin + 3, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const wordsX = margin + 35;
  doc.text(amountWords, wordsX, currentY + 5);

  currentY += 12;

  // 7. Partner Signature
  const footerY = currentY;

  // Authorized Signatory Right Side
  const sigBoxX = pageWidth - margin - 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${invoiceData.seller.name}`, pageWidth - margin, footerY, { align: 'right' });

  if (invoiceData.seller.signatureUrl && invoiceData.seller.signatureUrl.startsWith('data:image')) {
    try {
      doc.addImage(invoiceData.seller.signatureUrl, 'PNG', sigBoxX + 10, footerY + 2, 40, 13);
    } catch (e) {
      console.warn('Could not embed signature in PDF:', e);
    }
  }

  doc.text('(Partner / Authorised Signatory)', pageWidth - margin, footerY + 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(invoiceData.seller.partnerName, pageWidth - margin, footerY + 21.5, { align: 'right' });

  // Save / Print
  if (openPrintDialog) {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    const cleanNum = invoiceData.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Invoice_${cleanNum}.pdf`);
  }
}
