from fastapi import FastAPI, UploadFile, File
import shutil
from face_match import compare_faces

app = FastAPI()

@app.get("/")
def home():
    return {"message": "ShadowTwin API Running"}

@app.post("/compare")
async def compare(
    img1: UploadFile = File(...),
    img2: UploadFile = File(...)
):

    path1 = f"uploads/{img1.filename}"
    path2 = f"uploads/{img2.filename}"

    with open(path1, "wb") as buffer:
        shutil.copyfileobj(img1.file, buffer)

    with open(path2, "wb") as buffer:
        shutil.copyfileobj(img2.file, buffer)

    result = compare_faces(path1, path2)

    return result