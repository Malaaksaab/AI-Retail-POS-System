# Store Onboarding Guide

## 📋 Complete Checklist for Adding a New Store

This guide walks you through the complete process of onboarding a new retail store into the Multi-Store Retail Management Platform.

## Phase 1: Store Setup (HQ Admin)

### Step 1: Create Store in System

1. **Login to HQ Dashboard** as SUPER_ADMIN
2. Navigate to **Stores** → **Add New Store**
3. Fill in store details:

```json
{
  "code": "STORE001",
  "name": "Downtown Store",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "United States",
  "phone": "+1-555-0123",
  "email": "downtown@retailstore.com",
  "taxRate": 8.875,
  "currency": "USD",
  "timezone": "America/New_York"
}
```

4. Click **Create Store**
5. Note the **Store ID** (needed later)

### Step 2: Configure Store Settings

1. Go to Store Details page
2. Configure:
   - **Operating Hours**
   - **Receipt Format**
   - **Rounding Rules**
   - **Payment Methods** (Cash, Card, Mobile Wallet)
   - **Tax Settings**
   - **Printer Configuration**

### Step 3: Create Store Manager Account

1. Navigate to **Employees** → **Add User**
2. Fill in details:

```json
{
  "email": "manager@store001.com",
  "password": "ChangeThisPassword123!",
  "firstName": "John",
  "lastName": "Manager",
  "phone": "+1-555-0124",
  "role": "ADMIN",
  "storeId": "<store-id-from-step-1>",
  "isActive": true
}
```

3. Send credentials to store manager (via secure channel)

### Step 4: Add Products to Store

**Option A: Add All Products**
1. Go to **Products** → **Assign to Store**
2. Select **Store001**
3. Choose **Select All Products**
4. Click **Assign**

**Option B: Add Specific Products**
1. Go to **Products**
2. Filter by category
3. Select products for this store
4. Click **Assign to Store001**
5. Set store-specific pricing if different from base price

### Step 5: Set Initial Inventory

1. Navigate to **Inventory** → **Store001**
2. For each product, set initial quantity:

```json
{
  "productId": "prod-123",
  "storeId": "store-001",
  "quantity": 100,
  "costPrice": 15.00,
  "batchNumber": "BATCH-2024-001",
  "expiryDate": "2025-12-31" (if applicable)
}
```

3. **Or** use bulk import:
   - Download inventory template
   - Fill in Excel file
   - Upload via **Bulk Import**

## Phase 2: POS Terminal Setup (On-Site)

### Step 6: Install POS Software

**Windows:**
```bash
# Download POS installer
# Run installer.exe
# Follow installation wizard
```

**Web-Based (Recommended):**
```bash
# Navigate to POS URL
https://pos.yourcompany.com

# Or use localhost with Docker
docker pull your-repo/pos-frontend:latest
docker run -p 80:80 your-repo/pos-frontend
```

### Step 7: Configure POS Terminal

1. **First-Time Setup Wizard**
   - Enter HQ API URL: `https://api.yourcompany.com`
   - Enter Store Code: `STORE001`
   - Device Name: `POS-Terminal-1`

2. **Network Configuration**
   - WiFi/Ethernet setup
   - Test connection to HQ
   - Enable offline mode

3. **Peripheral Setup**
   - Connect receipt printer
   - Test print
   - Connect barcode scanner
   - Test scan
   - Connect cash drawer (if using)

### Step 8: Login and Initial Sync

1. **Login** with store manager credentials
2. System will automatically:
   - Download all products
   - Download customer database
   - Sync initial inventory
   - Configure local settings

3. **Verify Data**:
   - Check product count
   - Search for random products
   - Verify prices
   - Check inventory levels

## Phase 3: Staff Training

### Step 9: Train Cashiers

**Opening a Shift:**
```
1. Login to POS
2. Click "Open Shift"
3. Count and enter starting cash
4. Click "Start Shift"
```

**Processing a Sale:**
```
1. Scan or search product
2. Adjust quantity if needed
3. Add all items
4. Click "Checkout"
5. Select payment method
6. Enter amount received
7. Click "Complete Sale"
8. Print receipt
```

**Processing a Return:**
```
1. Click "Returns"
2. Enter original transaction number
3. Scan items to return
4. Select return reason
5. Process refund
6. Print return receipt
```

**Closing a Shift:**
```
1. Click "Close Shift"
2. Count all cash
3. Enter actual cash amount
4. Review discrepancies
5. Confirm shift close
6. Print shift report
```

