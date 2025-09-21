import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Globe, 
  Shield, 
  Database,
  Save,
  RefreshCw,
  HardDrive,
  Printer,
  Scan,
  CreditCard,
  Monitor,
  Upload,
  Download
} from 'lucide-react';
import { User, Store, Settings as SettingsType } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface SettingsProps {
  user: User;
  store: Store | null;
}

export const Settings: React.FC<SettingsProps> = ({ user, store }) => {
  const [settings, setSettings] = useState<SettingsType>({
    currency: 'GBP',
    currencySymbol: '£',
    taxRate: 20,
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#059669',
      backgroundColor: '#f8fafc',
      sidebarColor: '#1e293b',
      customBackground: ''
    },
    notifications: {
      lowStock: true,
      newOrders: true,
      systemAlerts: true,
      emailNotifications: true,
      smsNotifications: false
    },
    security: {
      sessionTimeout: 30,
      requirePasswordForRefunds: true,
      requirePasswordForVoids: true,
      enableAuditTrail: true,
      twoFactorAuth: false
    },
    hardware: {
      barcodeScanner: {
        enabled: true,
        type: 'usb',
        model: 'Honeywell Voyager 1200g'
      },
      printer: {
        enabled: true,
        type: 'thermal',
        model: 'Epson TM-T88VI',
        paperSize: 'thermal_80mm'
      },
      cashDrawer: {
        enabled: true,
        type: 'rj11',
        model: 'APG Vasario 1616'
      },
      cardReader: {
        enabled: true,
        type: 'contactless',
        model: 'Ingenico iCT250'
      },
      display: {
        customerDisplay: true,
        touchScreen: true,
        size: '15.6"'
      }
    },
    receipt: {
      header: 'Thank you for shopping with us!',
      footer: 'Please keep your receipt for returns',
      showLogo: true,
      showBarcode: true,
      paperSize: 'thermal_80mm'
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  const canEditSettings = hasPermission(user, PERMISSIONS.SETTINGS_EDIT);
  const canEditSystemSettings = hasPermission(user, PERMISSIONS.SETTINGS_SYSTEM);
  const canEditHardware = hasPermission(user, PERMISSIONS.SETTINGS_HARDWARE);

  const handleSave = () => {
    if (!canEditSettings) {
      alert('You do not have permission to edit settings');
      return;
    }
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  const resetToDefaults = () => {
    if (!canEditSettings) {
      alert('You do not have permission to reset settings');
      return;
    }
    
    setSettings({
      currency: 'GBP',
      currencySymbol: '£',
      taxRate: 20,
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#059669',
        backgroundColor: '#f8fafc',
        sidebarColor: '#1e293b'
      },
      notifications: {
        lowStock: true,
        newOrders: true,
        systemAlerts: true,
        emailNotifications: true,
        smsNotifications: false
      },
      security: {
        sessionTimeout: 30,
        requirePasswordForRefunds: true,
        requirePasswordForVoids: true,
        enableAuditTrail: true,
        twoFactorAuth: false
      },
      hardware: {
        barcodeScanner: {
          enabled: true,
          type: 'usb',
          model: 'Honeywell Voyager 1200g'
        },
        printer: {
          enabled: true,
          type: 'thermal',
          model: 'Epson TM-T88VI',
          paperSize: 'thermal_80mm'
        },
        cashDrawer: {
          enabled: true,
          type: 'rj11',
          model: 'APG Vasario 1616'
        },
        cardReader: {
          enabled: true,
          type: 'contactless',
          model: 'Ingenico iCT250'
        },
        display: {
          customerDisplay: true,
          touchScreen: true,
          size: '15.6"'
        }
      },
      receipt: {
        header: 'Thank you for shopping with us!',
        footer: 'Please keep your receipt for returns',
        showLogo: true,
        showBarcode: true,
        paperSize: 'thermal_80mm'
      }
    });
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundImage(result);
        setSettings({
          ...settings,
          theme: {
            ...settings.theme,
            customBackground: result
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'hardware', label: 'Hardware', icon: HardDrive, requiresPermission: PERMISSIONS.SETTINGS_HARDWARE },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield, requiresPermission: PERMISSIONS.SETTINGS_SYSTEM },
  ].filter(tab => !tab.requiresPermission || hasPermission(user, tab.requiresPermission));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your POS system preferences</p>
        </div>
        {canEditSettings && (
          <div className="flex space-x-3">
            <button
              onClick={resetToDefaults}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({
                        ...settings,
                        currency: e.target.value,
                        currencySymbol: e.target.value === 'GBP' ? '£' : e.target.value === 'USD' ? '$' : '€'
                      })}
                      disabled={!canEditSettings}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="GBP">British Pound (£)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({...settings, taxRate: Number(e.target.value)})}
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={!canEditSettings}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                    <input
                      type="text"
                      defaultValue={store?.name || 'Demo Store'}
                      disabled={!canEditSettings}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Footer</label>
                    <input
                      type="text"
                      value={settings.receipt.footer}
                      onChange={(e) => setSettings({
                        ...settings,
                        receipt: {...settings.receipt, footer: e.target.value}
                      })}
                      disabled={!canEditSettings}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.theme.primaryColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: {...settings.theme, primaryColor: e.target.value}
                        })}
                        disabled={!canEditSettings}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        value={settings.theme.primaryColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: {...settings.theme, primaryColor: e.target.value}
                        })}
                        disabled={!canEditSettings}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.theme.secondaryColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: {...settings.theme, secondaryColor: e.target.value}
                        })}
                        disabled={!canEditSettings}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        value={settings.theme.secondaryColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: {...settings.theme, secondaryColor: e.target.value}
                        })}
                        disabled={!canEditSettings}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Background Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.theme.backgroundColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: {...settings.theme, backgroundColor: e.target.value}
                        })}
                        disabled={!canEditSettings}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        value={settings.theme.backgroundColor}
                        onChange={(e) => setSettings({
                          ...settings,
                          theme: {...settings.theme, backgroundColor: e.target.value}
                        })}
                        disabled={!canEditSettings}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Background Image</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        disabled={!canEditSettings}
                        className="hidden"
                        id="background-upload"
                      />
                      <label
                        htmlFor="background-upload"
                        className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          !canEditSettings ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </label>
                      {backgroundImage && (
                        <button
                          onClick={() => {
                            setBackgroundImage('');
                            setSettings({
                              ...settings,
                              theme: {...settings.theme, customBackground: ''}
                            });
                          }}
                          disabled={!canEditSettings}
                          className="px-3 py-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {backgroundImage && (
                      <div className="mt-3">
                        <img
                          src={backgroundImage}
                          alt="Background preview"
                          className="w-32 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-medium text-xs"
                    style={{ backgroundColor: settings.theme.primaryColor }}
                  >
                    Primary
                  </div>
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-medium text-xs"
                    style={{ backgroundColor: settings.theme.secondaryColor }}
                  >
                    Secondary
                  </div>
                  <div 
                    className="w-16 h-16 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 font-medium text-xs"
                    style={{ 
                      backgroundColor: settings.theme.backgroundColor,
                      backgroundImage: settings.theme.customBackground ? `url(${settings.theme.customBackground})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!settings.theme.customBackground && 'Background'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && canEditHardware && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hardware Configuration</h3>
                
                {/* Barcode Scanner */}
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Scan className="w-5 h-5 text-gray-600 mr-3" />
                      <h4 className="font-medium text-gray-900">Barcode Scanner</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.hardware.barcodeScanner.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          hardware: {
                            ...settings.hardware,
                            barcodeScanner: {...settings.hardware.barcodeScanner, enabled: e.target.checked}
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {settings.hardware.barcodeScanner.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={settings.hardware.barcodeScanner.type}
                          onChange={(e) => setSettings({
                            ...settings,
                            hardware: {
                              ...settings.hardware,
                              barcodeScanner: {...settings.hardware.barcodeScanner, type: e.target.value as any}
                            }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="usb">USB</option>
                          <option value="bluetooth">Bluetooth</option>
                          <option value="integrated">Integrated</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <input
                          type="text"
                          value={settings.hardware.barcodeScanner.model}
                          onChange={(e) => setSettings({
                            ...settings,
                            hardware: {
                              ...settings.hardware,
                              barcodeScanner: {...settings.hardware.barcodeScanner, model: e.target.value}
                            }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Receipt Printer */}
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Printer className="w-5 h-5 text-gray-600 mr-3" />
                      <h4 className="font-medium text-gray-900">Receipt Printer</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.hardware.printer.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          hardware: {
                            ...settings.hardware,
                            printer: {...settings.hardware.printer, enabled: e.target.checked}
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {settings.hardware.printer.enabled && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={settings.hardware.printer.type}
                          onChange={(e) => setSettings({
                            ...settings,
                            hardware: {
                              ...settings.hardware,
                              printer: {...settings.hardware.printer, type: e.target.value as any}
                            }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="thermal">Thermal</option>
                          <option value="inkjet">Inkjet</option>
                          <option value="laser">Laser</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <input
                          type="text"
                          value={settings.hardware.printer.model}
                          onChange={(e) => setSettings({
                            ...settings,
                            hardware: {
                              ...settings.hardware,
                              printer: {...settings.hardware.printer, model: e.target.value}
                            }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
                        <select
                          value={settings.hardware.printer.paperSize}
                          onChange={(e) => setSettings({
                            ...settings,
                            hardware: {
                              ...settings.hardware,
                              printer: {...settings.hardware.printer, paperSize: e.target.value}
                            }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="thermal_58mm">58mm Thermal</option>
                          <option value="thermal_80mm">80mm Thermal</option>
                          <option value="a4">A4</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Reader */}
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                      <h4 className="font-medium text-gray-900">Card Reader</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.hardware.cardReader.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          hardware: {
                            ...settings.hardware,
                            cardReader: {...settings.hardware.cardReader, enabled: e.target.checked}
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {settings.hardware.cardReader.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={settings.hardware.cardReader.type}
                          onChange={(e) => setSettings({
                            ...settings,
                            hardware: {
                              ...settings.hardware,
                              cardReader: {...settings.hardware.cardReader, type: e.target.value as any}
                            }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="chip">Chip & PIN</option>
                          <option value="contactless">Contactless</option>
                          <option value="magnetic">Magnetic Stripe</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <input
                          type="text"
                          value={settings.hardware.cardReader.model}
                          onChange={(e) => setSettings({
                            ...settings,
                            hardware: {
                              ...settings.hardware,
                              cardReader: {...settings.hardware.cardReader, model: e.target.value}
                            }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Display */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Monitor className="w-5 h-5 text-gray-600 mr-3" />
                      <h4 className="font-medium text-gray-900">Customer Display</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.hardware.display.customerDisplay}
                        onChange={(e) => setSettings({
                          ...settings,
                          hardware: {
                            ...settings.hardware,
                            display: {...settings.hardware.display, customerDisplay: e.target.checked}
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {settings.hardware.display.customerDisplay && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Screen Size</label>
                        <input
                          type="text"
                          value={settings.hardware.display.size}
                          onChange={(e) => setSettings({
                            ...settings,
                            hardware: {
                              ...settings.hardware,
                              display: {...settings.hardware.display, size: e.target.value}
                            }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                      <div className="flex items-center space-x-4 pt-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.hardware.display.touchScreen}
                            onChange={(e) => setSettings({
                              ...settings,
                              hardware: {
                                ...settings.hardware,
                                display: {...settings.hardware.display, touchScreen: e.target.checked}
                              }
                            })}
                            className="mr-2"
                          />
                          Touch Screen
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Low Stock Alerts</div>
                      <div className="text-sm text-gray-500">Get notified when products are running low</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.lowStock}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, lowStock: e.target.checked}
                        })}
                        disabled={!canEditSettings}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">New Orders</div>
                      <div className="text-sm text-gray-500">Get notified about new customer orders</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.newOrders}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, newOrders: e.target.checked}
                        })}
                        disabled={!canEditSettings}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">System Alerts</div>
                      <div className="text-sm text-gray-500">Get notified about system updates and issues</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.systemAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, systemAlerts: e.target.checked}
                        })}
                        disabled={!canEditSettings}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-500">Receive notifications via email</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, emailNotifications: e.target.checked}
                        })}
                        disabled={!canEditSettings}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">SMS Notifications</div>
                      <div className="text-sm text-gray-500">Receive notifications via SMS</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, smsNotifications: e.target.checked}
                        })}
                        disabled={!canEditSettings}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && canEditSystemSettings && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {...settings.security, sessionTimeout: Number(e.target.value)}
                      })}
                      min="5"
                      max="480"
                      className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Require Password for Refunds</div>
                      <div className="text-sm text-gray-500">Require manager password for processing refunds</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.requirePasswordForRefunds}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {...settings.security, requirePasswordForRefunds: e.target.checked}
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Require Password for Voids</div>
                      <div className="text-sm text-gray-500">Require manager password for voiding transactions</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.requirePasswordForVoids}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {...settings.security, requirePasswordForVoids: e.target.checked}
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Enable Audit Trail</div>
                      <div className="text-sm text-gray-500">Log all user actions for security auditing</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.enableAuditTrail}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {...settings.security, enableAuditTrail: e.target.checked}
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Enable 2FA for enhanced security</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {...settings.security, twoFactorAuth: e.target.checked}
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};