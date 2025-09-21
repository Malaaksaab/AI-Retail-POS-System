import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Grid,
  List,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Image,
  Upload,
  Save,
  X
} from 'lucide-react';
import { User, Store } from '../types';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  productCount: number;
  subcategories: Category[];
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryManagerProps {
  user: User;
  store: Store | null;
}

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    productCount: 45,
    color: '#3B82F6',
    sortOrder: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    subcategories: [
      {
        id: '1-1',
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        parentId: '1',
        isActive: true,
        productCount: 25,
        color: '#10B981',
        sortOrder: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        subcategories: []
      },
      {
        id: '1-2',
        name: 'Audio',
        description: 'Headphones, speakers, and audio equipment',
        parentId: '1',
        isActive: true,
        productCount: 20,
        color: '#8B5CF6',
        sortOrder: 2,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        subcategories: []
      }
    ]
  },
  {
    id: '2',
    name: 'Clothing',
    description: 'Fashion and apparel',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    productCount: 120,
    color: '#F59E0B',
    sortOrder: 2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    subcategories: [
      {
        id: '2-1',
        name: 'Men\'s Clothing',
        description: 'Clothing for men',
        parentId: '2',
        isActive: true,
        productCount: 60,
        color: '#6366F1',
        sortOrder: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        subcategories: []
      },
      {
        id: '2-2',
        name: 'Women\'s Clothing',
        description: 'Clothing for women',
        parentId: '2',
        isActive: true,
        productCount: 60,
        color: '#EC4899',
        sortOrder: 2,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        subcategories: []
      }
    ]
  },
  {
    id: '3',
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    productCount: 85,
    color: '#059669',
    sortOrder: 3,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    subcategories: []
  }
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({ user, store }) => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1', '2']));
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parentId: '',
    color: '#3B82F6',
    image: ''
  });

  const canViewCategories = hasPermission(user, PERMISSIONS.INVENTORY_VIEW);
  const canAddCategories = hasPermission(user, PERMISSIONS.INVENTORY_ADD);
  const canEditCategories = hasPermission(user, PERMISSIONS.INVENTORY_EDIT);
  const canDeleteCategories = hasPermission(user, PERMISSIONS.INVENTORY_DELETE);

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    if (!canAddCategories) {
      alert('You do not have permission to add categories');
      return;
    }
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    if (!canEditCategories) {
      alert('You do not have permission to edit categories');
      return;
    }
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      parentId: category.parentId || '',
      color: category.color,
      image: category.image || ''
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!canDeleteCategories) {
      alert('You do not have permission to delete categories');
      return;
    }
    
    const confirmed = confirm('Are you sure you want to delete this category? This will also delete all subcategories.');
    if (confirmed) {
      const deleteCategory = (cats: Category[]): Category[] => {
        return cats.filter(cat => cat.id !== categoryId).map(cat => ({
          ...cat,
          subcategories: deleteCategory(cat.subcategories)
        }));
      };
      setCategories(deleteCategory(categories));
      alert('Category deleted successfully');
    }
  };

  const handleSaveCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Category name is required');
      return;
    }

    const categoryData = {
      ...newCategory,
      id: editingCategory?.id || `cat-${Date.now()}`,
      isActive: true,
      productCount: editingCategory?.productCount || 0,
      sortOrder: editingCategory?.sortOrder || categories.length + 1,
      createdAt: editingCategory?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subcategories: editingCategory?.subcategories || []
    };

    if (editingCategory) {
      // Update existing category
      const updateCategory = (cats: Category[]): Category[] => {
        return cats.map(cat => {
          if (cat.id === editingCategory.id) {
            return { ...cat, ...categoryData };
          }
          return {
            ...cat,
            subcategories: updateCategory(cat.subcategories)
          };
        });
      };
      setCategories(updateCategory(categories));
    } else {
      // Add new category
      if (newCategory.parentId) {
        // Add as subcategory
        const addSubcategory = (cats: Category[]): Category[] => {
          return cats.map(cat => {
            if (cat.id === newCategory.parentId) {
              return {
                ...cat,
                subcategories: [...cat.subcategories, categoryData as Category]
              };
            }
            return {
              ...cat,
              subcategories: addSubcategory(cat.subcategories)
            };
          });
        };
        setCategories(addSubcategory(categories));
      } else {
        // Add as main category
        setCategories([...categories, categoryData as Category]);
      }
    }

    setShowAddModal(false);
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', parentId: '', color: '#3B82F6', image: '' });
    alert(editingCategory ? 'Category updated successfully' : 'Category added successfully');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewCategory({ ...newCategory, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderCategoryTree = (cats: Category[], level: number = 0) => {
    return cats.map(category => (
      <div key={category.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50">
          <div className="flex items-center flex-1">
            <button
              onClick={() => toggleExpanded(category.id)}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {category.subcategories.length > 0 ? (
                expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
            
            <div className="flex items-center mr-3">
              {category.subcategories.length > 0 ? (
                expandedCategories.has(category.id) ? (
                  <FolderOpen className="w-5 h-5 text-blue-500" />
                ) : (
                  <Folder className="w-5 h-5 text-blue-500" />
                )
              ) : (
                <Tag className="w-5 h-5" style={{ color: category.color }} />
              )}
            </div>

            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-8 h-8 rounded object-cover mr-3"
              />
            )}

            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {category.productCount} products
                </span>
                {!category.isActive && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{category.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditCategory(category)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expandedCategories.has(category.id) && category.subcategories.length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(category.subcategories, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const renderCategoryGrid = (cats: Category[]) => {
    const allCategories: Category[] = [];
    
    const flattenCategories = (categories: Category[]) => {
      categories.forEach(cat => {
        allCategories.push(cat);
        if (cat.subcategories.length > 0) {
          flattenCategories(cat.subcategories);
        }
      });
    };
    
    flattenCategories(cats);
    
    const filteredCategories = allCategories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-32 object-cover"
              />
            ) : (
              <div 
                className="w-full h-32 flex items-center justify-center"
                style={{ backgroundColor: category.color + '20' }}
              >
                <Tag className="w-12 h-12" style={{ color: category.color }} />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {category.productCount}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-3">{category.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getAllCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.subcategories.length > 0) {
        result.push(...getAllCategories(cat.subcategories));
      }
    });
    return result;
  };

  if (!canViewCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Tag className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600">Organize your products with categories and subcategories</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {canAddCategories && (
            <button
              onClick={handleAddCategory}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{getAllCategories(categories).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Main Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {getAllCategories(categories).reduce((sum, cat) => sum + cat.productCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {getAllCategories(categories).filter(cat => cat.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Categories Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {viewMode === 'list' ? (
          <div className="space-y-2">
            {renderCategoryTree(categories)}
          </div>
        ) : (
          renderCategoryGrid(categories)
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {(showAddModal || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', description: '', parentId: '', color: '#3B82F6', image: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={newCategory.parentId}
                  onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None (Main Category)</option>
                  {getAllCategories(categories).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="category-image"
                  />
                  <label
                    htmlFor="category-image"
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </label>
                  {newCategory.image && (
                    <img
                      src={newCategory.image}
                      alt="Preview"
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveCategory}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingCategory ? 'Update' : 'Create'} Category
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', description: '', parentId: '', color: '#3B82F6', image: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};