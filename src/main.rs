#[macro_use]
extern crate rocket;
use rocket::request::{FromRequest, Outcome, Request};

struct Host<'r>(&'r str);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Host<'r> {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        match req.headers().get_one("x-real-ip") {
            None => Outcome::Success(Host("")),
            Some(key) => Outcome::Success(Host(key)),
        }
    }
}

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[get("/ip")]
fn ip(ip: Host) -> String {
    ip.0.to_string()
}

// 获取请求头，打印请求IP
#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, ip])
}
