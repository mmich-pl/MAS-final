use actix_web::{HttpResponse, Responder, Scope, web};
use serde::{Deserialize, Serialize};

use crate::database::DbClient;
use crate::entities::client::Client;

pub fn routes() -> Scope {
    web::scope("/api/client")
        .route("", web::get().to(get))
        .route("", web::post().to(create))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateClientRequest {
    pub name: String,
    pub tax_number: String,
    pub phone: String,
    pub email: String,
}

/// [POST /client] create new client
async fn create(body: web::Json<CreateClientRequest>, db: web::Data<DbClient>) -> impl Responder {
    match Client::create(&db, body.0.name, body.0.tax_number, body.0.phone,
                         body.0.email).await {
        Ok(client) => HttpResponse::Created().json(client),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}

/// [GET /client] get all clients
async fn get(db: web::Data<DbClient>) -> impl Responder {
    match Client::get_all(&db).await {
        Ok(clients) => HttpResponse::Ok().json(clients),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}
