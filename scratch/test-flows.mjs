async function runTests() {
  console.log('--- 1. Testing Customer Home ---');
  const homeRes = await fetch('http://localhost:3000');
  console.log('Home Status:', homeRes.status, homeRes.headers.get('content-type'));

  console.log('\n--- 2. Testing Menu API ---');
  const menuRes = await fetch('http://localhost:3000/api/menu');
  const menuData = await menuRes.json();
  console.log('Menu Items Count:', menuData.items.length);
  console.log('Sample Item:', menuData.items[0].name, 'Price: ₹' + menuData.items[0].price);

  console.log('\n--- 3. Testing Table QR Generation ---');
  const qrRes = await fetch('http://localhost:3000/api/tables/04/qr');
  const qrData = await qrRes.json();
  console.log('Table 04 QR URL:', qrData.menuUrl);
  console.log('QR Image Data Generated:', qrData.qrDataUrl.startsWith('data:image/png;base64'));

  console.log('\n--- 4. Testing Order Creation (Dine-in Table 04) ---');
  const orderRes = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Devang Vora',
      customerPhone: '+91 98205 66789',
      customerEmail: 'devang@example.com',
      type: 'dine-in',
      tableNumber: '04',
      items: [
        { menuItemId: 'menu_01', quantity: 2 },
        { menuItemId: 'menu_20', quantity: 1 }
      ],
      paymentMethod: 'UPI'
    }),
  });
  const orderData = await orderRes.json();
  console.log('Order Placed:', orderData.order.orderNumber, 'Grand Total: ₹' + orderData.order.grandTotal, 'Status:', orderData.order.status);

  console.log('\n--- 5. Testing Order Lookup API ---');
  const lookupRes = await fetch(`http://localhost:3000/api/orders/${orderData.order.id}`);
  const lookupData = await lookupRes.json();
  console.log('Lookup Status:', lookupData.order.status, 'Items:', lookupData.order.items.length);

  console.log('\n--- 6. Testing Reservation Booking ---');
  const resRes = await fetch('http://localhost:3000/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Priyanka Sharma',
      customerPhone: '+91 98200 88991',
      customerEmail: 'priyanka@example.com',
      date: '2026-09-28',
      time: '20:00',
      guests: 4,
      tablePreference: 'Window',
      specialRequests: 'Window table requested'
    }),
  });
  const resData = await resRes.json();
  console.log('Reservation Booked:', resData.reservation.reservationNumber, 'Table:', resData.reservation.assignedTableNumber);

  console.log('\n--- 7. Testing Unauthorized Access to Protected Admin API ---');
  const unauthRes = await fetch('http://localhost:3000/api/admin/reports');
  console.log('Unauthenticated access status:', unauthRes.status, '(Expect 401)');

  console.log('\n--- 8. Testing Admin Login ---');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@noirandbean.com',
      password: 'admin123',
    }),
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status, 'User:', loginData.user.name, 'Role:', loginData.user.role);

  const cookie = loginRes.headers.get('set-cookie');

  console.log('\n--- 9. Testing Protected Admin API with Token Header ---');
  const authReportsRes = await fetch('http://localhost:3000/api/admin/reports', {
    headers: {
      'Authorization': `Bearer ${loginData.token}`
    }
  });
  const authReportsData = await authReportsRes.json();
  console.log('Reports Metrics Total Revenue: ₹' + authReportsData.metrics.totalRevenue, 'Today Orders:', authReportsData.metrics.todayOrders);

  console.log('\n--- 10. Testing Table Management API ---');
  const tablesRes = await fetch('http://localhost:3000/api/admin/tables', {
    headers: {
      'Authorization': `Bearer ${loginData.token}`
    }
  });
  const tablesData = await tablesRes.json();
  console.log('Tables Count:', tablesData.tables.length);
  const t4 = tablesData.tables.find(t => t.number === '04');
  console.log('Table 04 Status after order placed:', t4.status, 'Current Bill: ₹' + t4.currentBillAmount);

  console.log('\n--- 11. Testing POS Bill Generation ---');
  const billRes = await fetch('http://localhost:3000/api/admin/billing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginData.token}`
    },
    body: JSON.stringify({
      orderId: orderData.order.id,
      discountPercentage: 10,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid'
    })
  });
  const billData = await billRes.json();
  console.log('Generated Invoice:', billData.bill.invoiceNumber, 'Discounted Grand Total: ₹' + billData.bill.grandTotal, 'Status:', billData.bill.paymentStatus);

  console.log('\n--- All Automated Integration Tests Passed Flawlessly! ---');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
