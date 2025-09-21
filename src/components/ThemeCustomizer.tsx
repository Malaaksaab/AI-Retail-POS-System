import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  Eye, 
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Zap,
  Sparkles
} from 'lucide-react';

interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    size: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

const defaultThemes: Theme[] = [
  {
    name: 'Modern Blue',
    colors: {
      primary: '#2563eb',
      secondary: '#059669',
      accent: '#ea580c',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    }
  },
  {
    name: 'Dark Professional',
    colors: {
      primary: '#6366f1',
      secondary: '#10b981',
      accent: '#f59e0b',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.4)'
    }
  },
  {
    name: 'Warm Sunset',
    colors: {
      primary: '#dc2626',
      secondary: '#ea580c',
      accent: '#f59e0b',
      background: '#fef7f0',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#fed7aa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    }
  },
  {
    name: 'Ocean Breeze',
    colors: {
      primary: '#0891b2',
      secondary: '#059669',
      accent: '#7c3aed',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#bae6fd',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    }
  }
];

interface ThemeCustomizerProps {
  onThemeChange: (theme: Theme) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0]);
  const [customTheme, setCustomTheme] = useState<Theme>(defaultThemes[0]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    onThemeChange(currentTheme);
  }, [currentTheme, onThemeChange]);

  const handleThemeSelect = (theme: Theme) => {
    setCurrentTheme(theme);
    setCustomTheme({ ...theme });
  };

  const handleColorChange = (colorKey: keyof Theme['colors'], value: string) => {
    const updatedTheme = {
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [colorKey]: value
      }
    };
    setCustomTheme(updatedTheme);
    if (isPreviewMode) {
      setCurrentTheme(updatedTheme);
    }
  };

  const handleFontChange = (fontKey: keyof Theme['fonts'], value: string) => {
    const updatedTheme = {
      ...customTheme,
      fonts: {
        ...customTheme.fonts,
        [fontKey]: value
      }
    };
    setCustomTheme(updatedTheme);
    if (isPreviewMode) {
      setCurrentTheme(updatedTheme);
    }
  };

  const applyTheme = () => {
    setCurrentTheme(customTheme);
    setIsPreviewMode(false);
    alert('Theme applied successfully!');
  };

  const resetTheme = () => {
    const defaultTheme = defaultThemes[0];
    setCurrentTheme(defaultTheme);
    setCustomTheme(defaultTheme);
    setIsPreviewMode(false);
  };

  const exportTheme = () => {
    const themeData = JSON.stringify(customTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target?.result as string);
          setCustomTheme(importedTheme);
          alert('Theme imported successfully!');
        } catch (error) {
          alert('Invalid theme file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const togglePreview = () => {
    if (isPreviewMode) {
      setCurrentTheme(customTheme);
      setIsPreviewMode(false);
    } else {
      setCurrentTheme(customTheme);
      setIsPreviewMode(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Theme Customizer</h2>
          <p className="text-gray-600">Customize the appearance of your POS system</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`p-2 ${previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={togglePreview}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isPreviewMode 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Preset Themes
          </h3>
          <div className="space-y-3">
            {defaultThemes.map((theme, index) => (
              <button
                key={index}
                onClick={() => handleThemeSelect(theme)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  currentTheme.name === theme.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{theme.name}</span>
                  {currentTheme.name === theme.name && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.primary }}
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.secondary }}
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.accent }}
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.background }}
                  ></div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".json"
                onChange={importTheme}
                className="hidden"
                id="import-theme"
              />
              <label
                htmlFor="import-theme"
                className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </label>
              <button
                onClick={exportTheme}
                className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Color Customization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Colors
          </h3>
          <div className="space-y-4">
            {Object.entries(customTheme.colors).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof Theme['colors'], e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof Theme['colors'], e.target.value)}
                    className="w-20 text-xs border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography & Spacing */}
        <div className="space-y-6">
          {/* Typography */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Font</label>
                <select
                  value={customTheme.fonts.primary}
                  onChange={(e) => handleFontChange('primary', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Inter, system-ui, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Open Sans, sans-serif">Open Sans</option>
                  <option value="Lato, sans-serif">Lato</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={applyTheme}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Apply Theme
              </button>
              <button
                onClick={resetTheme}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
        <div 
          className={`border border-gray-300 rounded-lg overflow-hidden ${
            previewMode === 'mobile' ? 'max-w-sm mx-auto' :
            previewMode === 'tablet' ? 'max-w-2xl mx-auto' :
            'w-full'
          }`}
          style={{
            backgroundColor: customTheme.colors.background,
            fontFamily: customTheme.fonts.primary
          }}
        >
          {/* Preview Header */}
          <div 
            className="p-4 border-b"
            style={{ 
              backgroundColor: customTheme.colors.surface,
              borderColor: customTheme.colors.border,
              color: customTheme.colors.text
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">POS System Preview</h4>
              <div className="flex space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: customTheme.colors.error }}
                ></div>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: customTheme.colors.warning }}
                ></div>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: customTheme.colors.success }}
                ></div>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: customTheme.colors.surface,
                  border: `1px solid ${customTheme.colors.border}`
                }}
              >
                <div 
                  className="w-8 h-8 rounded-lg mb-2"
                  style={{ backgroundColor: customTheme.colors.primary }}
                ></div>
                <h5 
                  className="font-medium mb-1"
                  style={{ color: customTheme.colors.text }}
                >
                  Sales Today
                </h5>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: customTheme.colors.text }}
                >
                  £1,234.56
                </p>
                <p 
                  className="text-sm"
                  style={{ color: customTheme.colors.textSecondary }}
                >
                  +12.5% from yesterday
                </p>
              </div>

              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: customTheme.colors.surface,
                  border: `1px solid ${customTheme.colors.border}`
                }}
              >
                <div 
                  className="w-8 h-8 rounded-lg mb-2"
                  style={{ backgroundColor: customTheme.colors.secondary }}
                ></div>
                <h5 
                  className="font-medium mb-1"
                  style={{ color: customTheme.colors.text }}
                >
                  Transactions
                </h5>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: customTheme.colors.text }}
                >
                  147
                </p>
                <p 
                  className="text-sm"
                  style={{ color: customTheme.colors.textSecondary }}
                >
                  +8.2% from yesterday
                </p>
              </div>

              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: customTheme.colors.surface,
                  border: `1px solid ${customTheme.colors.border}`
                }}
              >
                <div 
                  className="w-8 h-8 rounded-lg mb-2"
                  style={{ backgroundColor: customTheme.colors.accent }}
                ></div>
                <h5 
                  className="font-medium mb-1"
                  style={{ color: customTheme.colors.text }}
                >
                  Products
                </h5>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: customTheme.colors.text }}
                >
                  1,234
                </p>
                <p 
                  className="text-sm"
                  style={{ color: customTheme.colors.textSecondary }}
                >
                  In stock
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: customTheme.colors.primary }}
              >
                Primary Button
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: customTheme.colors.secondary }}
              >
                Secondary Button
              </button>
              <button 
                className="px-4 py-2 rounded-lg font-medium"
                style={{ 
                  backgroundColor: customTheme.colors.surface,
                  border: `1px solid ${customTheme.colors.border}`,
                  color: customTheme.colors.text
                }}
              >
                Outline Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};