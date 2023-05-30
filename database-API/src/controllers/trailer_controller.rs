use actix_web::{HttpResponse, Responder, Scope, web};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::database::DbClient;
use crate::entities::trailer::Trailer;

pub fn routes() -> Scope {
    web::scope("/api/trailer")
        .route("", web::get().to(get))
        .route("", web::post().to(create))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateTrailerRequest {
    pub plate: String,
    pub axis_number: i8,
    pub brand: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub purchase_date: Option<DateTime<Utc>>,
    pub carrying_capacity: i32,
    pub trailer_type: String,
    #[serde(skip_serializing_if = "Option::is_none", rename(serialize="cargo_type_name", deserialize="cargo_type_name"))]
    pub cargo_type:Option<Vec<String>>
}

/// [POST /trailer] create new trailer
async fn create(body: web::Json<CreateTrailerRequest>, db: web::Data<DbClient>) -> impl Responder {
    match Trailer::create(&db, body.0.plate, body.0.axis_number,
                          body.0.brand, body.0.purchase_date,
                          body.0.carrying_capacity, body.0.trailer_type, ).await {
        Ok(address) => HttpResponse::Created().json(address),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}

/// [GET /trailer] get all trailers
async fn get(db: web::Data<DbClient>) -> impl Responder {
    match Trailer::get_all(&db).await {
        Ok(trailer) => HttpResponse::Ok().json(trailer),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}