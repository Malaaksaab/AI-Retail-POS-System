# eSaletab to Multi-Store Platform Migration Guide

## 🎯 Migration Overview

This guide provides step-by-step instructions for migrating your data from eSaletab to the Multi-Store Retail Management Platform.

**Important:** After migration, you will **NOT** depend on eSaletab anymore. All data will be in your new platform.

## 📋 Pre-Migration Checklist

Before starting the migration:

- [ ] Backup all eSaletab data
- [ ] Export eSaletab reports for reference
- [ ] Document custom workflows
- [ ] Note any integrations
- [ ] Identify critical data
- [ ] Schedule migration during off-hours
- [ ] Notify staff of downtime

## 🔧 Migration Prerequisites

### 1. Gather eSaletab Credentials

You'll need:
- eSaletab API URL (e.g., `https://api.esaletab.com`)
- API Key (from eSaletab dashboard)
- Username
- Password

### 2. Setup New Platform

```bash
# Ensure the platform is running
docker-compose up -d

# Verify backend is healthy
curl http://localhost:3000/api/v1/health

# Login as SUPER_ADMIN
# You'll use the HQ dashboard for migration
```

## 🚀 Migration Steps

### Step 1: Prepare eSaletab Data

1. **Login to eSaletab**
2. **Export Current Reports** (for verification later)
   - Product list
   - Inventory report
   - Customer list
   - Sales history
3. **Note Custom Fields** (may need manual mapping)
4. **Check Data Quality**
   - Remove duplicate products
   - Update missing information
   - Verify prices

### Step 2: Access Migration Tool

1. **Login to HQ Dashboard** at http://localhost:5173
2. Navigate to **Settings** → **Data Migration**
3. Select **"eSaletab Migration"**

### Step 3: Configure Connection

Enter your eSaletab credentials:

```json
{
  "apiUrl": "https://api.esaletab.com",
  "apiKey": "your-esaletab-api-key",
  "username": "your-esaletab-username",
  "password": "your-esaletab-password"
}
```

Click **"Test Connection"** to verify.

### Step 4: Select Data to Migrate

Choose what to migrate:

- ✅ **Products** (Recommended: Yes)
  - SKU, Barcode, Name, Price, Cost
  - Categories
  - Product descriptions

- ✅ **Inventory** (Recommended: Yes)
  - Current stock levels
  - Batch numbers (if available)
  - Expiry dates (if tracked)

- ✅ **Customers** (Recommended: Yes)
  - Name, Email, Phone
  - Addresses
  - Loyalty points

- ✅ **Suppliers** (Recommended: Yes)
  - Name, Contact info
  - Payment terms

- ⚠️ **Historical Transactions** (Optional)
  - Past sales (read-only, for reports)
  - May take significant time

- ❌ **Active Transactions** (No)
  - Complete these in eSaletab first

### Step 5: Map Fields

The system will auto-map most fields, but verify:

**Products:**
```
eSaletab Field → New Platform Field
----------------------------------------
product_code   → sku
barcode        → barcode
product_name   → name
category_name  → category (create if missing)
selling_price  → basePrice
cost_price     → costPrice
description    → description
active         → isActive
```

**Customers:**
```
eSaletab Field → New Platform Field
----------------------------------------
customer_code  → code
full_name      → firstName + lastName
email          → email
phone          → phone
address        → address
city           → city
points         → loyaltyPoints
```

### Step 6: Run Migration

1. Click **"Start Migration"**
2. Monitor progress bar
3. **Do not close the browser**

Migration time depends on data size:
- 100 products: ~2 minutes
- 1,000 products: ~10 minutes
- 10,000 products: ~1 hour
- 1,000 transactions: ~5 minutes

### Step 7: Review Migration Results

After completion, you'll see:

```
✅ Migration Complete!

Results:
- Products migrated: 1,245 / 1,245
- Categories created: 15
- Customers migrated: 3,456 / 3,460 (4 errors)
- Suppliers migrated: 25 / 25
- Inventory items: 1,245 / 1,245
- Transactions imported: 5,000 / 5,000

Errors:
- Customer "John Doe": Duplicate email
- Customer "Jane Smith": Invalid phone format
- Product "ABC-001": Duplicate barcode
```

### Step 8: Handle Errors

For each error:

1. **Review Error Details**
2. **Fix in eSaletab** or **manually create** in new platform
3. **Re-run migration** for failed items

Common Errors:

**Duplicate Email/Phone:**
```
Solution: Update in eSaletab or merge customers manually
```

**Missing Category:**
```
Solution: Create category first, then migrate product
```

**Invalid Data:**
```
Solution: Clean data in eSaletab, re-export
```

### Step 9: Verify Migrated Data

**Products:**
1. Go to **Products** page
2. Check total count matches
3. Search for random products
4. Verify prices, categories
5. Check images (may need manual upload)

**Inventory:**
1. Go to **Inventory** → Select Store
2. Verify stock levels match
3. Check for negative quantities
4. Verify cost prices

**Customers:**
1. Go to **Customers**
2. Check customer count
3. Search for specific customers
4. Verify contact information
5. Check loyalty points

### Step 10: Post-Migration Configuration

**Product Configuration:**
- [ ] Assign products to stores
- [ ] Set store-specific pricing
- [ ] Configure reorder levels
- [ ] Update product images
- [ ] Set tax rates
- [ ] Enable/disable products as needed

