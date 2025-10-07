import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const productService = {
  async getAllProducts(storeId?: string) {
    let query = supabase
      .from('products')
      .select('*, categories(*), suppliers(*), product_variants(*)')
      .eq('is_active', true)
      .order('name');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), suppliers(*), product_variants(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getProductByBarcode(barcode: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), product_variants(*)')
      .eq('barcode', barcode)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  },

  async createProduct(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        barcode: product.barcode,
        category_id: product.category,
        supplier_id: product.supplier,
        price: product.price,
        cost: product.cost,
        stock: product.stock || 0,
        min_stock: product.minStock || 0,
        max_stock: product.maxStock || 100,
        store_id: product.storeId,
        location: product.location,
        image: product.image,
        is_active: true,
        taxable: product.taxable !== false,
        track_stock: product.trackStock !== false,
        sell_by_weight: product.sellByWeight || false,
        age_restricted: product.ageRestricted || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        cost: updates.cost,
        stock: updates.stock,
        min_stock: updates.minStock,
        max_stock: updates.maxStock,
        category_id: updates.category,
        supplier_id: updates.supplier,
        location: updates.location,
        image: updates.image,
        is_active: updates.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async updateStock(productId: string, newStock: number, reason: string, userId: string, storeId: string) {
    const product = await this.getProductById(productId);
    if (!product) throw new Error('Product not found');

    const { data: updatedProduct, error: productError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
      .select()
      .single();

    if (productError) throw productError;

    const { error: adjustmentError } = await supabase
      .from('inventory_adjustments')
      .insert({
        product_id: productId,
        store_id: storeId,
        user_id: userId,
        adjustment_type: newStock > product.stock ? 'increase' : 'decrease',
        quantity_before: product.stock,
        quantity_after: newStock,
        quantity_changed: Math.abs(newStock - product.stock),
        reason,
        status: 'completed',
      });

    if (adjustmentError) throw adjustmentError;

    return updatedProduct;
  },

  async getLowStockProducts(storeId?: string) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .filter('stock', 'lte', supabase.rpc('min_stock'));

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query;
    if (error) {
      const { data: allProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      return (allProducts || []).filter(p => p.stock <= p.min_stock);
    }
    return data || [];
  },

  async searchProducts(searchTerm: string, storeId?: string) {
    let query = supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_active', true);

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    query = query.or(`name.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};
