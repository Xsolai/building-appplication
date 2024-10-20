from fastapi import FastAPI
from .routes import upload, login, result, upload_B_plan
from .models import models
from .database.database import engine
import uvicorn
app = FastAPI(debug=True)

models.Base.metadata.create_all(bind = engine)

app.include_router(upload.router)
app.include_router(login.router)
app.include_router(result.router)
app.include_router(upload_B_plan.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Fire Protection Review System API"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)