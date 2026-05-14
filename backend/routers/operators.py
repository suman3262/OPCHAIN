from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import get_current_operator, require_admin
from core.security import hash_password
from models.operator import Operator
from schemas.operator import OperatorCreate, OperatorOut, OperatorPasswordChange, OperatorUpdate

router = APIRouter(prefix="/api/operators", tags=["operators"])


@router.get("", response_model=list[OperatorOut])
def list_operators(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Operator).all()


@router.post("", response_model=OperatorOut, status_code=status.HTTP_201_CREATED)
def create_operator(body: OperatorCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(Operator).filter(Operator.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    op = Operator(
        username=body.username,
        display_name=body.display_name,
        password_hash=hash_password(body.password),
        role=body.role,
    )
    db.add(op)
    db.commit()
    db.refresh(op)
    return op


@router.put("/{op_id}", response_model=OperatorOut)
def update_operator(op_id: str, body: OperatorUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    op = db.query(Operator).filter(Operator.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operator not found")
    if body.display_name is not None:
        op.display_name = body.display_name
    if body.role is not None:
        op.role = body.role
    db.commit()
    db.refresh(op)
    return op


@router.put("/{op_id}/password")
def change_password(
    op_id: str,
    body: OperatorPasswordChange,
    db: Session = Depends(get_db),
    current: Operator = Depends(get_current_operator),
):
    if current.role != "admin" and current.id != op_id:
        raise HTTPException(status_code=403, detail="Cannot change another operator's password")
    op = db.query(Operator).filter(Operator.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operator not found")
    op.password_hash = hash_password(body.new_password)
    db.commit()
    return {"detail": "Password changed"}


@router.delete("/{op_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_operator(op_id: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    op = db.query(Operator).filter(Operator.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operator not found")
    db.delete(op)
    db.commit()
