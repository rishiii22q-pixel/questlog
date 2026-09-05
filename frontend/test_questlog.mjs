import { chromium } from 'playwright';

async function runTests() {
  console.log('🚀 Starting Playwright E2E Test Suite for QuestLog...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Set logged-in user in localStorage
  await context.addInitScript(() => {
    localStorage.setItem('questlog_user_id', '1');
    localStorage.setItem('questlog_username', 'student_pro');
  });

  const page = await context.newPage();
  const results = [];

  function record(testName, passed, details = '') {
    results.push({ testName, status: passed ? 'PASS ✅' : 'FAIL ❌', details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName} ${details ? '- ' + details : ''}`);
  }

  try {
    // 1. Visit Dashboard
    console.log('1. Navigating to Dashboard (http://localhost:5173/dashboard)...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    record('Dashboard Loaded', page.url().includes('/dashboard'), page.url());

    // 2. Check Header & Logo
    const logoText = await page.textContent('.header-logo');
    record('Header Logo Exists', logoText && logoText.includes('QuestLog'), logoText?.trim());

    // 3. Check Navigation Tabs (Dashboard & Calendar)
    const hasDashboardNav = await page.locator('button:has-text("Dashboard")').first().isVisible();
    const hasCalendarNav = await page.locator('button:has-text("Calendar")').first().isVisible();
    record('Header Navigation Tabs Present', hasDashboardNav && hasCalendarNav);

    // 4. Check Streak Badge in Header
    const streakBadgeText = await page.locator('.streak-badge').textContent();
    record('Header Streak Badge Visible', streakBadgeText && streakBadgeText.includes('Streak'), streakBadgeText?.trim());

    // 5. Check Goal Banner & Master Streak Card
    const goalBannerText = await page.locator('.goal-banner').textContent();
    record('Goal Banner & Master Streak Card Visible', goalBannerText && goalBannerText.includes('Master Streak'), goalBannerText?.trim().slice(0, 70));

    // 6. Test 'Add Routine' (Daily Core Routine)
    console.log('\n2. Testing Add Daily Core Routine...');
    const routineTitle = 'Routine ' + Date.now();
    const addRoutineBtn = page.locator('button:has-text("Add Routine")').first();
    const hasAddRoutineBtn = await addRoutineBtn.isVisible();
    record('Add Routine Button Present', hasAddRoutineBtn);

    if (hasAddRoutineBtn) {
      await addRoutineBtn.click();
      await page.waitForSelector('.modal-card');
      await page.fill('input[placeholder*="Study"]', routineTitle);
      await page.click('button:has-text("Add Daily Routine")');
      await page.waitForTimeout(1500);

      const routineItem = page.locator(`.routine-title:has-text("${routineTitle}")`);
      const isRoutineCreated = await routineItem.isVisible();
      record('Add Daily Routine Created & Listed', isRoutineCreated);

      // 7. Test 'Toggle Routine' (Complete habit)
      if (isRoutineCreated) {
        console.log('Testing Toggle Routine completion...');
        await routineItem.click();
        await page.waitForTimeout(1500);
        const isDone = await page.locator(`.routine-item.completed:has-text("${routineTitle}")`).isVisible();
        record('Toggle Routine to Completed Style', isDone);
      }
    }

    // 8. Test 'New Task' (Ad-Hoc / Sudden Task)
    console.log('\n3. Testing Schedule Sudden Task...');
    const taskTitle = 'Task ' + Date.now();
    const addTaskBtn = page.locator('button:has-text("New Task")').first();
    const hasAddTaskBtn = await addTaskBtn.isVisible();
    record('New Task Button Present', hasAddTaskBtn);

    if (hasAddTaskBtn) {
      await addTaskBtn.click();
      await page.waitForSelector('.modal-card');
      await page.fill('input[placeholder*="Review"]', taskTitle);
      await page.click('button:has-text("Schedule Task")');
      await page.waitForTimeout(1500);

      const taskItem = page.locator(`.task-title:has-text("${taskTitle}")`);
      const isTaskCreated = await taskItem.isVisible();
      record('Schedule Sudden Task Created & Listed', isTaskCreated);

      // 9. Test Toggle Task
      if (isTaskCreated) {
        console.log('Testing Toggle Task completion...');
        await taskItem.click();
        await page.waitForTimeout(1500);
        const isTaskDone = await page.locator(`.task-item.task-completed:has-text("${taskTitle}")`).isVisible();
        record('Toggle Task to Completed Style', isTaskDone);
      }
    }

    // 10. Test Date Navigation (Tomorrow -> Today)
    console.log('\n4. Testing Date Navigation...');
    const tomorrowBtn = page.locator('button.date-nav-btn:has-text("Tomorrow")');
    if (await tomorrowBtn.isVisible()) {
      await tomorrowBtn.click();
      await page.waitForTimeout(1000);
      const isTomorrowActive = await tomorrowBtn.evaluate(el => el.classList.contains('active'));
      record('Date Navigation to Tomorrow', isTomorrowActive);

      const todayBtn = page.locator('button.date-nav-btn:has-text("Today")');
      await todayBtn.click();
      await page.waitForTimeout(1000);
      const isTodayActive = await todayBtn.evaluate(el => el.classList.contains('active'));
      record('Date Navigation back to Today', isTodayActive);
    }

    // 11. Test Calendar Page
    console.log('\n5. Testing Calendar Page...');
    const calendarNavBtn = page.locator('nav button:has-text("Calendar")');
    await calendarNavBtn.click();
    await page.waitForTimeout(1500);
    record('Navigation to /calendar Route', page.url().includes('/calendar'), page.url());

    // Check Calendar Grid
    const dayCellsCount = await page.locator('[style*="min-height: 72"]').count();
    record('Monthly Calendar Day Cells Rendered', dayCellsCount >= 28, `${dayCellsCount} day cells`);

    // Click a day cell to test Day Details breakdown
    const activeDayCell = page.locator('[style*="min-height: 72"]').nth(10);
    if (await activeDayCell.isVisible()) {
      await activeDayCell.click();
      await page.waitForTimeout(800);
      const dayDetailPanel = await page.locator('button:has-text("+ Add Task")').isVisible();
      record('Day Detail Panel Updates on Day Click', dayDetailPanel);
    }

    // Return to Dashboard via Dashboard Nav
    console.log('\n6. Returning to Dashboard...');
    const dashboardNavBtn = page.locator('button:has-text("Dashboard")').first();
    await dashboardNavBtn.click();
    await page.waitForTimeout(1000);
    record('Return to Dashboard from Calendar', page.url().includes('/dashboard'));

    // Capture final screenshots
    await page.screenshot({ path: 'd:/dailywork/dashboard_e2e_screenshot.png' });
    console.log('📸 Saved screenshot: d:/dailywork/dashboard_e2e_screenshot.png');

  } catch (err) {
    console.error('Test execution error:', err);
    record('Playwright Test Suite Execution', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n======================================================');
  console.log('📋 COMPLETE PLAYWRIGHT TEST SUITE RESULTS:');
  console.log('======================================================');
  let passCount = 0;
  results.forEach((r, idx) => {
    if (r.status.includes('PASS')) passCount++;
    console.log(`${String(idx + 1).padStart(2, ' ')}. ${r.status.padEnd(9)} | ${r.testName} ${r.details ? '— ' + r.details : ''}`);
  });
  console.log('======================================================');
  console.log(`Total: ${results.length} | Passed: ${passCount} | Failed: ${results.length - passCount}`);
  console.log('======================================================\n');
}

runTests();
