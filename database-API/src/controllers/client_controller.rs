use actix_web::{HttpResponse, Responder, Scope, web};
use serde::{Deserialize, Serialize};

use crate::controllers::address_controller::CreateAddressRequest;
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
    pub address: CreateAddressRequest,
}

/// [POST /client] create new client
async fn create(body: web::Json<CreateClientRequest>, db: web::Data<DbClient>) -> impl Responder {
    match Address::create(&db, body.0.address.postal_code, body.0.address.city, body.0.address.country,
                          body.0.address.street, body.0.address.latitude, body.0.address.longitude).await {
        Ok(address) => {
            match Client::create(&db, body.0.name, body.0.tax_number, body.0.phone,
                                 body.0.email, address).await {
                Ok(address) => HttpResponse::Created().json(address),
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
