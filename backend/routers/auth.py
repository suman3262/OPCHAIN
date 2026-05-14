from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import get_current_operator
from core.security import create_access_token, verify_password
from models.operator import Operator
from schemas.auth import Token
from schemas.operator import OperatorLogin, OperatorOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(body: OperatorLogin, db: Session = Depends(get_db)):
    operator = db.query(Operator).filter(Operator.username == body.username).first()
    if not operator or not verify_password(body.password, operator.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": operator.id, "role": operator.role})
    return Token(access_token=token)


@router.post("/logout")
def logout():
    return {"detail": "Logged out"}


@router.get("/me", response_model=OperatorOut)
def me(current_operator: Operator = Depends(get_current_operator)):
    return current_operator
