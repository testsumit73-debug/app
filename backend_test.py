import requests
import sys
import json
from datetime import datetime

class ResumeBuilderAPITester:
    def __init__(self, base_url="https://resume-forge-109.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.resume_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success:
                try:
                    error_detail = response.json()
                    details += f", Response: {error_detail}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return response.content
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_auth_signup(self):
        """Test user signup"""
        test_user_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        
        response = self.run_test(
            "Auth - Signup",
            "POST",
            "auth/signup",
            200,
            data=test_user_data
        )
        
        if response and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_auth_login(self):
        """Test user login with existing credentials"""
        # First create a user
        test_user_data = {
            "email": f"login_test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "full_name": "Login Test User"
        }
        
        # Signup first
        signup_response = self.run_test(
            "Auth - Signup for Login Test",
            "POST",
            "auth/signup",
            200,
            data=test_user_data
        )
        
        if not signup_response:
            return False
        
        # Now test login
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        response = self.run_test(
            "Auth - Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return response and 'token' in response

    def test_auth_me(self):
        """Test get current user"""
        if not self.token:
            self.log_test("Auth - Get Me", False, "No token available")
            return False
        
        response = self.run_test(
            "Auth - Get Me",
            "GET",
            "auth/me",
            200
        )
        
        return response and 'id' in response

    def test_templates_get(self):
        """Test get templates"""
        response = self.run_test(
            "Templates - Get All",
            "GET",
            "templates",
            200
        )
        
        if response and isinstance(response, list) and len(response) > 0:
            # Check if templates have required fields
            template = response[0]
            required_fields = ['id', 'name', 'description']
            has_fields = all(field in template for field in required_fields)
            if has_fields:
                self.log_test("Templates - Structure Check", True, f"Found {len(response)} templates")
                return True
            else:
                self.log_test("Templates - Structure Check", False, "Missing required fields")
        
        return False

    def test_resume_create(self):
        """Test create resume"""
        if not self.token:
            self.log_test("Resume - Create", False, "No token available")
            return False
        
        resume_data = {
            "title": "Test Resume",
            "template_id": "ats-tech",
            "personal_info": {
                "full_name": "John Doe",
                "email": "john@example.com",
                "phone": "+1234567890",
                "location": "San Francisco, CA",
                "linkedin": "https://linkedin.com/in/johndoe",
                "portfolio": "https://johndoe.com"
            },
            "professional_summary": "Experienced software developer with 5+ years in full-stack development.",
            "skills": ["JavaScript", "Python", "React", "Node.js", "SQL"],
            "work_experience": [{
                "company": "Tech Corp",
                "position": "Senior Developer",
                "location": "San Francisco, CA",
                "start_date": "Jan 2020",
                "end_date": "Present",
                "current": True,
                "description": ["Led development of web applications", "Mentored junior developers"]
            }],
            "education": [{
                "institution": "University of California",
                "degree": "Bachelor of Science",
                "field": "Computer Science",
                "location": "Berkeley, CA",
                "start_date": "2015",
                "end_date": "2019",
                "gpa": "3.8"
            }],
            "projects": [{
                "name": "E-commerce Platform",
                "description": "Built a full-stack e-commerce platform",
                "technologies": ["React", "Node.js", "MongoDB"],
                "link": "https://github.com/johndoe/ecommerce"
            }],
            "certifications": [{
                "name": "AWS Certified Developer",
                "issuer": "Amazon Web Services",
                "date": "Jan 2023",
                "credential_id": "AWS-123456"
            }]
        }
        
        response = self.run_test(
            "Resume - Create",
            "POST",
            "resumes",
            200,
            data=resume_data
        )
        
        if response and 'id' in response:
            self.resume_id = response['id']
            # Check if ATS score was calculated
            if 'ats_score' in response and isinstance(response['ats_score'], int):
                self.log_test("Resume - ATS Score Calculation", True, f"ATS Score: {response['ats_score']}")
            return True
        return False

    def test_resume_get_all(self):
        """Test get all resumes"""
        if not self.token:
            self.log_test("Resume - Get All", False, "No token available")
            return False
        
        response = self.run_test(
            "Resume - Get All",
            "GET",
            "resumes",
            200
        )
        
        return response and isinstance(response, list)

    def test_resume_get_one(self):
        """Test get single resume"""
        if not self.token or not self.resume_id:
            self.log_test("Resume - Get One", False, "No token or resume ID available")
            return False
        
        response = self.run_test(
            "Resume - Get One",
            "GET",
            f"resumes/{self.resume_id}",
            200
        )
        
        return response and response.get('id') == self.resume_id

    def test_resume_update(self):
        """Test update resume"""
        if not self.token or not self.resume_id:
            self.log_test("Resume - Update", False, "No token or resume ID available")
            return False
        
        update_data = {
            "title": "Updated Test Resume",
            "professional_summary": "Updated professional summary with more details."
        }
        
        response = self.run_test(
            "Resume - Update",
            "PUT",
            f"resumes/{self.resume_id}",
            200,
            data=update_data
        )
        
        return response and response.get('title') == "Updated Test Resume"

    def test_resume_ats_score(self):
        """Test get ATS score"""
        if not self.token or not self.resume_id:
            self.log_test("Resume - ATS Score", False, "No token or resume ID available")
            return False
        
        response = self.run_test(
            "Resume - ATS Score",
            "GET",
            f"resumes/{self.resume_id}/ats-score",
            200
        )
        
        if response and 'score' in response and 'suggestions' in response:
            score = response['score']
            suggestions_count = len(response.get('suggestions', []))
            self.log_test("Resume - ATS Score Details", True, f"Score: {score}, Suggestions: {suggestions_count}")
            return True
        return False

    def test_resume_duplicate(self):
        """Test duplicate resume"""
        if not self.token or not self.resume_id:
            self.log_test("Resume - Duplicate", False, "No token or resume ID available")
            return False
        
        response = self.run_test(
            "Resume - Duplicate",
            "POST",
            f"resumes/{self.resume_id}/duplicate",
            200
        )
        
        if response and 'id' in response and response['id'] != self.resume_id:
            # Check if title was modified
            if "(Copy)" in response.get('title', ''):
                self.log_test("Resume - Duplicate Title Check", True, f"Title: {response['title']}")
            return True
        return False

    def test_resume_export_pdf(self):
        """Test export resume to PDF"""
        if not self.token or not self.resume_id:
            self.log_test("Resume - Export PDF", False, "No token or resume ID available")
            return False
        
        url = f"{self.base_url}/resumes/{self.resume_id}/export/pdf"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            success = response.status_code == 200 and response.headers.get('content-type') == 'application/pdf'
            
            if success:
                pdf_size = len(response.content)
                self.log_test("Resume - Export PDF", True, f"PDF size: {pdf_size} bytes")
            else:
                self.log_test("Resume - Export PDF", False, f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}")
            
            return success
        except Exception as e:
            self.log_test("Resume - Export PDF", False, f"Exception: {str(e)}")
            return False

    def test_resume_delete(self):
        """Test delete resume"""
        if not self.token or not self.resume_id:
            self.log_test("Resume - Delete", False, "No token or resume ID available")
            return False
        
        response = self.run_test(
            "Resume - Delete",
            "DELETE",
            f"resumes/{self.resume_id}",
            200
        )
        
        return response and 'message' in response

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Resume Builder API Tests")
        print(f"📍 Testing endpoint: {self.base_url}")
        print("=" * 60)
        
        # Authentication Tests
        print("\n📋 Authentication Tests")
        self.test_auth_signup()
        self.test_auth_login()
        self.test_auth_me()
        
        # Template Tests
        print("\n📋 Template Tests")
        self.test_templates_get()
        
        # Resume Tests
        print("\n📋 Resume Tests")
        self.test_resume_create()
        self.test_resume_get_all()
        self.test_resume_get_one()
        self.test_resume_update()
        self.test_resume_ats_score()
        self.test_resume_duplicate()
        self.test_resume_export_pdf()
        self.test_resume_delete()
        
        # Print Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return 1

def main():
    tester = ResumeBuilderAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())