from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError

from . import models, schemas, crud, auth
from .database import SessionLocal, engine

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Drop tables and create (If you strictly need fresh start to avoid alembic or migrations)
# It's better to keep it as create_all, skipping drops so we don't break logic. PostgreSQL creates what is missing.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Social Network Backend API (FastAPI + PostgreSQL)")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


# --- AUTENTICACIÓN Y USUARIOS ---
@app.post("/login", description="Inicia sesión y obtiene un token Bearer")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Correo o contraseña incorrectos",
        )

    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post(
    "/users/",
    response_model=schemas.UserOut,
    status_code=status.HTTP_201_CREATED,
    description="Registra un nuevo usuario",
)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )
    return crud.create_user(db=db, user=user)


@app.get(
    "/users/me/",
    response_model=schemas.UserOut,
    description="Obtiene los datos del usuario logueado actualmente",
)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# --- MENSAJES (POSTS) ---
@app.get(
    "/messages/",
    response_model=list[schemas.MessageOut],
    description="Obtiene la lista de los últimos mensajes del feed incorporando el nombre del usuario",
)
def read_messages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    messages = crud.get_messages(db, skip=skip, limit=limit)
    response_list = []
    for msg in messages:
        # Transformamos el objeto ORM en dict para inyectarle dinámicamente el user_name
        response_data = {
            "id": msg.id,
            "user_id": msg.user_id,
            "user_message": msg.user_message,
            "user_name": msg.user.user_name if msg.user else "Usuario Desconocido",
        }
        response_list.append(response_data)
    return response_list


@app.post(
    "/messages/",
    response_model=schemas.MessageOut,
    status_code=status.HTTP_201_CREATED,
    description="Publica un nuevo mensaje en el feed",
)
def create_message(
    message_input: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_msg = crud.create_message(db=db, message=message_input, user_id=current_user.id)
    return {
        "id": new_msg.id,
        "user_id": new_msg.user_id,
        "user_message": new_msg.user_message,
        "user_name": current_user.user_name,
    }


@app.put(
    "/messages/{message_id}",
    response_model=schemas.MessageOut,
    description="Edita un mensaje existente (Solamente el creador)",
)
def update_message(
    message_id: int,
    message_update: schemas.MessageUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_message = crud.get_message_by_id(db, message_id)
    if not db_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado"
        )

    if db_message.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este mensaje",
        )

    updated_msg = crud.update_message(db, db_message, message_update.user_message)
    return {
        "id": updated_msg.id,
        "user_id": updated_msg.user_id,
        "user_message": updated_msg.user_message,
        "user_name": current_user.user_name,
    }


@app.delete(
    "/messages/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Elimina un mensaje existente (Solamente el creador)",
)
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_message = crud.get_message_by_id(db, message_id)
    if not db_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado"
        )
    if db_message.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este mensaje",
        )

    crud.delete_message(db, db_message)
    return None


# --- COMENTARIOS ---
@app.get(
    "/messages/{message_id}/comments/",
    response_model=list[schemas.CommentOut],
    description="Obtiene todos los comentarios de un mensaje",
)
def read_comments(message_id: int, db: Session = Depends(get_db)):
    comments = crud.get_comments_by_message(db, message_id=message_id)
    response_list = []
    for comment in comments:
        response_list.append(
            {
                "id": comment.id,
                "message_id": comment.message_id,
                "user_id": comment.user_id,
                "comment": comment.comment,
                "user_name": comment.user.user_name if comment.user else "Usuario",
            }
        )
    return response_list


@app.post(
    "/comments/",
    response_model=schemas.CommentOut,
    status_code=status.HTTP_201_CREATED,
    description="Agrega un comentario a un mensaje",
)
def post_comment(
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_comment = crud.create_comment(db=db, comment=comment, user_id=current_user.id)
    return {
        "id": new_comment.id,
        "message_id": new_comment.message_id,
        "user_id": new_comment.user_id,
        "comment": new_comment.comment,
        "user_name": current_user.user_name,
    }


@app.put(
    "/comments/{comment_id}",
    response_model=schemas.CommentOut,
    description="Edita un comentario existente (Solamente el creador)",
)
def update_comment(
    comment_id: int,
    comment_update: schemas.CommentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_comment = crud.get_comment_by_id(db, comment_id)
    if not db_comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comentario no encontrado"
        )

    if db_comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este comentario",
        )

    updated_comment = crud.update_comment(db, db_comment, comment_update.comment)
    return {
        "id": updated_comment.id,
        "message_id": updated_comment.message_id,
        "user_id": updated_comment.user_id,
        "comment": updated_comment.comment,
        "user_name": current_user.user_name,
    }


@app.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Elimina un comentario existente (Solamente el creador)",
)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_comment = crud.get_comment_by_id(db, comment_id)
    if not db_comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comentario no encontrado"
        )
    if db_comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este comentario",
        )

    crud.delete_comment(db, db_comment)
    return None
