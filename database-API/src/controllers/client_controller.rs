use actix_web::{HttpResponse, Responder, Scope, web};

use crate::database::DbClient;
use crate::entities::address::Address;
use crate::entities::client::Client;

pub fn routes() -> Scope {
    web::scope("/api/client")
        .route("", web::get().to(get))
        .route("", web::post().to(create))
}

/// [POST /client] create new client
async fn create(body: web::Json<Client>, db: web::Data<DbClient>) -> impl Responder {
    println!("{:?}", body);
    match Address::create(&db, body.0.address.postal_code, body.0.address.city, body.0.address.country,
                          body.0.address.street, body.0.address.state, body.0.address.latitude, body.0.address.longitude).await {
        Ok(address) => {
            println!("{:?}", address);
            match Client::create(&db, body.0.name, body.0.tax_number, body.0.phone,
                                 body.0.email, address).await {
                Ok(client) => {
                    println!("{:?}", client);
                    HttpResponse::Created().json(client)
                }
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
