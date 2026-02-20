from sqlalchemy.orm import Session
from . import models, schemas, auth


# --- USER LOGIC ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        user_name=user.user_name, email=user.email, password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# --- MESSAGE LOGIC ---
def get_messages(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Message)
        .order_by(models.Message.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_message(db: Session, message: schemas.MessageCreate, user_id: int):
    db_message = models.Message(user_message=message.user_message, user_id=user_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_message_by_id(db: Session, message_id: int):
    return db.query(models.Message).filter(models.Message.id == message_id).first()


def update_message(db: Session, db_message: models.Message, new_text: str):
    db_message.user_message = new_text
    db.commit()
    db.refresh(db_message)
    return db_message


def delete_message(db: Session, db_message: models.Message):
    db.delete(db_message)
    db.commit()


# --- COMMENT LOGIC ---
def get_comments_by_message(db: Session, message_id: int):
    return (
        db.query(models.Comment)
        .filter(models.Comment.message_id == message_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )


def create_comment(db: Session, comment: schemas.CommentCreate, user_id: int):
    db_comment = models.Comment(
        comment=comment.comment, message_id=comment.message_id, user_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def get_comment_by_id(db: Session, comment_id: int):
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()


def update_comment(db: Session, db_comment: models.Comment, new_text: str):
    db_comment.comment = new_text
    db.commit()
    db.refresh(db_comment)
    return db_comment


def delete_comment(db: Session, db_comment: models.Comment):
    db.delete(db_comment)
    db.commit()
