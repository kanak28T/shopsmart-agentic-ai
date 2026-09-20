"""Run this directly: python run_tests.py  (from the backend/ directory)"""
import subprocess, sys, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

result = subprocess.run(
    [sys.executable, "-m", "pytest", "-o", "pythonpath=.", "tests/", "-v", "--tb=short"],
    capture_output=False,
)
sys.exit(result.returncode)
