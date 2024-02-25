from fastapi import FastAPI, File, UploadFile, status, Response
from fastapi.exceptions import HTTPException
import aiofiles
import os
import uuid

from pydantic import BaseModel
from typing import List, Dict
import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
from waiting import wait

import time

cred = credentials.Certificate("firebase.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

CHUNK_SIZE = 1024 * 1024  # adjust the chunk size as desired
TMP_FILES = './tmp/'
app = FastAPI()

@app.post("/upload")
async def upload(userID: str, file: UploadFile = File(...)):
    path = f'{TMP_FILES}{userID}/'
    try:
        try:
            os.mkdir(TMP_FILES)
        except FileExistsError:
            pass
        try:
            os.mkdir(path)
        except FileExistsError:
            pass

        randfilename = os.path.basename(str(uuid.uuid4()) + '.' + file.filename.split('.')[-1])
        filepath = os.path.join(path, randfilename)
        async with aiofiles.open(filepath, 'wb') as f:
            while chunk := await file.read(CHUNK_SIZE):
                await f.write(chunk)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail='There was an error uploading the file')
    finally:
        await file.close()

    return {"message": f"Successfuly uploaded {randfilename}"}

class WikiRequest(BaseModel):
    wiki: Dict[str, List[str]]

@app.post("/wiki")
async def post_wiki(userID: str, req: WikiRequest):
    user = db.collection("users").document(userID).get().to_dict()
    if 'cursor' not in user:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return
    db.collection("users").document(userID).collection("projects").document(user["cursor"]["project"]).set({
        "wiki": req.wiki
    }, merge=True)
    return

@app.get("/wiki")
async def get_wiki(userID: str, project: str, file: str, chunk: str, response: Response):
    project = db.collection("users").document(userID).collection("projects").document(project).get()
    if not project.exists:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return "Project does not exist"

    project = project.to_dict()
    if 'wiki' not in project:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return "Wiki not generated"

    return project['wiki']


class LinkRequest(BaseModel):
    link: str

@app.post("/link")
async def post_links(userID: str, req: LinkRequest, response: Response):
    user = db.collection("users").document(userID).get().to_dict()
    if 'cursor' not in user:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return
    db.collection("users").document(userID).collection("projects").document(user["cursor"]["project"]).set({
        "links": {
            user['cursor']['file']: {
                user['cursor']['chunk']: firestore.ArrayUnion([req.link])
            }
        }
    }, merge=True)
    return

@app.get("/links")
async def get_links(userID: str, project: str, file: str, chunk: str, response: Response):
    project = db.collection("users").document(userID).collection("projects").document(project).get()
    if not project.exists:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return []

    project = project.to_dict()
    if 'links' not in project:
        return [] 

    if file not in project['links']:
        return []

    if chunk not in project['links'][file]:
        return []
    return project['links'][file][chunk]

class CursorRequest(BaseModel):
    chunk: str
    project: str
    file: str

@app.post("/cursor")
async def cursor(userID: str, req: CursorRequest):
    res = db.collection("users").document(userID).set({
        "cursor": {
            "chunk": req.chunk,
            "project": req.project,
            "file": req.file
        }
    }, merge=True)
    return

class ChunkUpdateRequest(BaseModel):
    old: str
    new: str

@app.patch("/chunk")
async def chunks(userID: str, project: str, file: str, req: ChunkUpdateRequest):
    transaction = db.transaction()
    project_ref = db.collection("users").document(userID).collection("projects").document(project)
    update_chunk(transaction, project_ref, file, req)


@firestore.transactional
def update_chunk(transaction, project_ref, file: str, req: ChunkUpdateRequest):
    project = project_ref.get(transaction=transaction)
    if not project.exists:
        return
    data = project.to_dict()
    #links
    if 'links' in data:
        if file in data['links']:
            if req.old in data['links'][file]:
                links = data['links'][file][req.old]
                del data['links'][file][req.old]
                data['links'][file][req.new] = links
                transaction.update(project_ref, data)
                
