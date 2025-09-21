import { HardwareStatus, HardwareConfig } from '../types';

export class HardwareManager {
  private static instance: HardwareManager;
  private hardwareStatus: Map<string, HardwareStatus> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  static getInstance(): HardwareManager {
    if (!HardwareManager.instance) {
      HardwareManager.instance = new HardwareManager();
    }
    return HardwareManager.instance;
  }

  // Barcode Scanner
  async initializeBarcodeScanner(config: HardwareConfig['barcodeScanner']): Promise<boolean> {
    try {
      if (!config.enabled) return false;
      
      // Simulate hardware initialization
      console.log(`Initializing ${config.type} barcode scanner: ${config.model}`);
      
      // Listen for barcode scan events
      this.setupBarcodeListener();
      
      this.updateHardwareStatus('barcodeScanner', 'connected');
      return true;
    } catch (error) {
      console.error('Failed to initialize barcode scanner:', error);
      this.updateHardwareStatus('barcodeScanner', 'error', error.message);
      return false;
    }
  }

  private setupBarcodeListener() {
    // Simulate barcode scanning with keyboard input
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    document.addEventListener('keydown', (event) => {
      const currentTime = Date.now();
      
      // If more than 100ms between keystrokes, reset buffer
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      
      lastKeyTime = currentTime;
      
      if (event.key === 'Enter' && barcodeBuffer.length > 0) {
        // Barcode scan complete
        this.emitEvent('barcodeScan', barcodeBuffer);
        barcodeBuffer = '';
        event.preventDefault();
      } else if (event.key.length === 1) {
        // Add character to buffer
        barcodeBuffer += event.key;
      }
    });
  }

  // Receipt Printer
  async printReceipt(receiptData: any, config: HardwareConfig['printer']): Promise<boolean> {
    try {
      if (!config.enabled) {
        console.log('Printer not enabled, showing print preview');
        this.showPrintPreview(receiptData);
        return true;
      }

      console.log(`Printing receipt on ${config.type} printer: ${config.model}`);
      
      // Simulate printing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would send data to the printer
      this.formatReceiptForPrinter(receiptData, config);
      
      this.updateHardwareStatus('printer', 'connected');
      this.emitEvent('receiptPrinted', receiptData);
      
      return true;
    } catch (error) {
      console.error('Failed to print receipt:', error);
      this.updateHardwareStatus('printer', 'error', error.message);
      return false;
    }
  }

  private formatReceiptForPrinter(receiptData: any, config: HardwareConfig['printer']) {
    const receipt = this.generateReceiptText(receiptData);
    console.log('Receipt Output:', receipt);
    
    // Show receipt in a modal for demonstration
    this.showReceiptModal(receipt);
  }

  private generateReceiptText(data: any): string {
    const { transaction, store } = data;
    let receipt = '';
    
    receipt += '================================\n';
    receipt += `${store?.name || 'RetailPOS Store'}\n`;
    receipt += `${store?.address || '123 Main Street'}\n`;
    receipt += `${store?.phone || '(555) 123-4567'}\n`;
    receipt += '================================\n';
    receipt += `Receipt #: ${transaction.receiptNumber}\n`;
    receipt += `Date: ${new Date(transaction.date).toLocaleString()}\n`;
    receipt += `Cashier: ${transaction.cashierName}\n`;
    if (transaction.customerName) {
      receipt += `Customer: ${transaction.customerName}\n`;
    }
    receipt += '--------------------------------\n';
    
    transaction.items.forEach((item: any) => {
      receipt += `${item.productName}\n`;
      receipt += `  ${item.quantity} x £${item.price.toFixed(2)} = £${item.total.toFixed(2)}\n`;
    });
    
    receipt += '--------------------------------\n';
    receipt += `Subtotal: £${transaction.subtotal.toFixed(2)}\n`;
    if (transaction.discount > 0) {
      receipt += `Discount: -£${transaction.discount.toFixed(2)}\n`;
    }
    receipt += `VAT (20%): £${transaction.tax.toFixed(2)}\n`;
    receipt += `TOTAL: £${transaction.total.toFixed(2)}\n`;
    receipt += '--------------------------------\n';
    receipt += `Payment: ${transaction.paymentMethod.toUpperCase()}\n`;
    if (transaction.change && transaction.change > 0) {
      receipt += `Change: £${transaction.change.toFixed(2)}\n`;
    }
    receipt += '================================\n';
    receipt += 'Thank you for your business!\n';
    receipt += '================================\n';
    
    return receipt;
  }

