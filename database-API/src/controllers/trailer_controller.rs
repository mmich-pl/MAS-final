use std::collections::HashMap;

use actix_web::{HttpResponse, Responder, Scope, web};
use actix_web::web::Query;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::database::DbClient;
use crate::entities::carriage::CarriageItems;
use crate::entities::trailer::Trailer;
use crate::error::APIError;

pub fn routes() -> Scope {
    web::scope("/api/trailer")
        .route("", web::post().to(create))
        .route("/filter", web::post().to(get_with_matching_cargo))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateTrailerRequest {
    pub plate: String,
    pub axis_number: u8,
    pub brand: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub purchase_date: Option<DateTime<Utc>>,
    pub carrying_capacity: u8,
    pub trailer_type: String,
    #[serde(skip_serializing_if = "Option::is_none", rename(serialize = "cargo_type_name", deserialize = "cargo_type_name"))]
    pub cargo_type: Option<Vec<String>>,
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

/// [POST /trailer?pickup_date=&drop_date=] get all driver
async fn get_with_matching_cargo(params: Query<HashMap<String, String>>, body: web::Json<Vec<CarriageItems>>, db: web::Data<DbClient>) -> impl Responder {
    println!("{:?}", &body.0);

    let load = body.0;

    let Some(pickup) = params.0.get("pickup_date") else {
        let err = APIError::ParameterError(String::from("pickup_date"));
        return HttpResponse::InternalServerError().json(err.to_string());
    };
    let Some(drop) = params.0.get("drop_date") else {
        let err = APIError::ParameterError(String::from("drop_date"));
        return HttpResponse::InternalServerError().json(err.to_string());
    };

    match Trailer::get_best_matching_trailer(&db, load, pickup, drop).await {
        Ok(clients) => HttpResponse::Ok().json(clients),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}