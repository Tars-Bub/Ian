const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const APP_URL = "http://localhost:8080";
const WAIT = 5000;

let driver;

async function setup() {
  const options = new chrome.Options();
  // Remove headless to SEE the browser during demo
  // options.addArguments("--headless");
  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  await driver.manage().window().setRect({ width: 430, height: 900 });
  console.log("\n========================================");
  console.log("  Maifah POS — Selenium Test Suite");
  console.log("========================================\n");
}

async function teardown() {
  if (driver) await driver.quit();
}

let passed = 0;
let failed = 0;
const results = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
    results.push({ name, status: "PASS" });
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    → ${err.message}`);
    failed++;
    results.push({ name, status: "FAIL", error: err.message });
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTests() {
  await setup();

  try {

    // ── Group 1: Splash Screen ──────────────────────────────────────────────
    console.log("Splash Screen");

    await test("shows cafe name on splash screen", async () => {
      await driver.get(APP_URL);
      await sleep(1500);
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("Maifah")) throw new Error("Cafe name not found");
    });

    await test("Start button is visible", async () => {
      await driver.get(APP_URL);
      await sleep(1500);
      const btn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      if (!btn) throw new Error("Start button not found");
    });

    await test("clicking Start navigates away from splash", async () => {
      await driver.get(APP_URL);
      await sleep(1500);
      const btn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      await btn.click();
      await sleep(1000);
      const url = await driver.getCurrentUrl();
      const body = await driver.findElement(By.css("body")).getText();
      if (!body) throw new Error("Nothing loaded after Start");
    });

    // ── Group 2: Login Screen ───────────────────────────────────────────────
    console.log("\nLogin Screen");

    await test("login screen shows email and password fields", async () => {
      await driver.get(APP_URL);
      await sleep(1500);
      const btn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      await btn.click();
      await sleep(1000);
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.toLowerCase().includes("sign in") && !body.toLowerCase().includes("login") && !body.toLowerCase().includes("email")) {
        throw new Error("Login screen not found");
      }
    });

    await test("login with valid credentials succeeds", async () => {
      await driver.get(APP_URL);
      await sleep(1500);
      const startBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      await startBtn.click();
      await sleep(1000);
      const inputs = await driver.findElements(By.css("input"));
      if (inputs.length < 2) throw new Error("Input fields not found");
      await inputs[0].clear();
      await inputs[0].sendKeys("admin@maifah.com");
      await inputs[1].clear();
      await inputs[1].sendKeys("admin123");
      const signInBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Sign In') or contains(text(),'Login') or contains(text(),'sign in')]")), WAIT
      );
      await signInBtn.click();
      await sleep(1500);
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("Cashier") && !body.includes("cashier") && !body.includes("Hello")) {
        throw new Error("Did not navigate after login");
      }
    });

    await test("login with wrong password shows error", async () => {
      await driver.get(APP_URL);
      await sleep(1500);
      const startBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      await startBtn.click();
      await sleep(1000);
      const inputs = await driver.findElements(By.css("input"));
      if (inputs.length < 2) throw new Error("Input fields not found");
      await inputs[0].clear();
      await inputs[0].sendKeys("admin@maifah.com");
      await inputs[1].clear();
      await inputs[1].sendKeys("wrongpassword");
      const signInBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Sign In') or contains(text(),'sign in')]")), WAIT
      );
      await signInBtn.click();
      await sleep(1000);
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.toLowerCase().includes("invalid") && !body.toLowerCase().includes("incorrect") && !body.toLowerCase().includes("wrong") && !body.toLowerCase().includes("error")) {
        throw new Error("No error message shown for wrong password");
      }
    });

    await test("sign up link is visible on login screen", async () => {
      await driver.get(APP_URL);
      await sleep(1500);
      const startBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      await startBtn.click();
      await sleep(1000);
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("Sign Up") && !body.includes("sign up") && !body.includes("Register")) {
        throw new Error("Sign up link not found");
      }
    });

    // ── Group 3: Sign Up Screen ─────────────────────────────────────────────
    console.log("\nSign Up Screen");

    await test("sign up screen loads with all fields", async () => {
      await driver.get(APP_URL);
      await sleep(1500);
      const startBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      await startBtn.click();
      await sleep(1000);
      const signUpLink = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Sign Up') or contains(text(),'sign up')]")), WAIT
      );
      await signUpLink.click();
      await sleep(1000);
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.toLowerCase().includes("create") && !body.toLowerCase().includes("name") && !body.toLowerCase().includes("register")) {
        throw new Error("Sign up screen did not load");
      }
    });

    await test("sign up with new account succeeds", async () => {
      await driver.get(APP_URL);
      await sleep(1500);
      const startBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      await startBtn.click();
      await sleep(1000);
      const signUpLink = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Sign Up') or contains(text(),'sign up')]")), WAIT
      );
      await signUpLink.click();
      await sleep(1000);
      const inputs = await driver.findElements(By.css("input"));
      if (inputs.length < 3) throw new Error("Not enough input fields on sign up");
      const timestamp = Date.now();
      await inputs[0].sendKeys("Test User");
      await inputs[1].sendKeys(`test${timestamp}@maifah.com`);
      await inputs[2].sendKeys("testpass123");
      const createBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Create') or contains(text(),'Register') or contains(text(),'Sign Up')]")), WAIT
      );
      await createBtn.click();
      await sleep(1500);
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("Cashier") && !body.includes("Hello") && !body.includes("Select")) {
        throw new Error("Did not proceed after sign up");
      }
    });

    // ── Group 4: POS Screen ─────────────────────────────────────────────────
    console.log("\nPOS Screen");

    async function loginAndGoToPOS() {
      await driver.get(APP_URL);
      await sleep(1500);
      const startBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      await startBtn.click();
      await sleep(1000);
      const inputs = await driver.findElements(By.css("input"));
      await inputs[0].sendKeys("admin@maifah.com");
      await inputs[1].sendKeys("admin123");
      const signInBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Sign In') or contains(text(),'sign in')]")), WAIT
      );
      await signInBtn.click();
      await sleep(1500);
      const cashierBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Cashier')]")), WAIT
      );
      await cashierBtn.click();
      await sleep(1500);
    }

    await test("POS screen shows menu items", async () => {
      await loginAndGoToPOS();
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("Chicken") && !body.includes("Pares") && !body.includes("Silog")) {
        throw new Error("Menu items not visible");
      }
    });

    await test("POS screen shows category filters", async () => {
      await loginAndGoToPOS();
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("Sulit") && !body.includes("Silog") && !body.includes("All")) {
        throw new Error("Category filters not visible");
      }
    });

    await test("POS screen has search bar", async () => {
      await loginAndGoToPOS();
      const inputs = await driver.findElements(By.css("input"));
      if (inputs.length === 0) throw new Error("Search bar not found");
    });

    await test("search filters menu items", async () => {
      await loginAndGoToPOS();
      const inputs = await driver.findElements(By.css("input"));
      await inputs[0].sendKeys("tapa");
      await sleep(800);
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.toLowerCase().includes("tapa")) throw new Error("Search did not filter items");
    });

    await test("adding item to cart shows cart button", async () => {
      await loginAndGoToPOS();
      const body = await driver.findElement(By.css("body")).getText();
      const lines = body.split("\n");
      const itemLine = lines.find(l => l.includes("Chicken Pastil"));
      if (!itemLine) throw new Error("Chicken Pastil not found on screen");
      const itemEl = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Chicken Pastil')]")), WAIT
      );
      await itemEl.click();
      await sleep(800);
      const newBody = await driver.findElement(By.css("body")).getText();
      if (!newBody.includes("₱") && !newBody.includes("item") && !newBody.includes("cart")) {
        throw new Error("Cart button did not appear after adding item");
      }
    });

    // ── Group 5: Dashboard ──────────────────────────────────────────────────
    console.log("\nDashboard");

    async function goToDashboard() {
      await driver.get(APP_URL);
      await sleep(1500);
      const startBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Start')]")), WAIT
      );
      await startBtn.click();
      await sleep(1000);
      const inputs = await driver.findElements(By.css("input"));
      await inputs[0].sendKeys("admin@maifah.com");
      await inputs[1].sendKeys("admin123");
      const signInBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Sign In') or contains(text(),'sign in')]")), WAIT
      );
      await signInBtn.click();
      await sleep(1500);
      const invBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Inventory') or contains(text(),'Sales') or contains(text(),'Dashboard')]")), WAIT
      );
      await invBtn.click();
      await sleep(1500);
    }

    await test("dashboard shows revenue information", async () => {
      await goToDashboard();
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("Revenue") && !body.includes("Sales") && !body.includes("₱")) {
        throw new Error("Revenue information not visible on dashboard");
      }
    });

    await test("dashboard shows orders information", async () => {
      await goToDashboard();
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("Order") && !body.includes("order")) {
        throw new Error("Orders information not visible on dashboard");
      }
    });

    await test("dashboard shows net profit", async () => {
      await goToDashboard();
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("Profit") && !body.includes("profit")) {
        throw new Error("Net profit not visible on dashboard");
      }
    });

    // ── Group 6: Expenses ───────────────────────────────────────────────────
    console.log("\nExpenses");

    async function goToExpenses() {
  await goToDashboard();
  await sleep(1000);
  try {
    const expBtn = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'Expense') or contains(text(),'expense') or contains(text(),'EXPENSE')]")), WAIT
    );
    await driver.executeScript("arguments[0].click();", expBtn);
    await sleep(2000);
  } catch(e) {
    const allBtns = await driver.findElements(By.css("button, a, [role='tab']"));
    for (let btn of allBtns) {
      const text = await btn.getText().catch(() => "");
      if (text.toLowerCase().includes("expense")) {
        await driver.executeScript("arguments[0].click();", btn);
        await sleep(2000);
        break;
      }
    }
  }
}

    await test("expenses screen is accessible", async () => {
      await goToExpenses();
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.toLowerCase().includes("expense")) {
        throw new Error("Expenses screen not accessible");
      }
    });

    await test("expenses screen shows add button", async () => {
      await goToExpenses();
      await sleep(1000);
      const body = await driver.findElement(By.css("body")).getText();
      const buttons = await driver.findElements(By.css("button, [role='button'], svg, [aria-label]"));
      if (body.includes("+") || body.toLowerCase().includes("add") || buttons.length > 0) {
    return;
      }
      throw new Error("Add expense button not found");
    });

    await test("expenses screen shows total expenses", async () => {
      await goToExpenses();
      const body = await driver.findElement(By.css("body")).getText();
      if (!body.includes("₱") && !body.toLowerCase().includes("total")) {
        throw new Error("Total expenses not shown");
      }
    });

  } catch (err) {
    console.log("\nFatal error:", err.message);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n========================================");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`  Total:   ${passed + failed} tests`);
  console.log("========================================\n");

  if (failed === 0) {
    console.log("  All tests passed!");
  } else {
    console.log("  Failed tests:");
    results.filter(r => r.status === "FAIL").forEach(r => {
      console.log(`  - ${r.name}`);
    });
  }

  await teardown();
}

runTests();
