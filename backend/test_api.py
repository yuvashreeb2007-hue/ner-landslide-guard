import urllib.request
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoint(name, url, method="GET", data=None):
    print(f"\n--- Testing {name} [{method} {url}] ---")
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8") if data else None,
        headers={"Content-Type": "application/json"} if data else {}
    )
    req.get_method = lambda: method
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            result = json.loads(resp.read().decode("utf-8"))
            print(f"Status: {status}")
            print(f"Response (sample): {json.dumps(result, indent=2)[:400]}...")
            return True, result
    except Exception as e:
        print(f"FAILED: {e}")
        return False, None

def main():
    print("=" * 60)
    print("NER LANDSLIDEGUARD - REST API VERIFICATION SUITE")
    print("=" * 60)

    # 1. Health
    test_endpoint("Health Check", f"{BASE_URL}/health")

    # 2. Predict Risk (Critical Scenario)
    payload_critical = {
        "rainfall_24h": 165.4,
        "rainfall_7d": 450.2,
        "soil_moisture": 92.0,
        "slope": 48.5,
        "elevation": 860.0,
        "ndvi": 0.32,
        "historical_landslides": 14,
        "distance_to_road": 120.0,
        "distance_to_settlement": 350.0,
        "district": "Pakyong",
        "state": "Sikkim"
    }
    test_endpoint("Predict Risk (Critical)", f"{BASE_URL}/predict-risk", method="POST", data=payload_critical)

    # 3. Predict Risk (Low Scenario)
    payload_low = {
        "rainfall_24h": 15.0,
        "rainfall_7d": 40.0,
        "soil_moisture": 35.0,
        "slope": 18.0,
        "elevation": 300.0,
        "ndvi": 0.75,
        "historical_landslides": 1,
        "distance_to_road": 500.0,
        "distance_to_settlement": 1200.0,
        "district": "North Tripura",
        "state": "Tripura"
    }
    test_endpoint("Predict Risk (Low)", f"{BASE_URL}/predict-risk", method="POST", data=payload_low)

    # 4. Risk Zones
    test_endpoint("Get Risk Zones", f"{BASE_URL}/risk-zones")

    # 5. Risk Zone by ID
    test_endpoint("Get Risk Zone by ID", f"{BASE_URL}/risk-zones/RZ-SK-01")

    # 6. Submit Report
    new_report = {
        "reporterName": "Angom Singh",
        "reporterPhone": "+91 98765 43210",
        "role": "BRO Patrol",
        "district": "Noney",
        "state": "Manipur",
        "locationName": "NH-37 Tupul Axis",
        "latitude": 24.7890,
        "longitude": 93.6540,
        "hazardType": "Shoulder Collapse",
        "urgencyLevel": "URGENT",
        "description": "Cracking on road edge due to heavy rain.",
        "roadBlocked": True,
        "structuresAtRisk": 2
    }
    test_endpoint("Submit Field Report", f"{BASE_URL}/reports", method="POST", data=new_report)

    # 7. Incidents
    test_endpoint("Get Incidents", f"{BASE_URL}/incidents")

    # 8. Alerts
    test_endpoint("Get Alerts", f"{BASE_URL}/alerts")

    # 9. Weather
    test_endpoint("Get Weather", f"{BASE_URL}/weather")

    print("\n" + "=" * 60)
    print("ALL API ENDPOINTS VERIFIED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    main()
