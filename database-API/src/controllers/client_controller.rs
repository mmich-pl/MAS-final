use actix_web::{HttpResponse, Responder, Scope, web};
use serde::{Deserialize, Serialize};
use crate::database::DbClient;
use crate::entities::address::Address;
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

    pub zipcode: String,
    pub city: String,
    pub country: String,
    pub street: String,
}

/// [POST /client] create new client
async fn create(body: web::Json<CreateClientRequest>, db: web::Data<DbClient>) -> impl Responder {
    match Address::create(&db, body.0.zipcode, body.0.city, body.0.country, body.0.street).await {
        Ok(address) => {
            match Client::create(&db, body.0.name, body.0.tax_number, body.0.phone,
                                 body.0.email, address).await {
                Ok(client) => HttpResponse::Created().json(client),
                Err(e) => HttpResponse::InternalServerError().json(e.to_string())
            }
        }
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
