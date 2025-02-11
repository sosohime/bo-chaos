import request from "../lib/request";

type SystemType = "history" | "travel" | "tease";

export function getPhotoBySystem(system: SystemType) {
  return request.get(`/photo/list/${system}`);
}

// export function kowtowOnce() {
//   return request.post("/kowtow/kowtowOnce");
// }
