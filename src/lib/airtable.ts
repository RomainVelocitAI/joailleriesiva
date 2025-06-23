import Airtable from 'airtable';

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!);

const table = base(process.env.AIRTABLE_TABLE_NAME!);

export interface OrderRecord {
  id: string;
  fields: {
    Client: string;
    Demande: string;
    'Image 1'?: { url: string }[];
    'Image 2'?: { url: string }[];
    'Image 3'?: { url: string }[];
    'Image 4'?: { url: string }[];
    'Image collection'?: { url: string }[];
    PDF?: { url: string }[];
    email?: string;
    phone?: string;
    'Nom boutique'?: string;
    'Type bijou'?: string;
    'Style recherché'?: string;
    'Matériaux'?: string;
    'Autres précisions'?: string;
    Status?: 'generating' | 'images_ready' | 'pdf_ready' | 'sent';
    'Selected Image'?: number;
    'Created At'?: string;
  };
}

export interface CreateOrderData {
  client: string;
  email: string;
  phone?: string;
  boutique?: string;
  jewelryType: string;
  styleDescription: string;
  materials: string;
  otherNotes?: string;
  demande: string;
}

export class AirtableService {
  static async createOrder(data: CreateOrderData): Promise<OrderRecord> {
    const records = await table.create([
      {
        fields: {
          Client: data.client,
          Demande: data.demande,
          email: data.email,
          phone: data.phone,
          'Nom boutique': data.boutique,
          'Type bijou': data.jewelryType,
          'Style recherché': data.styleDescription,
          'Matériaux': data.materials,
          'Autres précisions': data.otherNotes,
          Status: 'generating',
          'Created At': new Date().toISOString(),
        }
      }
    ]);

    return records[0] as unknown as OrderRecord;
  }

  static async getOrders(): Promise<OrderRecord[]> {
    const records = await table.select({
      sort: [{ field: 'Created At', direction: 'desc' }]
    }).all();

    return records as unknown as OrderRecord[];
  }

  static async getOrder(id: string): Promise<OrderRecord> {
    const record = await table.find(id);
    return record as unknown as OrderRecord;
  }

  static async updateOrder(id: string, fields: Partial<OrderRecord['fields']>): Promise<OrderRecord> {
    const records = await table.update([
      {
        id,
        fields: fields as any
      }
    ]);

    return records[0] as unknown as OrderRecord;
  }

  static async deleteOrder(id: string): Promise<void> {
    await table.destroy([id]);
  }
}

export default AirtableService;