import request from "../lib/request";

type SystemType = "history" | "travel" | "tease";

export function getPhotoBySystem(system: SystemType) {
  return request.get(`/photo/list/${system}`);
}

export function getPhotoById(id: number) {
  return request.get(`/photo/get/${id}`);
}

export function votePhoto(photoId: number) {
  return request.post("/photo/vote", {
    photoId,
  });
}

export function cancelPhotoVote(photoId: number) {
  return request.post("/photo/cancel_vote", {
    photoId,
  });
}

// export function kowtowOnce() {
//   return request.post("/kowtow/kowtowOnce");
// }
