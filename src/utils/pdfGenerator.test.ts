import { describe, expect, it } from 'vitest';
import { initialInvoiceData } from '../data/sampleData';
import { InvoiceItem } from '../types';
import { createInvoicePdfDoc } from './pdfGenerator';

function createTestItem(index: number): InvoiceItem {
  return {
    id: `pdf-test-${index}`,
    description: `Long service description ${index} for a recurring commission invoice`,
    hsnSacCode: '998311',
    qty: 10,
    unit: 'kg',
    commissionRate: 16.5,
    commissionAmount: 165,
    invNo: `80008${index}`,
    date: '2026-04-14',
    customer: `Customer Group ${index % 4}`,
  };
}

describe('PDF generation', () => {
  it('wraps long content and paginates large item tables', () => {
    const invoice = {
      ...initialInvoiceData,
      invoiceNumber: 'MCA/2026-27/001',
      seller: {
        ...initialInvoiceData.seller,
        name: 'MURTHY CHEMICAL AGENCIES WITH A LONG REGISTERED BUSINESS NAME',
        address: 'Flat No. 104, Rukmini Apartment, Yousufguda Check Post, Hyderabad, Telangana, India, 500045',
      },
      buyer: {
        ...initialInvoiceData.buyer,
        address: 'Praj Towers, Survey Number 274 and 275/2, Bhumkar Chowk, Hinjewadi Road, Pune',
        placeOfSupply: 'PE Manufacturing Facility, 402/403/1098, At Pirangut, Urawade, Taluka Mulshi, District Pune, Maharashtra',
      },
      items: Array.from({ length: 80 }, (_, index) => createTestItem(index + 1)),
    };

    const doc = createInvoicePdfDoc(invoice);

    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    expect(doc.output('arraybuffer').byteLength).toBeGreaterThan(0);
  });

  it('does not print fabricated bank details when fields are empty', () => {
    const invoice = {
      ...initialInvoiceData,
      seller: {
        ...initialInvoiceData.seller,
        bankName: '',
        bankBranch: '',
        accountNo: '',
        ifscCode: '',
      },
    };

    const pdf = createInvoicePdfDoc(invoice).output();

    expect(pdf).not.toContain('50200084425696');
    expect(pdf).not.toContain('HDFC0000642');
  });

  it('does not print a fabricated seller name when the seller name is empty', () => {
    const invoice = {
      ...initialInvoiceData,
      seller: {
        ...initialInvoiceData.seller,
        name: '',
      },
    };

    const pdf = createInvoicePdfDoc(invoice).output();

    expect(pdf).not.toContain('MURTHY CHEMICAL AGENCIES');
  });
});