use actix_web::{HttpResponse, Responder, Scope, web};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::database::DbClient;
use crate::entities::truck::Truck;

pub fn routes() -> Scope {
    web::scope("/api/truck")
        .route("", web::get().to(get))
        .route("", web::post().to(create))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateTruckRequest {
    pub plate: String,
    pub axis_number: i8,
    pub mileage: i32,
    pub brand: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub purchase_date: Option<DateTime<Utc>>,
}

/// [POST /truck] create new truck
async fn create(body: web::Json<CreateTruckRequest>, db: web::Data<DbClient>) -> impl Responder {
    match Truck::create(&db, body.0.plate, body.0.axis_number, body.0.mileage,
                        body.0.brand, body.0.purchase_date).await {
        Ok(truck) => HttpResponse::Created().json(truck),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}

/// [GET /truck] get all trucks
async fn get(db: web::Data<DbClient>) -> impl Responder {
    match Truck::get_all(&db).await {
        Ok(trucks) => HttpResponse::Ok().json(trucks),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}