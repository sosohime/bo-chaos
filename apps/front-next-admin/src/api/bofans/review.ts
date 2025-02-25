import { Photo } from "@mono/prisma-client";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://yuanbo.online/rpg/bofans"
    : "http://localhost:3001/api";

function _fetch(url: string, options?: RequestInit) {
  return fetch(`${API_BASE_URL}${url}`, options);
}

export async function getReviewList(): Promise<Photo[]> {
  return await _fetch("/photo/reviewList").then((res) => res.json());
}

export async function batchReviewPass(ids: number[]): Promise<void> {
  return await _fetch("/photo/batchReviewPass", {
    method: "POST",
    body: JSON.stringify({ ids }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}

export async function batchReviewReject(ids: number[]): Promise<void> {
  return await _fetch("/photo/batchReviewReject", {
    method: "POST",
    body: JSON.stringify({ ids }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}
