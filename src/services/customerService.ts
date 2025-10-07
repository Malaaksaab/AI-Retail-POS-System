import { supabase } from '../lib/supabase';
import { Customer } from '../types';

export const customerService = {
  async getAllCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getCustomerById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*, loyalty_transactions(*), customer_anniversaries(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async searchCustomers(searchTerm: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async createCustomer(customer: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        loyalty_points: 0,
        total_purchases: 0,
        tier: 'bronze',
        is_active: true,
        registration_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
        notes: updates.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLoyaltyPoints(customerId: string, points: number, transactionId?: string, description?: string) {
    const customer = await this.getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    const newPoints = customer.loyalty_points + points;

    const { data, error } = await supabase
      .from('customers')
      .update({
        loyalty_points: newPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('loyalty_transactions')
      .insert({
        customer_id: customerId,
        transaction_id: transactionId,
        type: points > 0 ? 'earned' : 'redeemed',
        points: Math.abs(points),
        description: description || (points > 0 ? 'Points earned from purchase' : 'Points redeemed'),
      });

    return data;
  },

  async updateCustomerTier(customerId: string) {
    const customer = await this.getCustomerById(customerId);
    if (!customer) return;

    const { data: tiers } = await supabase
      .from('customer_tiers')
      .select('*')
      .order('min_points', { ascending: false });

    if (!tiers) return;

    const newTier = tiers.find(tier => customer.loyalty_points >= tier.min_points);

    if (newTier && newTier.name !== customer.tier) {
      await supabase
        .from('customers')
        .update({ tier: newTier.name })
        .eq('id', customerId);
    }
  },

  async updateLastVisit(customerId: string) {
    await supabase
      .from('customers')
      .update({ last_visit: new Date().toISOString() })
      .eq('id', customerId);
  },

  async updateTotalPurchases(customerId: string, amount: number) {
    const customer = await this.getCustomerById(customerId);
    if (!customer) return;

    await supabase
      .from('customers')
      .update({
        total_purchases: customer.total_purchases + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId);
  }
};
