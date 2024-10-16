from fastapi import FastAPI, Depends, HTTPException, status
from .routes import upload, login, result
from .models import models, schemas, hashing
from .database.database import engine, get_db
from sqlalchemy.orm import Session
import uvicorn, os

app = FastAPI(debug=True)

models.Base.metadata.create_all(bind = engine)

app.include_router(upload.router)
app.include_router(login.router)
app.include_router(result.router)
# app.include_router(image_analysis.router)

# @app.get("/")
# async def root():
#     return {"message": "Welcome to the Fire Protection Review System API"}



# @app.post("/registration", response_model=schemas.ShowUser, status_code=status.HTTP_201_CREATED, tags=['users'])
# async def registration(request: schemas.User, db: Session = Depends(get_db)):
#     if request.password1 != request.password2:
#         raise ValueError("Passwords do not match")
#     new_user = models.User(
#         username = request.name,
#         email = request.email,
#         contact_number = request.contact_number,
#         password = hashing.Hash.bcrypt(request.password1)
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)