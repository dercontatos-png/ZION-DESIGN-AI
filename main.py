import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from storage_router import router as storage_router

app = FastAPI(
    title="Design Builder Storage API",
    description="FastAPI service for secure asset and storage handling.",
    version="1.0.0",
)

# Enable CORS for local development and frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the storage router
app.include_router(storage_router)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
