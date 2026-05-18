from deepface import DeepFace

def compare_faces(img1, img2):

    result = DeepFace.verify(
        img1_path=img1,
        img2_path=img2,
        enforce_detection=False
    )

    return {
        "verified": result["verified"],
        "distance": result["distance"]
    }