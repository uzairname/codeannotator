import { getFilePath, getProjectPath, hashString } from "./chunk-algo";

const API = "http://localhost";
const USERID = "32669483-770a-443c-bbdf-0871b7eb7e6e";

export function updateCursor(chunk: string, project: string, file: string) {
  fetch(API + `/cursor?userID=${USERID}`, {
    method: "POST",
    body: JSON.stringify({
      chunk: chunk,
      project: project,
      file: file
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then((response) => console.log(response.status));
}

export function updateChunk(old: string, newh: string) {
  fetch(API + `/chunk?userID=${USERID}&project=${hashString(getProjectPath())}&file=${hashString(getFilePath())}`, {
    method: "PATCH",
    body: JSON.stringify({
      old: old,
      new: newh
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then((response) => console.log(response.status));
}

export function updateWiki(wiki: any) {
  fetch(API + `/wiki?userID=${USERID}`, {
    method: "POST",
    body: JSON.stringify({
      wiki: wiki
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then((response) => console.log(response.status));
}

export async function getLinks(chunk: string) {
  const project = hashString(getProjectPath());
  const file = hashString(getFilePath());
  console.log(`Project: ${project}`);
  console.log(`File: ${file}`);
  return await fetch(API + `/links?userID=${USERID}&project=${hashString(getProjectPath())}&file=${hashString(getFilePath())}&chunk=${chunk}`, {
    method: "GET", 
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
}