### Step 10: Train Store Manager

**Daily Tasks:**
- Review sales report
- Check inventory levels
- Handle returns/exchanges
- Manage staff schedules
- Process expenses

**Weekly Tasks:**
- Generate weekly reports
- Order stock from HQ
- Review low-stock items
- Check sync status
- Backup POS data

**Monthly Tasks:**
- Monthly P&L review
- Inventory reconciliation
- Performance analysis
- Staff performance review

## Phase 4: Testing & Go-Live

### Step 11: Test Transactions

**Create Test Transactions:**
1. Process a cash sale
2. Process a card payment
3. Process a split payment
4. Create a return
5. Apply discounts
6. Void a transaction

**Verify:**
- ✅ Receipt prints correctly
- ✅ Inventory reduces
- ✅ Transaction syncs to HQ
- ✅ Sales appear in HQ dashboard
- ✅ Cash drawer opens (if using)

### Step 12: Test Offline Mode

1. Disconnect internet
2. Process several sales
3. Verify they're saved locally
4. Reconnect internet
5. Verify automatic sync
6. Check transactions in HQ

### Step 13: Go-Live Preparation

**Day Before:**
- [ ] All staff trained
- [ ] All equipment tested
- [ ] Initial inventory confirmed
- [ ] Test transactions voided
- [ ] Opening cash prepared
- [ ] Contact numbers posted

**Go-Live Day:**
- [ ] Manager arrives 30 mins early
- [ ] Systems powered on
- [ ] Shift opened with real cash
- [ ] First real transaction monitored
- [ ] Support on standby

## Phase 5: Post-Launch

### Week 1 Checklist

**Daily:**
- [ ] Review sales reports
- [ ] Check sync status
- [ ] Monitor for issues
- [ ] Staff feedback collection

**End of Week:**
- [ ] Reconcile all shifts
- [ ] Review inventory accuracy
- [ ] Generate week 1 report
- [ ] Schedule follow-up training

### Month 1 Checklist

- [ ] Complete inventory audit
- [ ] Review return rate
- [ ] Analyze best sellers
- [ ] Optimize product placement
- [ ] Train additional staff
- [ ] Schedule quarterly review

## 🆘 Common Issues & Solutions

### Issue: POS Won't Connect to HQ

**Solution:**
1. Check internet connection
2. Verify API URL in settings
3. Check firewall rules
4. Test with `ping api.yourcompany.com`
5. Contact IT support

### Issue: Products Not Syncing

**Solution:**
1. Click "Force Sync" button
2. Check sync queue (Dev Tools)
3. Verify products assigned to store
4. Check user permissions
5. Restart POS application

### Issue: Printer Not Working

**Solution:**
1. Check USB connection
2. Verify printer driver installed
3. Test print from Windows
4. Check printer settings in POS
5. Try different USB port

### Issue: Barcode Scanner Not Responding

**Solution:**
1. Check USB connection
2. Test scanner in Notepad (should type)
3. Verify scanner mode (USB HID)
4. Try different USB port
5. Restart POS application

## 📞 Support Contacts

**Technical Support:**
- Email: support@yourcompany.com
- Phone: 1-800-SUPPORT
- Hours: 24/7

**Account Manager:**
- Email: accounts@yourcompany.com
- Phone: 1-800-ACCOUNTS
- Hours: 9 AM - 5 PM EST

## 📚 Additional Resources

- [POS Terminal User Guide](./POS_USER_GUIDE.md)
- [HQ Dashboard Manual](./HQ_MANUAL.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [API Documentation](http://api.yourcompany.com/docs)
- [Video Tutorials](https://training.yourcompany.com)

## ✅ Store Launch Checklist

### Pre-Launch
- [ ] Store created in system
- [ ] Store manager account created
- [ ] Products assigned to store
- [ ] Initial inventory set
- [ ] POS terminal installed
- [ ] Hardware connected and tested
- [ ] Staff trained
- [ ] Test transactions completed
- [ ] Offline mode tested

### Launch Day
- [ ] Systems operational
- [ ] Manager on-site
- [ ] Opening cash counted
- [ ] Shift opened
- [ ] First sale completed
- [ ] Support team notified

### Post-Launch
- [ ] Daily sales review (Week 1)
- [ ] Sync status monitoring
- [ ] Staff feedback collected
- [ ] Issues documented and resolved
- [ ] Month 1 inventory audit scheduled

---

**Congratulations! Your store is now live! 🎉**

For any questions or issues, contact support immediately. We're here to help!
