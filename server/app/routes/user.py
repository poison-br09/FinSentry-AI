from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .. import models, schemas, auth, db

router = APIRouter()

def get_db():
    db_ = db.SessionLocal()
    try:
        yield db_
    finally:
        db_.close()


@router.post("/signup")
def signup(user: schemas.UserCreate, request: Request, db: Session = Depends(get_db)):
    try:
        if db.query(models.User).filter(models.User.email == user.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        new_user = models.User(
            email=user.email,
            password_hash=auth.hash_password(user.password)
        )
        db.add(new_user)
        db.commit()
        return {"msg": "Signup successful"}
    except Exception as e:
        print(f"Error: {e}")
        raise


@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_token({"sub": str(db_user.id)})
    return {"access_token": token}
