require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';
const WAIT = 10000;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

describe('Maifah POS System - Full UI Tests', function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  // ─── LOGIN PAGE ───────────────────────────────────────────────────────────

  it('1. Login page shows Maifah logo', async function () {
    await driver.get(`${BASE_URL}/login`);
    await sleep(2000);
    const pageSource = await driver.getPageSource();
    assert.ok(
      pageSource.toLowerCase().includes('maifah'),
      'Logo not found'
    );
    console.log('✅ Maifah logo visible on login page');
  });

  it('2. Login page shows Welcome Back text', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Welcome Back') || body.includes('Sign In'), 'Welcome text not found');
    console.log('✅ Welcome Back text visible');
  });

  it('3. Login page shows Admin demo account button', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Admin'), 'Admin demo button not found');
    console.log('✅ Admin demo button visible');
  });

  it('4. Login page shows Cashier demo account button', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Cashier'), 'Cashier demo button not found');
    console.log('✅ Cashier demo button visible');
  });

  it('5. Admin demo button auto-fills credentials', async function () {
    await driver.get(`${BASE_URL}/login`);
    await sleep(2000);
    const buttons = await driver.findElements(By.css('button'));
    for (const btn of buttons) {
      const text = await btn.getText();
      if (text.includes('Admin')) {
        await btn.click();
        break;
      }
    }
    await sleep(1000);
    const emailInput = await driver.findElement(By.css('input[type="email"], input[type="text"]'));
    const emailValue = await emailInput.getAttribute('value');
    assert.ok(emailValue.includes('admin@maifah.com'), `Expected admin email but got ${emailValue}`);
    console.log('✅ Admin demo button auto-fills credentials');
  });

  // ─── ADMIN LOGIN & DASHBOARD ──────────────────────────────────────────────

  it('6. Admin can login successfully', async function () {
    await driver.get(`${BASE_URL}/login`);
    await sleep(2000);
    const buttons = await driver.findElements(By.css('button'));
    for (const btn of buttons) {
      const text = await btn.getText();
      if (text.includes('Admin')) {
        await btn.click();
        break;
      }
    }
    await sleep(1000);
    const signInBtns = await driver.findElements(By.css('button'));
    for (const btn of signInBtns) {
      const text = await btn.getText();
      if (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login')) {
        await btn.click();
        break;
      }
    }
    await sleep(3000);
    const url = await driver.getCurrentUrl();
    assert.ok(!url.includes('/login'), `Still on login page: ${url}`);
    console.log('✅ Admin login successful');
  });

  it('7. Admin dashboard shows Admin Dashboard title', async function () {
    await sleep(1000);
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Admin Dashboard') || body.includes('Dashboard'), 'Admin Dashboard title not found');
    console.log('✅ Admin Dashboard title visible');
  });

  it('8. Admin dashboard shows Today\'s Revenue', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Revenue') || body.includes('revenue'), 'Revenue not found');
    console.log('✅ Today\'s Revenue visible on admin dashboard');
  });

  it('9. Admin dashboard shows Sales Analytics tab', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Sales Analytics') || body.includes('Analytics'), 'Sales Analytics tab not found');
    console.log('✅ Sales Analytics tab visible');
  });

  it('10. Admin dashboard shows Expenses tab', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Expenses'), 'Expenses tab not found');
    console.log('✅ Expenses tab visible');
  });

  it('11. Admin dashboard shows Supplies tab', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Supplies'), 'Supplies tab not found');
    console.log('✅ Supplies tab visible');
  });

  it('12. Admin dashboard shows Cashiers tab', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Cashiers'), 'Cashiers tab not found');
    console.log('✅ Cashiers tab visible');
  });

  it('13. Admin dashboard shows Users tab', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('Users'), 'Users tab not found');
    console.log('✅ Users tab visible');
  });

  it('14. Supplies tab is accessible and loads', async function () {
    const tabs = await driver.findElements(By.css('button'));
    for (const tab of tabs) {
      const text = await tab.getText();
      if (text.includes('Supplies')) {
        await tab.click();
        break;
      }
    }
    await sleep(2000);
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(
      body.includes('Supplies') || body.includes('Stock') || body.includes('Expiry') || body.includes('Add'),
      'Supplies tab did not load'
    );
    console.log('✅ Supplies tab is accessible and loads');
  });

  // FIXED TEST 15 - Users tab with scroll and JavaScript click
  it('15. Users tab shows User Management', async function () {
    const tabs = await driver.findElements(By.css('button'));
    let usersTab = null;
    
    for (const tab of tabs) {
      const text = await tab.getText();
      if (text.includes('Users')) {
        usersTab = tab;
        break;
      }
    }
    
    if (usersTab) {
      // Scroll to the tab first
      await driver.executeScript("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", usersTab);
      await sleep(500);
      
      // Try JavaScript click if normal click fails
      try {
        await usersTab.click();
      } catch (clickError) {
        console.log('Normal click failed, using JavaScript click...');
        await driver.executeScript("arguments[0].click();", usersTab);
      }
      
      await sleep(2000);
      const body = await driver.findElement(By.css('body')).getText();
      assert.ok(body.includes('User Management') || body.includes('Admin User'), 'User Management not found');
    } else {
      assert.fail('Users tab not found');
    }
    console.log('✅ Users tab shows User Management');
  });

  it('16. Admin logout works', async function () {
    const buttons = await driver.findElements(By.css('button'));
    for (const btn of buttons) {
      const text = await btn.getText();
      if (text === '') {
        const html = await btn.getAttribute('innerHTML');
        if (html.includes('log-out') || html.includes('LogOut') || html.includes('logout')) {
          await btn.click();
          break;
        }
      }
    }
    await sleep(2000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('/login'), `Expected /login but got ${url}`);
    console.log('✅ Admin logout successful');
  });

  // ─── CASHIER LOGIN & DASHBOARD ────────────────────────────────────────────

  it('17. Cashier demo button auto-fills credentials', async function () {
    await driver.get(`${BASE_URL}/login`);
    await sleep(2000);
    const buttons = await driver.findElements(By.css('button'));
    for (const btn of buttons) {
      const text = await btn.getText();
      if (text.includes('Cashier')) {
        await btn.click();
        break;
      }
    }
    await sleep(1000);
    const emailInput = await driver.findElement(By.css('input[type="email"], input[type="text"]'));
    const emailValue = await emailInput.getAttribute('value');
    assert.ok(emailValue.includes('cashier'), `Expected cashier email but got ${emailValue}`);
    console.log('✅ Cashier demo button auto-fills credentials');
  });

  it('18. Cashier can login successfully', async function () {
    const signInBtns = await driver.findElements(By.css('button'));
    for (const btn of signInBtns) {
      const text = await btn.getText();
      if (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login')) {
        await btn.click();
        break;
      }
    }
    await sleep(3000);
    const url = await driver.getCurrentUrl();
    assert.ok(!url.includes('/login'), `Still on login page: ${url}`);
    console.log('✅ Cashier login successful');
  });

  it('19. Cashier dashboard loads successfully', async function () {
    await sleep(2000);
    const url = await driver.getCurrentUrl();
    const pageSource = await driver.getPageSource();
    assert.ok(
      pageSource.toLowerCase().includes('cashier') || 
      pageSource.toLowerCase().includes('pos') ||
      pageSource.toLowerCase().includes('order') ||
      !url.includes('/login'),
      'Cashier dashboard did not load'
    );
    console.log('✅ Cashier dashboard loads successfully');
  });

  it('20. Cashier dashboard does NOT show Expenses tab', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    const tabs = await driver.findElements(By.css('button'));
    let hasExpensesTab = false;
    for (const tab of tabs) {
      const text = await tab.getText();
      if (text === 'Expenses') {
        hasExpensesTab = true;
        break;
      }
    }
    assert.ok(!hasExpensesTab, 'Cashier should NOT have access to Expenses tab');
    console.log('✅ Cashier cannot access Expenses tab');
  });

  it('21. Cashier has POS tab', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(body.includes('POS') || body.includes('Dashboard'), 'POS tab not found for cashier');
    console.log('✅ Cashier has POS tab');
  });

  // ─── POS SCREEN ───────────────────────────────────────────────────────────

  it('22. POS page shows menu items', async function () {
    await driver.get(`${BASE_URL}/pos`);
    await sleep(2000);
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(
      body.includes('Chicken') || body.includes('Pares') || body.includes('Sisig'),
      'Menu items not found on POS'
    );
    console.log('✅ POS shows menu items');
  });

  it('23. POS shows category filters', async function () {
    const body = await driver.findElement(By.css('body')).getText();
    assert.ok(
      body.includes('All') || body.includes('Sulit') || body.includes('Silog'),
      'Category filters not found'
    );
    console.log('✅ POS shows category filters');
  });

  it('24. POS has search bar', async function () {
    const inputs = await driver.findElements(By.css('input'));
    assert.ok(inputs.length > 0, 'Search bar not found');
    console.log('✅ POS has search bar');
  });

  it('25. Search filters menu items', async function () {
    const inputs = await driver.findElements(By.css('input'));
    if (inputs.length > 0) {
      await inputs[0].clear();
      await inputs[0].sendKeys('tapa');
      await sleep(1500);
      const body = await driver.findElement(By.css('body')).getText();
      assert.ok(body.toLowerCase().includes('tapa'), 'Search did not filter correctly');
    }
    console.log('✅ Search filters menu items correctly');
  });
});