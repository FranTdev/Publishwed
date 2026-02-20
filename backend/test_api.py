import requests
import random
import string
import time

BASE_URL = "http://127.0.0.1:8000"


def random_string(length=8):
    return "".join(random.choices(string.ascii_lowercase, k=length))


def test_full_flow():
    # 1. Crear Usuario
    username = random_string()
    email = f"{username}@example.com"
    password = "password123"

    response = requests.post(
        f"{BASE_URL}/users/",
        json={"user_name": username, "email": email, "password": password},
    )
    assert response.status_code == 201, f"Failed create user: {response.text}"
    user_data = response.json()

    # 2. Login
    response = requests.post(
        f"{BASE_URL}/login",
        data={
            "username": email,
            "password": password,
        },  # OAuth2 spec requires 'username'
    )
    assert response.status_code == 200, f"Failed login: {response.text}"
    token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Message
    message_text = "Hello world from tests!"
    response = requests.post(
        f"{BASE_URL}/messages/", json={"user_message": message_text}, headers=headers
    )
    assert response.status_code == 201, f"Failed create message: {response.text}"
    message_id = response.json()["id"]

    # 4. Get messages
    response = requests.get(f"{BASE_URL}/messages/")
    assert response.status_code == 200

    # 5. Create Comment
    comment_text = "Test comment"
    response = requests.post(
        f"{BASE_URL}/comments/",
        json={"message_id": message_id, "comment": comment_text},
        headers=headers,
    )
    assert response.status_code == 201, f"Failed create comment: {response.text}"
    comment_id = response.json()["id"]

    # 6. Read Comments
    response = requests.get(f"{BASE_URL}/messages/{message_id}/comments/")
    assert response.status_code == 200
    assert len(response.json()) > 0

    # 7. Update Comment
    new_comment_text = "Updated comment"
    response = requests.put(
        f"{BASE_URL}/comments/{comment_id}",
        json={"comment": new_comment_text},
        headers=headers,
    )
    assert response.status_code == 200, f"Failed update comment: {response.text}"

    # 8. Delete Comment
    response = requests.delete(f"{BASE_URL}/comments/{comment_id}", headers=headers)
    assert response.status_code == 204, f"Failed delete comment: {response.text}"

    # 9. Update Message
    response = requests.put(
        f"{BASE_URL}/messages/{message_id}",
        json={"user_message": "Updated msg"},
        headers=headers,
    )
    assert response.status_code == 200

    # 10. Delete Message
    response = requests.delete(f"{BASE_URL}/messages/{message_id}", headers=headers)
    assert response.status_code == 204

    print("✅ Todas las pruebas de CRUD y enpoint protegidos pasaron con éxito.")


if __name__ == "__main__":
    # give the server a sec if it's hot reloading
    time.sleep(1)
    test_full_flow()
