mod entities;
mod controllers;
mod error;
pub(crate) mod database;

use std::sync::Arc;
use actix_web::middleware::Logger;
use actix_web::{get, App, HttpResponse, HttpServer, Responder};
use actix_web::web::Data;
use serde::Serialize;
use crate::controllers::{address_controller, cargo_controller, client_controller, trailer_controller};
use crate::database::{DbClient, init_database, init_env};

#[derive(Serialize)]
pub struct GenericResponse {
    pub status: String,
    pub message: String,
}

#[get("/api/healthchecker")]
async fn health_checker_handler() -> impl Responder {
    const MESSAGE: &str = "Build Simple CRUD API with Rust and Actix Web";

    let response_json = &GenericResponse {
        status: "success".to_string(),
        message: MESSAGE.to_string(),
    };
    HttpResponse::Ok().json(response_json)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "actix_web=info");
    }
    env_logger::init();
    init_env();
    let db_client = init_database().await;

    println!("🚀 Server started successfully");


    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(DbClient {
                surreal: Arc::new(db_client.clone())
            }))
            .service(health_checker_handler)
            .service(address_controller::routes())
            .service(cargo_controller::routes())
            .service(client_controller::routes())
            .service(trailer_controller::routes())
            .wrap(Logger::default())
    })
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
