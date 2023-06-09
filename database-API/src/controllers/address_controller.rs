use actix_web::{HttpResponse, Responder, Scope, web};

use crate::database::DbClient;
use crate::entities::address::Address;

pub fn routes() -> Scope {
    web::scope("/api/address")
        .route("", web::get().to(get))
        .route("/{id}", web::get().to(get_by_id))
        .route("", web::post().to(create))
}


/// [POST /address] create new address
async fn create(body: web::Json<Address>, db: web::Data<DbClient>) -> impl Responder {
    match Address::create(&db, body.0.postal_code, body.0.city, body.0.country,
                          body.0.street, body.0.state, body.0.latitude, body.0.longitude).await {
        Ok(address) => HttpResponse::Created().json(address),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}

/// [GET /address] get all addresses
async fn get(db: web::Data<DbClient>) -> impl Responder {
    match Address::get_all(&db).await {
        Ok(addresses) => HttpResponse::Ok().json(addresses),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}

/// [GET /address/{id}] get address with matching id
async fn get_by_id(id: web::Path<String>, db: web::Data<DbClient>) -> impl Responder {
    match Address::get_by_id(&db, format!("{id}")).await {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}