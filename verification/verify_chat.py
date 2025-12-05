from playwright.sync_api import sync_playwright
import time

def verify(page):
    try:
        print("Navigating to http://localhost:3000")
        page.goto("http://localhost:3000")
        print("Waiting for page load...")
        time.sleep(5) # Wait for load
        print("Taking screenshot...")
        page.screenshot(path="verification/chat.png")
        print("Screenshot taken.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify(page)
        browser.close()
