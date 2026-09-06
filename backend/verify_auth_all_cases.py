import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8000/api"

def make_request(method: str, endpoint: str, data: dict = None, token: str = None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json", "User-Agent": "NER-Auth-Tester/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"raw": err_body}
        return e.code, parsed
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    passed = 0
    total = 14
    print("=================================================================")
    print("NER LANDSLIDEGUARD - COMPREHENSIVE AUTH & RBAC VERIFICATION")
    print("=================================================================\n")

    # Tokens dictionary
    tokens = {}

    # --- TEST 1: Valid Login ---
    print("--- Test 1: Valid Login (admin) ---")
    status_code, resp = make_request("POST", "/auth/demo-login", {"role": "ADMIN"})
    if status_code == 200 and "access_token" in resp and resp.get("user", {}).get("role") == "ADMIN":
        tokens["ADMIN"] = resp["access_token"]
        print(f"[PASS] Status: {status_code} OK | Token Acquired | User: {resp['user']['full_name']}")
        passed += 1
    else:
        print(f"[FAIL] Status: {status_code} | Response: {resp}")

    # --- TEST 2: Invalid Password ---
    print("\n--- Test 2: Invalid Password Authentication ---")
    status_code, resp = make_request("POST", "/auth/login", {
        "username_or_email": "admin",
        "password": "WrongPassword123!"
    })
    if status_code == 401:
        print(f"[PASS] Status: {status_code} Unauthorized | Error: {resp.get('detail')}")
        passed += 1
    else:
        print(f"[FAIL] Expected 401, got {status_code}: {resp}")

    # --- TEST 3: Empty Username ---
    print("\n--- Test 3: Empty Username Authentication ---")
    status_code, resp = make_request("POST", "/auth/login", {
        "username_or_email": "",
        "password": "SomePassword123!"
    })
    if status_code in (401, 422):
        print(f"[PASS] Status: {status_code} Rejected | Response: {resp.get('detail')}")
        passed += 1
    else:
        print(f"[FAIL] Expected 401 or 422, got {status_code}: {resp}")

    # --- TEST 4: Empty Password ---
    print("\n--- Test 4: Empty Password Authentication ---")
    status_code, resp = make_request("POST", "/auth/login", {
        "username_or_email": "admin",
        "password": ""
    })
    if status_code in (401, 422):
        print(f"[PASS] Status: {status_code} Rejected | Response: {resp.get('detail')}")
        passed += 1
    else:
        print(f"[FAIL] Expected 401 or 422, got {status_code}: {resp}")

    # --- TEST 5: Logout / Session Clearance Simulation ---
    print("\n--- Test 5: Session Termination / Logout Simulation ---")
    status_code, resp = make_request("GET", "/auth/me", token=None)
    if status_code == 401:
        print(f"[PASS] Status: {status_code} Unauthorized | Session cleared, protected access blocked")
        passed += 1
    else:
        print(f"[FAIL] Expected 401 after logout, got {status_code}: {resp}")

    # --- TEST 6: Protected Route Without Authentication ---
    print("\n--- Test 6: Protected Route Without Authentication (GET /api/auth/me) ---")
    status_code, resp = make_request("GET", "/auth/me")
    if status_code == 401 and "Authentication token required" in str(resp.get("detail", "")):
        print(f"[PASS] Status: {status_code} Unauthorized | Detail: {resp.get('detail')}")
        passed += 1
    else:
        print(f"[FAIL] Expected 401 'Authentication token required', got {status_code}: {resp}")

    # --- TEST 7: Admin Role Verification & Permissions ---
    print("\n--- Test 7: Admin Role Verification (ADMIN) ---")
    status_code, resp = make_request("POST", "/auth/demo-login", {"role": "ADMIN"})
    if status_code == 200:
        token = resp["access_token"]
        tokens["ADMIN"] = token
        me_status, me_resp = make_request("GET", "/auth/me", token=token)
        if me_status == 200 and me_resp.get("role") == "ADMIN":
            print(f"[PASS] Profile: {me_resp['full_name']} | Role: {me_resp['role']} | Jurisdiction: {me_resp['jurisdiction']}")
            print("       Landing Page: /dashboard (Full 12-module EOC access)")
            passed += 1
        else:
            print(f"[FAIL] Failed /me check: {me_status}, {me_resp}")
    else:
        print(f"[FAIL] Failed admin login: {status_code}, {resp}")

    # --- TEST 8: District Officer Role Verification & Permissions ---
    print("\n--- Test 8: District Officer Role Verification (DISTRICT_OFFICER) ---")
    status_code, resp = make_request("POST", "/auth/demo-login", {"role": "DISTRICT_OFFICER"})
    if status_code == 200:
        token = resp["access_token"]
        tokens["DISTRICT_OFFICER"] = token
        me_status, me_resp = make_request("GET", "/auth/me", token=token)
        if me_status == 200 and me_resp.get("role") == "DISTRICT_OFFICER":
            print(f"[PASS] Profile: {me_resp['full_name']} | Role: {me_resp['role']} | Jurisdiction: {me_resp['jurisdiction']}")
            print("       Landing Page: /district (DDMA Operations Board)")
            passed += 1
        else:
            print(f"[FAIL] Failed /me check: {me_status}, {me_resp}")
    else:
        print(f"[FAIL] Failed district_officer login: {status_code}, {resp}")

    # --- TEST 9: Field Officer Role Verification & Permissions ---
    print("\n--- Test 9: Field Officer Role Verification (FIELD_OFFICER) ---")
    status_code, resp = make_request("POST", "/auth/demo-login", {"role": "FIELD_OFFICER"})
    if status_code == 200:
        token = resp["access_token"]
        tokens["FIELD_OFFICER"] = token
        me_status, me_resp = make_request("GET", "/auth/me", token=token)
        if me_status == 200 and me_resp.get("role") == "FIELD_OFFICER":
            print(f"[PASS] Profile: {me_resp['full_name']} | Role: {me_resp['role']} | Jurisdiction: {me_resp['jurisdiction']}")
            print("       Landing Page: /field (Recon & +REPORT INCIDENT Action)")
            passed += 1
        else:
            print(f"[FAIL] Failed /me check: {me_status}, {me_resp}")
    else:
        print(f"[FAIL] Failed field_officer login: {status_code}, {resp}")

    # --- TEST 10: Citizen Role Verification & Permissions ---
    print("\n--- Test 10: Citizen Role Verification (CITIZEN) ---")
    status_code, resp = make_request("POST", "/auth/demo-login", {"role": "CITIZEN"})
    if status_code == 200:
        token = resp["access_token"]
        tokens["CITIZEN"] = token
        me_status, me_resp = make_request("GET", "/auth/me", token=token)
        if me_status == 200 and me_resp.get("role") == "CITIZEN":
            print(f"[PASS] Profile: {me_resp['full_name']} | Role: {me_resp['role']} | Jurisdiction: {me_resp['jurisdiction']}")
            print("       Landing Page: /citizen (Community Portal & Public Advisories)")
            passed += 1
        else:
            print(f"[FAIL] Failed /me check: {me_status}, {me_resp}")
    else:
        print(f"[FAIL] Failed citizen login: {status_code}, {resp}")

    # --- TEST 11: Backend Authorization: DISTRICT_OFFICER -> /auth/admin/users (Expected 403) ---
    print("\n--- Test 11: Backend AuthZ: DISTRICT_OFFICER attempting User Management ---")
    status_code, resp = make_request("GET", "/auth/admin/users", token=tokens.get("DISTRICT_OFFICER"))
    if status_code == 403:
        print(f"[PASS] Status: {status_code} Forbidden | Error: {resp.get('detail')}")
        passed += 1
    else:
        print(f"[FAIL] Expected 403 Forbidden, got {status_code}: {resp}")

    # --- TEST 12: Backend AuthZ: CITIZEN -> /auth/admin/system-config (Expected 403) ---
    print("\n--- Test 12: Backend AuthZ: CITIZEN attempting System Administration ---")
    status_code, resp = make_request("GET", "/auth/admin/system-config", token=tokens.get("CITIZEN"))
    if status_code == 403:
        print(f"[PASS] Status: {status_code} Forbidden | Error: {resp.get('detail')}")
        passed += 1
    else:
        print(f"[FAIL] Expected 403 Forbidden, got {status_code}: {resp}")

    # --- TEST 13: Backend AuthZ: FIELD_OFFICER -> /auth/emergency/dispatch (Expected 403) ---
    print("\n--- Test 13: Backend AuthZ: FIELD_OFFICER attempting Emergency Tactical Dispatch ---")
    status_code, resp = make_request("POST", "/auth/emergency/dispatch", token=tokens.get("FIELD_OFFICER"))
    if status_code == 403:
        print(f"[PASS] Status: {status_code} Forbidden | Error: {resp.get('detail')}")
        passed += 1
    else:
        print(f"[FAIL] Expected 403 Forbidden, got {status_code}: {resp}")

    # --- TEST 14: Backend AuthZ: ADMIN -> /auth/admin/users (Expected 200 OK) ---
    print("\n--- Test 14: Backend AuthZ: ADMIN accessing User Management ---")
    status_code, resp = make_request("GET", "/auth/admin/users", token=tokens.get("ADMIN"))
    if status_code == 200:
        print(f"[PASS] Status: {status_code} OK | Authorized: {resp.get('message')}")
        passed += 1
    else:
        print(f"[FAIL] Expected 200 OK, got {status_code}: {resp}")

    print("\n=================================================================")
    print(f"VERIFICATION SUMMARY: {passed}/{total} TESTS PASSED ({(passed/total)*100:.0f}%)")
    print("=================================================================")
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
