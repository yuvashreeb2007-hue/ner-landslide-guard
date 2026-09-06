"""
Automated RBAC & Authentication Test Suite for NER LandslideGuard.
Tests login, password verification, JWT bearer headers, and demo role switching.
"""

import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8000/api/auth"

def test_json_request(name, url, method="GET", data=None, token=None):
    print(f"\n--- Testing {name} [{method} {url}] ---")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8") if data else None,
        headers=headers
    )
    req.get_method = lambda: method
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            result = json.loads(resp.read().decode("utf-8"))
            print(f"Status: {status} OK")
            print(f"Response: {json.dumps(result, indent=2)[:300]}...")
            return True, result
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code}: {body}")
        return False, {"code": e.code, "body": body}
    except Exception as e:
        print(f"FAILED: {e}")
        return False, None

def main():
    print("=" * 65)
    print("NER LANDSLIDEGUARD - ROLE-BASED AUTHENTICATION TEST SUITE")
    print("=" * 65)

    # 1. Fetch Demo Accounts
    ok, demo_accounts = test_json_request("Get Demo Accounts", f"{BASE_URL}/demo-accounts")
    assert ok, "Failed to get demo accounts"
    print(f"Found {len(demo_accounts)} demo persona profiles.")

    # 2. Demo Login as ADMIN
    ok, admin_token_resp = test_json_request(
        "Demo Login (ADMIN)",
        f"{BASE_URL}/demo-login",
        method="POST",
        data={"role": "ADMIN"}
    )
    assert ok, "Failed to demo login as ADMIN"
    admin_token = admin_token_resp["access_token"]
    assert admin_token_resp["user"]["role"] == "ADMIN"
    print("Admin Token acquired successfully.")

    # 3. Test /me endpoint with Admin Token
    ok, me_resp = test_json_request(
        "Verify Admin Profile via /me",
        f"{BASE_URL}/me",
        token=admin_token
    )
    assert ok, "Failed to authenticate /me"
    assert me_resp["username"] == "admin"
    print(f"Authenticated as: {me_resp['full_name']} ({me_resp['role']})")

    # 4. Demo Login for all other roles
    roles = ["DISTRICT_OFFICER", "FIELD_OFFICER", "CITIZEN"]
    for role in roles:
        ok, token_resp = test_json_request(
            f"Demo Login ({role})",
            f"{BASE_URL}/demo-login",
            method="POST",
            data={"role": role}
        )
        assert ok, f"Failed demo login for {role}"
        assert token_resp["user"]["role"] == role
        print(f"Verified {role} login: {token_resp['user']['full_name']}")

    # 5. Test Standard Credential Login with correct password
    ok, login_resp = test_json_request(
        "Standard Credential Login (admin / Admin@NER2026!)",
        f"{BASE_URL}/login",
        method="POST",
        data={"username_or_email": "admin", "password": "Admin@NER2026!"}
    )
    assert ok, "Failed credential login"
    assert login_resp["user"]["role"] == "ADMIN"

    # 6. Test Login with incorrect password (should return 401 Unauthorized)
    ok, err_resp = test_json_request(
        "Invalid Password Test (expecting 401)",
        f"{BASE_URL}/login",
        method="POST",
        data={"username_or_email": "admin", "password": "WrongPassword123!"}
    )
    assert not ok and err_resp["code"] == 401, "Should have failed with 401"
    print("Invalid password correctly rejected with 401 Unauthorized.")

    print("\n" + "=" * 65)
    print("ALL AUTHENTICATION & RBAC TESTS PASSED WITH 100% SUCCESS")
    print("=" * 65)

if __name__ == "__main__":
    main()
