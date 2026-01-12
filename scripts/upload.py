import pandas as pd
import requests
import json
import sys
from typing import Dict, Any

BASE_URL = "https://spallanzani.cogestione.tech/api"  # Change this to your actual domain

def login(username: str, password: str) -> str:
    """Login and return auth token"""
    response = requests.post(
        f"{BASE_URL}/docenti/login",
        json={"username": username, "password": password}
    )
    if not response.ok:
        raise Exception("Login failed: " + response.json().get('message', ''))
    return response.json()['token']

def create_course(token: str, course_data: Dict[Any, Any]) -> None:
    """Create a new course"""
    headers = {'Authorization': f'Bearer {token}'}
    
    # Convert availability string to list of integers
    availability = [int(x.strip()) for x in str(course_data['availability']).split(',')]
    
    payload = {
        'nome': course_data['nome'],
        'descrizione': course_data['descrizione'],
        'aula': course_data['aula'],
        'numPosti': int(course_data['numPosti']),
        'length': int(course_data['length']),
        'availability': availability
    }
    
    response = requests.post(
        f"{BASE_URL}/docenti/newCourse",
        headers=headers,
        json=payload
    )
    
    if not response.ok:
        print(f"Failed to create course {course_data['nome']}: {response.json().get('message', '')}")
    else:
        print(f"Successfully created course: {course_data['nome']}")

def main():
    if len(sys.argv) != 4:
        print("Usage: python upload.py <excel_file> <username> <password>")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    username = sys.argv[2]
    password = sys.argv[3]
    
    try:
        # Read Excel file
        df = pd.read_excel(excel_file)
        
        # Login
        token = login(username, password)
        
        # Create courses
        for _, row in df.iterrows():
            create_course(token, row)
            
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
