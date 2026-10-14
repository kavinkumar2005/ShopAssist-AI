"""
ShopAssist AI - Unified Application Launcher
Starts the FastAPI backend and Vite React frontend concurrently.
"""

import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")
    
    print("=" * 60)
    print("   Starting ShopAssist AI - Smart E-Commerce Platform")
    print("=" * 60)
    print(" [1/2] Launching FastAPI Backend on http://localhost:8000...")
    
    # Start Backend
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=root_dir
    )
    
    time.sleep(2)
    
    print(" [2/2] Launching Vite React Frontend on http://localhost:5173...")
    # Start Frontend
    frontend_cmd = "npm run dev"
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        shell=True,
        cwd=frontend_dir
    )
    
    print("\n" + "=" * 60)
    print("   ShopAssist AI is LIVE!")
    print("   - Web UI:  http://localhost:5173")
    print("   - API Docs: http://localhost:8000/docs")
    print("   Press Ctrl+C to terminate both servers.")
    print("=" * 60 + "\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down ShopAssist AI servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
