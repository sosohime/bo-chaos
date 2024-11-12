#[macro_use] extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[get("/<_..>")]
fn everything() -> &'static str {
    "I'm a teapot"
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, everything])
}