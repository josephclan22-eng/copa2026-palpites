import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    c = b.new_context()
    page = c.new_page()
    page.goto('http://localhost:5173', wait_until='networkidle')
    page.wait_for_timeout(2000)
    
    # Login
    page.locator('input').first.fill('AdminTest2')
    page.get_by_role('button').filter(has_text='Entrar').click()
    page.wait_for_timeout(2000)
    
    body = page.inner_text('body')
    print('=== DASHBOARD ===')
    print(body[:1500])
    print()
    
    # Go to Jogos
    page.get_by_role('button').filter(has_text='Jogos').click()
    page.wait_for_timeout(2000)
    
    body2 = page.inner_text('body')
    print('=== MATCHES (first 1500) ===')
    print(body2[:1500])
    print()
    
    # Check scores
    scores = page.locator('.fifa-card-score').all()
    for s in scores:
        t = s.inner_text()
        if t != '-':
            print(f'SCORE: {t}')
    
    # Check lock tags
    locks = page.locator('.fifa-card-lock-tag').all()
    print(f'Lock tags: {len(locks)}')
    
    b.close()
