import requests

BASE_URL = "http://127.0.0.1:8000"

# 1. Login
response = requests.post(
    f"{BASE_URL}/login",
    data={"username": "test_final@example.com", "password": "pass123"},
)
print("Login status:", response.status_code)
if response.status_code != 200:
    print(response.text)
    exit(1)

token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# 2. Get messages to find one to comment on
res_msg = requests.get(f"{BASE_URL}/messages/")
messages = res_msg.json()

if not messages:
    print("No messages found.")
    exit(1)

msg_id = messages[0]["id"]
print("Target message ID:", msg_id)

# 3. Add comment
res_comment = requests.post(
    f"{BASE_URL}/comments/",
    json={"message_id": msg_id, "comment": "This is a python test comment"},
    headers=headers,
)
print("Add comment status:", res_comment.status_code)
print(res_comment.text)
