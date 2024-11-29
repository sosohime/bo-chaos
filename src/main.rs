#[macro_use]
extern crate rocket;
use rocket::request::{FromRequest, Outcome, Request};

struct ClientInfo<'r> {
    client_ip: &'r str,
    user_agent: &'r str,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for ClientInfo<'r> {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        // 获取client_ip和user_agent
        let client_ip = req
            .headers()
            .get_one("x-forwarded-for")
            .unwrap_or("unknown");
        let user_agent = req.headers().get_one("user-agent").unwrap_or("unknown");
        Outcome::Success(ClientInfo {
            client_ip,
            user_agent,
        })
    }
}

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[get("/ip")]
fn ip(client_info: ClientInfo) -> String {
    format!(
        "client_ip: {}, user_agent: {}",
        client_info.client_ip, client_info.user_agent
    )
}

// 获取请求头，打印请求IP
#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, ip])
}
