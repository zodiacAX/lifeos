from backend.app.core.security import hash_password, verify_password

def test_password_hash_roundtrip():
    encoded=hash_password('correct-horse')
    assert encoded != 'correct-horse'
    assert verify_password('correct-horse', encoded)
    assert not verify_password('wrong', encoded)
