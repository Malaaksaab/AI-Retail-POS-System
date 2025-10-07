# 🔐 LOGIN GUIDE

## **How to Access Your POS System**

---

## ✅ **DEMO ACCOUNTS - READY TO USE**

You can now login immediately with these demo accounts:

### **1. Admin Account** (Full Access)
- **Email**: `admin@retailpos.com`
- **Password**: `admin123`
- **Access**: All modules, all stores, all features

### **2. Manager Account** (Store Management)
- **Email**: `manager@retailpos.com`
- **Password**: `manager123`
- **Access**: Store management, reports, inventory, customers

### **3. Cashier Account** (Point of Sale)
- **Email**: `cashier@retailpos.com`
- **Password**: `cashier123`
- **Access**: POS terminal, customers, view-only reports

---

## 🚀 **HOW TO LOGIN**

### **Method 1: Quick Demo Login (Recommended)**
1. Open the app: `npm run dev`
2. On the login screen, you'll see **"Demo Accounts"** section
3. Click on any of the three demo account buttons:
   - **Admin** - Full system access
   - **Manager** - Store management
   - **Cashier** - POS operations
4. You're automatically logged in!

### **Method 2: Manual Login**
1. Type the email: `admin@retailpos.com`
2. Type the password: `admin123`
3. Click "Sign In"
4. You're in!

---

## 🎯 **WHAT HAPPENS ON FIRST LOGIN**

When you login for the first time, the system automatically:
- ✅ Creates demo stores (Downtown Store, Mall Location, Westside Branch)
- ✅ Creates demo products (Wireless Mouse, Cotton T-Shirt, Coffee Beans)
- ✅ Creates demo customers (John Doe, Jane Smith)
- ✅ Creates demo categories (Electronics, Clothing, Food & Beverages)
- ✅ Creates demo suppliers (Tech Solutions Inc, Fashion Distributors)

**You can immediately start:**
- Making sales through POS
- Adding your own products
- Managing inventory
- Creating invoices
- Recording payments
- Viewing reports

---

## 🔒 **AUTHENTICATION SYSTEM**

### **Demo Mode (Default)**
- Uses local credentials for quick access
- No Supabase Auth account needed
- Perfect for testing and evaluation
- All features work exactly the same

### **Production Mode**
To use real Supabase authentication:
1. Create user accounts in your Supabase project
2. The system will automatically detect real users
3. Use the same login screen with your real credentials

---

## 🛡️ **ROLE-BASED ACCESS**

### **What Each Role Can Do:**

| Feature | Admin | Manager | Cashier |
|---------|-------|---------|---------|
| Dashboard | ✅ Full | ✅ Store Stats | ✅ Basic Stats |
| POS Terminal | ✅ | ✅ | ✅ |
| Inventory | ✅ Full CRUD | ✅ Full CRUD | 👁️ View Only |
| Customers | ✅ | ✅ | ✅ |
| Invoices | ✅ | ✅ | 👁️ View Only |
| Payments | ✅ | ✅ | 👁️ View Only |
| Reports | ✅ All Reports | ✅ Store Reports | 👁️ Limited |
| Store Manager | ✅ | 👁️ View Only | ❌ No Access |
| User Manager | ✅ | ❌ | ❌ |
| Suppliers | ✅ | ✅ | ❌ |
| Categories | ✅ | ✅ | ❌ |
| Settings | ✅ | ⚙️ Limited | ❌ |

---

## 🔧 **TROUBLESHOOTING**

### **Can't Login?**
1. **Clear browser cache** and refresh
2. Make sure you're using one of the demo credentials
3. Check console for error messages (F12)
4. Try the demo button instead of typing credentials

### **No Data Showing?**
1. The system auto-initializes on first login
2. Wait a moment for data to load
3. Refresh the page
4. Check your Supabase connection in `.env`

### **Store Not Selected?**
- After login, a store is automatically selected
- Use the store dropdown in the header to change stores
- Admin users can switch between all stores

---

## 🎯 **NEXT STEPS AFTER LOGIN**

### **For Admin Users:**
1. ✅ Review the dashboard
2. ✅ Check all demo stores
3. ✅ Add your real stores
4. ✅ Add your real products
5. ✅ Create user accounts for staff
6. ✅ Configure settings and tax rates

### **For Manager Users:**
1. ✅ View your store dashboard
2. ✅ Check inventory levels
3. ✅ Add products
4. ✅ Manage customers
5. ✅ View sales reports

### **For Cashier Users:**
1. ✅ Open POS Terminal
2. ✅ Start making sales
3. ✅ Add customers
4. ✅ Process payments

---

## 🔐 **SECURITY NOTES**

- ✅ Demo passwords are for testing only
- ✅ Change passwords in production
- ✅ All data is stored securely in Supabase
- ✅ Row-level security enforced
- ✅ Users only see their store's data
- ✅ Passwords are never stored in plain text

---

## 🚀 **YOU'RE READY!**

Simply run:
```bash
npm run dev
```

Then click any demo account button to login instantly!

**No setup needed. No configuration required. Just login and start using!** 🎉
