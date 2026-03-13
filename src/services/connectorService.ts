import * as XLSX from 'xlsx';

export interface DataConnector {
  id: string;
  name: string;
  type: 'file' | 'database' | 'api';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: string;
  description: string;
  connect(): Promise<void>;
  sync(): Promise<{ lastSyncTime: string; recordsProcessed: number; connectionStatus: string }>;
  disconnect(): Promise<void>;
  getData(): Promise<any>;
}

export class BaseConnector implements DataConnector {
  id: string;
  name: string;
  type: 'file' | 'database' | 'api';
  status: 'connected' | 'disconnected' | 'syncing' | 'error' = 'disconnected';
  lastSync?: string;
  description: string;
  data: any = null;

  constructor(id: string, name: string, type: 'file' | 'database' | 'api', description: string, status: 'connected' | 'disconnected' | 'syncing' | 'error' = 'disconnected', lastSync?: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.description = description;
    this.status = status;
    this.lastSync = lastSync;
  }

  async connect(): Promise<void> {
    this.status = 'syncing';
    try {
      const response = await fetch('/api/connectors/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.id, credentials: { user: 'demo', pass: 'demo' } })
      });
      const data = await response.json();
      if (data.success) {
        this.status = 'connected';
        // Store connection token
        localStorage.setItem(`connector_token_${this.id}`, data.token);
      } else {
        this.status = 'error';
      }
    } catch (err) {
      this.status = 'error';
      throw err;
    }
  }

  async sync(): Promise<{ lastSyncTime: string; recordsProcessed: number; connectionStatus: string }> {
    if (this.status !== 'connected') throw new Error('Not connected');
    this.status = 'syncing';
    try {
      const token = localStorage.getItem(`connector_token_${this.id}`);
      const response = await fetch('/api/connectors/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.id, token })
      });
      const data = await response.json();
      if (data.success) {
        this.lastSync = data.lastSyncTime;
        this.status = 'connected';
        return {
          lastSyncTime: this.lastSync,
          recordsProcessed: data.recordsProcessed,
          connectionStatus: this.status
        };
      } else {
        this.status = 'error';
        throw new Error('Sync failed');
      }
    } catch (err) {
      this.status = 'error';
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected';
    this.data = null;
  }

  async getData(): Promise<any> {
    return this.data;
  }
}

export class ExcelConnector extends BaseConnector {
  constructor(id: string, name: string, description: string) {
    super(id, name, 'file', description, 'connected', 'Just now');
  }

  async parseFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (json.length > 0) {
            this.data = {
              sheetName,
              columns: json[0],
              rows: json.slice(1)
            };
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }
}

export class ConnectorManager {
  private connectors: Map<string, DataConnector> = new Map();

  constructor() {
    // Initialize with default connectors
    this.addConnector(new BaseConnector('1', 'Tally Prime', 'api', 'Accounting & Inventory', 'connected', '10 mins ago'));
    this.addConnector(new BaseConnector('2', 'Shopify', 'api', 'E-commerce Sales', 'connected', '1 hour ago'));
    this.addConnector(new BaseConnector('3', 'PostgreSQL', 'database', 'Internal CRM Database', 'disconnected'));
    this.addConnector(new BaseConnector('4', 'Monthly Sales.xlsx', 'file', 'Manual Excel Upload', 'connected', '2 days ago'));
    this.addConnector(new BaseConnector('5', 'Google Analytics', 'api', 'Website Traffic & Conversions', 'disconnected'));
    this.addConnector(new BaseConnector('6', 'LinkedIn Ads', 'api', 'B2B Marketing & Campaigns', 'disconnected'));
  }

  addConnector(connector: DataConnector) {
    this.connectors.set(connector.id, connector);
  }

  getConnectors(): DataConnector[] {
    return Array.from(this.connectors.values());
  }

  getConnector(id: string): DataConnector | undefined {
    return this.connectors.get(id);
  }
}

export const connectorManager = new ConnectorManager();
