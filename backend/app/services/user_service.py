"""
User Management and Repository Service for NER LandslideGuard.
Manages secure user authentication, role assignment, and demo personas.
"""

from typing import Dict, Optional, List
from app.schemas.auth import UserRole, UserResponse, DemoAccountInfo
from app.auth.security import hash_password, verify_password

class UserService:
    def __init__(self):
        # In-memory user store seeded with development / demo accounts
        # Passwords in production can be overridden via environment variables
        self._users: Dict[str, dict] = {}
        self._seed_initial_users()

    def _seed_initial_users(self):
        """Initializes default role accounts with bcrypt hashed passwords."""
        demo_users = [
            {
                "id": "USR-ADM-001",
                "username": "admin",
                "email": "commander.eoc@ner.gov.in",
                "password_hash": hash_password("Admin@NER2026!"),
                "full_name": "Brig. Sanjeev Sharma",
                "role": UserRole.ADMIN,
                "jurisdiction": "8 Northeast States (NEC Command)",
                "department": "National Disaster Management Authority (NDMA / NEC)",
                "badge_number": "EOC-CMD-001",
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            },
            {
                "id": "USR-DIS-002",
                "username": "district_officer",
                "email": "ddmo.pakyong@sikkim.gov.in",
                "password_hash": hash_password("District@Pakyong2026!"),
                "full_name": "Dr. Tenzing Norbu Lepcha",
                "role": UserRole.DISTRICT_OFFICER,
                "jurisdiction": "Pakyong & East Sikkim Districts",
                "department": "District Disaster Management Authority (DDMA Sikkim)",
                "badge_number": "DDMA-SK-042",
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            },
            {
                "id": "USR-FLD-003",
                "username": "field_officer",
                "email": "sdrf.bravo@assam.gov.in",
                "password_hash": hash_password("Field@SDRF2026!"),
                "full_name": "Sub-Inspector Bhaskar Kalita",
                "role": UserRole.FIELD_OFFICER,
                "jurisdiction": "Dima Hasao & Cachar Corridors",
                "department": "State Disaster Response Force (1st Bn SDRF)",
                "badge_number": "SDRF-AS-118",
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
            },
            {
                "id": "USR-CTZ-004",
                "username": "citizen",
                "email": "volunteer.shillong@gmail.com",
                "password_hash": hash_password("Citizen@Guard2026!"),
                "full_name": "Ibakordor Khongwir",
                "role": UserRole.CITIZEN,
                "jurisdiction": "East Khasi Hills (Mawkdok Community)",
                "department": "Aapda Mitra Community Volunteer",
                "badge_number": "AM-ML-884",
                "is_active": True,
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
            }
        ]

        for u in demo_users:
            self._users[u["username"].lower()] = u

    def authenticate_user(self, username_or_email: str, password: str) -> Optional[dict]:
        """Validates credentials against user database."""
        target = username_or_email.lower().strip()
        user = None
        for u in self._users.values():
            if u["username"].lower() == target or u["email"].lower() == target:
                user = u
                break
        
        if not user or not user.get("is_active", True):
            return None
            
        if verify_password(password, user["password_hash"]):
            return user
        return None

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Finds user by unique ID."""
        for u in self._users.values():
            if u["id"] == user_id:
                return u
        return None

    def get_user_by_role(self, role: UserRole) -> Optional[dict]:
        """Finds default persona for a role."""
        for u in self._users.values():
            if u["role"] == role:
                return u
        return None

    def to_user_response(self, user_dict: dict) -> UserResponse:
        """Converts internal user record to sanitized response schema."""
        return UserResponse(
            id=user_dict["id"],
            username=user_dict["username"],
            email=user_dict["email"],
            full_name=user_dict["full_name"],
            role=user_dict["role"],
            jurisdiction=user_dict["jurisdiction"],
            department=user_dict["department"],
            badge_number=user_dict.get("badge_number"),
            is_active=user_dict.get("is_active", True),
            avatar_url=user_dict.get("avatar_url")
        )

    def get_demo_accounts_info(self) -> List[DemoAccountInfo]:
        """Returns public metadata of available demo personas for quick switcher."""
        return [
            DemoAccountInfo(
                role=UserRole.ADMIN,
                title="EOC Commander / State Administrator",
                username="admin",
                full_name="Brig. Sanjeev Sharma",
                department="National Disaster Management Authority (NDMA / NEC)",
                jurisdiction="All 8 Northeast States",
                badge_number="EOC-CMD-001",
                description="Full executive command authority over early warning broadcasts, ML telemetry, user access, and mountain battalion mobilization.",
                permissions_summary=["Full System Access", "Issue CAP Broadcast Bulletins", "Authorize Tactical Dispatches", "System Administration"]
            ),
            DemoAccountInfo(
                role=UserRole.DISTRICT_OFFICER,
                title="District Disaster Management Officer (DDMO)",
                username="district_officer",
                full_name="Dr. Tenzing Norbu Lepcha",
                department="District Disaster Management Authority (DDMA)",
                jurisdiction="Pakyong & East Sikkim Districts",
                badge_number="DDMA-SK-042",
                description="Monitors district hazard zones, evaluates alert thresholds, reviews verified incidents, and coordinates local emergency response.",
                permissions_summary=["GIS Risk Maps", "Early Warning Alerts", "Incident Review", "Emergency Response Prioritization", "Weather & Analytics"]
            ),
            DemoAccountInfo(
                role=UserRole.FIELD_OFFICER,
                title="First Responder / SDRF Field Officer",
                username="field_officer",
                full_name="Sub-Inspector Bhaskar Kalita",
                department="State Disaster Response Force (SDRF / BRO)",
                jurisdiction="Dima Hasao & Cachar Corridors",
                badge_number="SDRF-AS-118",
                description="Performs ground reconnaissance, captures tension cracks with AI computer vision, logs offline reports, and verifies landslide breaches.",
                permissions_summary=["Field Hazard Reporting", "Offline PWA Queue", "Ground Incident Verification", "Live GPS Mapping"]
            ),
            DemoAccountInfo(
                role=UserRole.CITIZEN,
                title="Citizen / Community Volunteer",
                username="citizen",
                full_name="Ibakordor Khongwir",
                department="Aapda Mitra Volunteer",
                jurisdiction="East Khasi Hills (Mawkdok)",
                badge_number="AM-ML-884",
                description="Public safety access to view regional risk advisories, weather telemetry, active warnings, and submit citizen hazard reports.",
                permissions_summary=["View Public Risk Maps", "View Weather Advisories", "Submit Citizen Reports", "Receive Live Bulletins"]
            ),
        ]

user_service = UserService()