**Store Setup:**
- [ ] Create stores in new platform
- [ ] Configure store settings
- [ ] Set tax rates per store
- [ ] Assign employees
- [ ] Configure printers

**Customer Data:**
- [ ] Verify loyalty point conversion
- [ ] Update customer preferences
- [ ] Set up customer groups
- [ ] Configure notifications

## 🔄 Parallel Running (Optional)

You can run both systems in parallel:

**Week 1-2: Testing**
- Use new platform for test transactions
- Continue using eSaletab for real sales
- Verify sync works correctly
- Train staff on new system

**Week 3-4: Partial Migration**
- Switch one store to new platform
- Keep other stores on eSaletab
- Monitor and fix issues
- Continue training

**Week 5+: Full Migration**
- Switch all stores to new platform
- Decommission eSaletab
- Archive eSaletab data for reference

## 🆘 Troubleshooting

### Migration Fails to Connect

**Check:**
1. eSaletab API URL is correct
2. API key is valid and not expired
3. Firewall allows outbound connections
4. eSaletab service is online

**Solution:**
```bash
# Test connection manually
curl -H "X-API-Key: your-key" https://api.esaletab.com/products

# Check firewall
sudo ufw status

# Check DNS
nslookup api.esaletab.com
```

### Migration Timeout

**Solution:**
1. Reduce batch size in migration settings
2. Migrate in chunks:
   - First: Products & Categories
   - Second: Customers
   - Third: Inventory
   - Last: Historical transactions

### Duplicate Data

**Solution:**
```sql
-- Check for duplicates
SELECT sku, COUNT(*)
FROM products
GROUP BY sku
HAVING COUNT(*) > 1;

-- Remove duplicates (keep first)
DELETE FROM products
WHERE id NOT IN (
  SELECT MIN(id)
  FROM products
  GROUP BY sku
);
```

### Missing Images

**Solution:**
1. Export images from eSaletab
2. Upload via bulk image upload
3. Or use product image URLs

## 📊 Data Mapping Reference

### Product Status Mapping

```
eSaletab    → New Platform
------------------------
Active      → isActive: true
Inactive    → isActive: false
Discontinued → isActive: false
```

### Payment Method Mapping

```
eSaletab    → New Platform
------------------------
Cash        → CASH
Credit Card → CREDIT_CARD
Debit Card  → DEBIT_CARD
Mobile Pay  → MOBILE_WALLET
Bank Transfer → BANK_TRANSFER
```

### Transaction Type Mapping

```
eSaletab    → New Platform
------------------------
Sale        → SALE
Return      → RETURN
Exchange    → EXCHANGE
Void        → VOID
```

## 📁 Manual Data Import (Alternative)

If API migration fails, use CSV import:

### Step 1: Export from eSaletab

```sql
-- Products
SELECT
  product_code as sku,
  barcode,
  product_name as name,
  category_name as category,
  selling_price as price,
  cost_price as cost
FROM products
ORDER BY product_code;
```

Save as: `products_export.csv`

### Step 2: Format for Import

Ensure CSV has headers:
```csv
sku,barcode,name,category,price,cost,isActive
PROD001,123456789,Product Name,Electronics,29.99,20.00,true
```

### Step 3: Import to New Platform

1. Go to **Products** → **Import**
2. Upload `products_export.csv`
3. Map columns
4. Click **Import**

## ✅ Post-Migration Checklist

### Immediate (Day 1)
- [ ] All products accessible
- [ ] Inventory levels correct
- [ ] Customer data verified
- [ ] Test POS transaction
- [ ] Verify sync works
- [ ] Print test receipt

### Week 1
- [ ] Process real sales
- [ ] Handle returns
- [ ] Generate daily reports
- [ ] Compare with eSaletab reports
- [ ] Fix any discrepancies

### Month 1
- [ ] Complete inventory audit
- [ ] Verify financial reports
- [ ] Reconcile all data
- [ ] Archive eSaletab data
- [ ] Cancel eSaletab subscription (if ready)

## 🎓 Training After Migration

**Staff Training Topics:**
1. New POS interface
2. Product search differences
3. New reporting features
4. Customer lookup changes
5. Inventory management
6. Shift opening/closing

**Manager Training:**
1. HQ dashboard navigation
2. Report generation
3. Product management
4. Employee management
5. Store settings
6. Troubleshooting

## 📞 Migration Support

**Need Help?**

- Email: migration@yourcompany.com
- Phone: 1-800-MIGRATE
- Live Chat: Available during business hours
- Emergency: 24/7 hotline for critical issues

## 📚 Additional Resources

- [Platform Complete Guide](./PLATFORM_COMPLETE_GUIDE.md)
- [Store Onboarding Guide](./STORE_ONBOARDING_GUIDE.md)
- [API Documentation](http://localhost:3000/api/v1/docs)
- [Video Tutorials](https://training.yourcompany.com/migration)

---

**Migration Success Tips:**

✅ **Migrate during off-hours**
✅ **Test with sample data first**
✅ **Backup everything**
✅ **Verify before going live**
✅ **Have support ready**
✅ **Train staff thoroughly**

**You're now ready to migrate! Good luck! 🚀**
