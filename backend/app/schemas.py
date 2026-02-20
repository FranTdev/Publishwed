from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    user_name: str
    email: EmailStr
    password: str


class MessageCreate(BaseModel):
    user_message: str


class UserOut(BaseModel):
    id: int
    user_name: str
    email: EmailStr

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    message_id: int
    comment: str


class CommentOut(BaseModel):
    id: int
    message_id: int
    user_id: int
    comment: str
    user_name: str | None = None  # Agregamos esto para devolver el nombre

    class Config:
        from_attributes = True


class MessageUpdate(BaseModel):
    user_message: str


class CommentUpdate(BaseModel):
    comment: str


class MessageOut(BaseModel):
    id: int
    user_id: int
    user_message: str
    user_name: str | None = None  # Agregamos esto para devolver el nombre

    class Config:
        from_attributes = True
