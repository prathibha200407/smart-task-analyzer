import requests

# Test GET /api/tasks/suggest/
response_get = requests.get('http://127.0.0.1:8000/api/tasks/suggest/')
print('GET /api/tasks/suggest/:')
print(response_get.json())

# Test POST /api/tasks/analyze/
data = {
    "tasks": [
        { "title": "Fix login bug", "due_date": "2025-11-30", "estimated_hours": 3, "importance": 8, "dependencies": [] },
        { "title": "Write docs", "due_date": "2025-12-01", "estimated_hours": 1, "importance": 5, "dependencies": [] }
    ]
}
response_post = requests.post('http://127.0.0.1:8000/api/tasks/analyze/', json=data)
print('POST /api/tasks/analyze/:')
print("Status code:", response_post.status_code)
print("Raw response:", response_post.text)