  private showReceiptModal(receiptText: string) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    content.innerHTML = `
      <h3 style="margin-top: 0;">Receipt Printed</h3>
      <pre style="font-family: monospace; font-size: 12px; white-space: pre-wrap;">${receiptText}</pre>
      <button onclick="this.closest('.modal').remove()" style="margin-top: 15px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    `;
    
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 10000);
  }

  private showPrintPreview(receiptData: any) {
    const receiptText = this.generateReceiptText(receiptData);
    this.showReceiptModal(receiptText);
  }

  // Cash Drawer
  async openCashDrawer(config: HardwareConfig['cashDrawer']): Promise<boolean> {
    try {
      if (!config.enabled) {
        console.log('Cash drawer not enabled');
        return false;
      }

      console.log(`Opening ${config.type} cash drawer: ${config.model}`);
      
      // Simulate cash drawer opening
      this.emitEvent('cashDrawerOpened', {});
      this.updateHardwareStatus('cashDrawer', 'connected');
      
      // Show notification
      this.showNotification('Cash drawer opened', 'success');
      
      return true;
    } catch (error) {
      console.error('Failed to open cash drawer:', error);
      this.updateHardwareStatus('cashDrawer', 'error', error.message);
      return false;
    }
  }

  // Card Reader
  async processCardPayment(amount: number, config: HardwareConfig['cardReader']): Promise<{success: boolean, transactionId?: string, error?: string}> {
    try {
      if (!config.enabled) {
        return { success: false, error: 'Card reader not enabled' };
      }

      console.log(`Processing £${amount} payment on ${config.type} card reader: ${config.model}`);
      
      // Simulate card payment processing
      this.showNotification('Please insert or tap your card', 'info');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const transactionId = `TXN${Date.now()}`;
      
      this.updateHardwareStatus('cardReader', 'connected');
      this.emitEvent('cardPaymentProcessed', { amount, transactionId });
      
      this.showNotification('Payment approved', 'success');
      
      return { success: true, transactionId };
    } catch (error) {
      console.error('Card payment failed:', error);
      this.updateHardwareStatus('cardReader', 'error', error.message);
      return { success: false, error: error.message };
    }
  }

  // Event Management
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Hardware Status Management
  private updateHardwareStatus(device: string, status: HardwareStatus['status'], errorMessage?: string) {
    this.hardwareStatus.set(device, {
      device,
      status,
      lastChecked: new Date().toISOString(),
      errorMessage
    });
  }

  getHardwareStatus(device: string): HardwareStatus | undefined {
    return this.hardwareStatus.get(device);
  }

  getAllHardwareStatus(): HardwareStatus[] {
    return Array.from(this.hardwareStatus.values());
  }

  // Utility Methods
  private showNotification(message: string, type: 'info' | 'success' | 'error') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  // Initialize all hardware
  async initializeAllHardware(config: HardwareConfig): Promise<void> {
    await this.initializeBarcodeScanner(config.barcodeScanner);
    
    // Initialize other hardware components
    this.updateHardwareStatus('printer', config.printer.enabled ? 'connected' : 'disconnected');
    this.updateHardwareStatus('cashDrawer', config.cashDrawer.enabled ? 'connected' : 'disconnected');
    this.updateHardwareStatus('cardReader', config.cardReader.enabled ? 'connected' : 'disconnected');
  }
}

export const hardwareManager = HardwareManager.getInstance();