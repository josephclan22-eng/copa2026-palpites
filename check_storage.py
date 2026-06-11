from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    c = b.new_context()
    page = c.new_page()
    page.goto('http://localhost:5173', timeout=60000)
    page.wait_for_load_state('networkidle', timeout=60000)
    keys = page.evaluate('Object.keys(localStorage)')
    data = page.evaluate('localStorage.getItem("copa2026_data")')
    results = page.evaluate('localStorage.getItem("copa2026_results")')
    print('Keys:', keys)
    print('Data:', data)
    print('Results:', results)
    b.close()
