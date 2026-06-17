import request from "../lib/request";
import God from "@/images/kowtow/god.png";
import God2 from "@/images/kowtow/god2.jpg";
import God3 from "@/images/kowtow/god3.png";

export function getKowtowStats() {
  return request.get("/kowtows/stats");
}

export function kowtowOnce() {
  return request.post("/kowtows");
}

export function batchKowtow(data: { count: number }): Promise<void> {
  return request.post("/kowtows", data);
}

export function getSwiper(): Promise<any[]> {
  return new Promise((resolve) => {
    resolve([
      {
        img: God,
        ratio: (351 / 476).toFixed(2),
        canvas: {
          canvasX: "20%",
          canvasY: "68%",
          width: 90,
          height: 120,
        },
      },
      {
        img: God2,
        ratio: (256 / 388).toFixed(2),
        canvas: {
          canvasX: "20%",
          canvasY: "18%",
          width: 90,
          height: 120,
        },
      },
      {
        img: God3,
        ratio: (184 / 210).toFixed(2),
        canvas: {
          canvasX: "20%",
          canvasY: "10%",
          width: 90,
          height: 120,
        },
      },
    ]);
  });
}
