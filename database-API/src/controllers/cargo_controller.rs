use actix_web::{HttpResponse, Responder, Scope, web};
use serde::{Deserialize, Serialize};

use crate::database::DbClient;
use crate::entities::cargo::Cargo;

pub fn routes() -> Scope {
    web::scope("/api/cargo")
        .route("", web::get().to(get))
        .route("", web::post().to(create))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateCargoRequest {
    pub name: String,
    pub unit: String,
    #[serde(rename(serialize = "type_name", deserialize = "type_name"))]
    pub cargo_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required_licences: Option<Vec<String>>,
}

/// [POST /cargo] create new cargo
async fn create(body: web::Json<CreateCargoRequest>, db: web::Data<DbClient>) -> impl Responder {
    match Cargo::create(&db, body.0.name, body.0.unit,
                        body.0.cargo_type, body.0.required_licences, ).await {
        Ok(address) => HttpResponse::Created().json(address),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}

/// [GET /cargo] get all cargo
async fn get(db: web::Data<DbClient>) -> impl Responder {
    match Cargo::get_all(&db).await {
        Ok(addresses) => HttpResponse::Ok().json(addresses),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}