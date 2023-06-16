use std::collections::HashMap;

use actix_web::{HttpResponse, Responder, Scope, web};
use actix_web::web::Query;

use crate::database::DbClient;
use crate::entities::truck::Truck;
use crate::error::APIError;

pub fn routes() -> Scope {
    web::scope("/api/truck")
        .route("", web::post().to(create))
        .route("", web::get().to(get_available))
}


/// [POST /truck] create new truck
async fn create(body: web::Json<Truck>, db: web::Data<DbClient>) -> impl Responder {
    match Truck::create(&db, body.0.plate, body.0.axis_number, body.0.mileage,
                        body.0.brand, body.0.purchase_date).await {
        Ok(truck) => HttpResponse::Created().json(truck),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}

/// [GET /truck] get all trucks that can be assigned to new carriage between given dates
async fn get_available(params: Query<HashMap<String, String>>, db: web::Data<DbClient>) -> impl Responder {
    let Some(pickup) = params.0.get("pickup_date") else {
        let err = APIError::ParameterError(String::from("pickup_date"));
        return HttpResponse::InternalServerError().json(err.to_string());
    };
    let Some(drop) = params.0.get("drop_date") else {
        let err = APIError::ParameterError(String::from("drop_date"));
        return HttpResponse::InternalServerError().json(err.to_string());
    };

    match Truck::get_within_date_limit(&db, pickup, drop).await {
        Ok(clients) => HttpResponse::Ok().json(clients),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}