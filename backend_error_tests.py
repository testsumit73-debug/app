import requests
import json
from datetime import datetime

class ResumeBuilderErrorTester:
    def __init__(self, base_url="https://bugblaster-5.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def test_auth_invalid_credentials(self):
        """Test login with invalid credentials"""
        url = f"{self.base_url}/auth/login"
        data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        try:
            response = requests.post(url, json=data, timeout=30)
            success = response.status_code == 401
            self.log_test("Auth - Invalid Credentials", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Auth - Invalid Credentials", False, f"Exception: {str(e)}")

    def test_auth_duplicate_email(self):
        """Test signup with duplicate email"""
        # First create a user
        test_email = f"duplicate_test_{datetime.now().strftime('%H%M%S')}@example.com"
        user_data = {
            "email": test_email,
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        
        # First signup
        url = f"{self.base_url}/auth/signup"
        requests.post(url, json=user_data, timeout=30)
        
        # Try to signup again with same email
        try:
            response = requests.post(url, json=user_data, timeout=30)
            success = response.status_code == 400
            self.log_test("Auth - Duplicate Email", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Auth - Duplicate Email", False, f"Exception: {str(e)}")

    def test_protected_endpoint_no_token(self):
        """Test protected endpoint without token"""
        url = f"{self.base_url}/auth/me"
        
        try:
            response = requests.get(url, timeout=30)
            success = response.status_code == 401
            self.log_test("Auth - No Token", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Auth - No Token", False, f"Exception: {str(e)}")

    def test_protected_endpoint_invalid_token(self):
        """Test protected endpoint with invalid token"""
        url = f"{self.base_url}/auth/me"
        headers = {'Authorization': 'Bearer invalid_token_here'}
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            success = response.status_code == 401
            self.log_test("Auth - Invalid Token", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Auth - Invalid Token", False, f"Exception: {str(e)}")

    def test_resume_not_found(self):
        """Test getting non-existent resume"""
        # First get a valid token
        user_data = {
            "email": f"test_404_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        
        signup_response = requests.post(f"{self.base_url}/auth/signup", json=user_data, timeout=30)
        if signup_response.status_code == 200:
            token = signup_response.json()['token']
            
            # Try to get non-existent resume
            url = f"{self.base_url}/resumes/non-existent-id"
            headers = {'Authorization': f'Bearer {token}'}
            
            try:
                response = requests.get(url, headers=headers, timeout=30)
                success = response.status_code == 404
                self.log_test("Resume - Not Found", success, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Resume - Not Found", False, f"Exception: {str(e)}")
        else:
            self.log_test("Resume - Not Found", False, "Could not get auth token")

    def test_resume_unauthorized_access(self):
        """Test accessing another user's resume"""
        # Create two users
        user1_data = {
            "email": f"user1_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "full_name": "User One"
        }
        
        user2_data = {
            "email": f"user2_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "full_name": "User Two"
        }
        
        # Signup both users
        user1_response = requests.post(f"{self.base_url}/auth/signup", json=user1_data, timeout=30)
        user2_response = requests.post(f"{self.base_url}/auth/signup", json=user2_data, timeout=30)
        
        if user1_response.status_code == 200 and user2_response.status_code == 200:
            user1_token = user1_response.json()['token']
            user2_token = user2_response.json()['token']
            
            # Create resume with user1
            resume_data = {
                "title": "Test Resume",
                "template_id": "ats-tech",
                "personal_info": {
                    "full_name": "User One",
                    "email": "user1@example.com"
                }
            }
            
            create_response = requests.post(
                f"{self.base_url}/resumes",
                json=resume_data,
                headers={'Authorization': f'Bearer {user1_token}'},
                timeout=30
            )
            
            if create_response.status_code == 200:
                resume_id = create_response.json()['id']
                
                # Try to access with user2's token
                try:
                    response = requests.get(
                        f"{self.base_url}/resumes/{resume_id}",
                        headers={'Authorization': f'Bearer {user2_token}'},
                        timeout=30
                    )
                    success = response.status_code == 404  # Should not find resume for different user
                    self.log_test("Resume - Unauthorized Access", success, f"Status: {response.status_code}")
                except Exception as e:
                    self.log_test("Resume - Unauthorized Access", False, f"Exception: {str(e)}")
            else:
                self.log_test("Resume - Unauthorized Access", False, "Could not create resume")
        else:
            self.log_test("Resume - Unauthorized Access", False, "Could not create users")

    def run_error_tests(self):
        """Run all error handling tests"""
        print("🚀 Starting Resume Builder Error Handling Tests")
        print(f"📍 Testing endpoint: {self.base_url}")
        print("=" * 60)
        
        print("\n📋 Authentication Error Tests")
        self.test_auth_invalid_credentials()
        self.test_auth_duplicate_email()
        self.test_protected_endpoint_no_token()
        self.test_protected_endpoint_invalid_token()
        
        print("\n📋 Resume Error Tests")
        self.test_resume_not_found()
        self.test_resume_unauthorized_access()
        
        # Print Summary
        print("\n" + "=" * 60)
        print(f"📊 Error Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All error handling tests passed!")
            return 0
        else:
            print("⚠️  Some error handling tests failed.")
            return 1

def main():
    tester = ResumeBuilderErrorTester()
    return tester.run_error_tests()

if __name__ == "__main__":
    main()