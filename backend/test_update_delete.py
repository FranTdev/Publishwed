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

# 2. Add message
res_msg = requests.post(
    f"{BASE_URL}/messages/",
    json={"user_message": "test message to update"},
    headers=headers,
)
msg_id = res_msg.json()["id"]
print(f"Created msg {msg_id}")

# 3. Update message
res_upd = requests.put(
    f"{BASE_URL}/messages/{msg_id}",
    json={"user_message": "updated msg"},
    headers=headers,
)
print("Update MSG status:", res_upd.status_code)
print(res_upd.text)

# 4. Add comment
res_cmt = requests.post(
    f"{BASE_URL}/comments/",
    json={"message_id": msg_id, "comment": "test comment"},
    headers=headers,
)
cmt_id = res_cmt.json()["id"]

# 5. Update comment
res_upd_cmt = requests.put(
    f"{BASE_URL}/comments/{cmt_id}",
    json={"comment": "updated comment"},
    headers=headers,
)
print("Update COMMENT status:", res_upd_cmt.status_code)
print(res_upd_cmt.text)

# 6. Delete comment
res_del_cmt = requests.delete(f"{BASE_URL}/comments/{cmt_id}", headers=headers)
print("Delete COMMENT status:", res_del_cmt.status_code)
print(res_del_cmt.text)

# 7. Delete msg
res_del_msg = requests.delete(f"{BASE_URL}/messages/{msg_id}", headers=headers)
print("Delete MSG status:", res_del_msg.status_code)
print(res_del_msg.text)
