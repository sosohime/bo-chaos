import request from "../lib/request";

export function getKowtowStats() {
  return request.get("/kowtow/stats");
}

export function kowtowOnce() {
  return request.post("/kowtow/kowtowOnce");
}
