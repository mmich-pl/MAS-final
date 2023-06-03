use std::collections::HashMap;

use actix_web::{HttpResponse, Responder, Scope, web};
use actix_web::web::Query;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::controllers::address_controller::CreateAddressRequest;
use crate::database::DbClient;
use crate::entities::address::Address;
use crate::entities::driver::{AdditionalLicence, Driver, DriverLicence};
use crate::error::APIError;

pub fn routes() -> Scope {
    web::scope("/api/driver")
        .route("", web::get().to(get))
        .route("", web::post().to(create))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateEmployeeRequest {
    pub first_name: String,
    pub last_name: String,
    pub personal_id_number: String,
    pub age: i8,
    pub employment_date: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dismissal_date: Option<DateTime<Utc>>,
    pub phone: String,
    pub email: String,
    pub salary: i32,
    pub address: CreateAddressRequest,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateDriverRequest {
    #[serde(rename = "employee")]
    pub employee: CreateEmployeeRequest,
    pub driver_licence: DriverLicence,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub owned_licences: Option<Vec<String>>,
}

/// [POST /driver] create new driver
async fn create(body: web::Json<CreateDriverRequest>, db: web::Data<DbClient>) -> impl Responder {
    match Address::create(&db, body.0.employee.address.postal_code, body.0.employee.address.city,
                          body.0.employee.address.country, body.0.employee.address.street,
                          body.0.employee.address.latitude, body.0.employee.address.longitude).await {
        Ok(address) => {
            let licence = DriverLicence {
                document_id: body.0.driver_licence.document_id,
                expiration_date: body.0.driver_licence.expiration_date,
                categories: body.0.driver_licence.categories,
            };
            let licences = AdditionalLicence::map_list(body.0.owned_licences);

            let create_statement =
                Driver::create(&db, body.0.employee.first_name, body.0.employee.last_name,
                               body.0.employee.personal_id_number, body.0.employee.age,
                               body.0.employee.employment_date, body.0.employee.dismissal_date,
                               body.0.employee.phone, body.0.employee.email, body.0.employee.salary,
                               address, licence, licences);

            match create_statement.await {
                Ok(client) => HttpResponse::Created().json(client),
                Err(e) => HttpResponse::InternalServerError().json(e.to_string())
            }
        }
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}

/// [GET /driver] get all driver
async fn get(params: Query<HashMap<String, String>>, db: web::Data<DbClient>) -> impl Responder {
    let param = params.0.get("licence");
    let Some(pickup) = params.0.get("pickup_date") else {
        let err = APIError::ParameterError(String::from("pickup_date"));
        return HttpResponse::InternalServerError().json(err.to_string());
    };
    let Some(drop) = params.0.get("drop_date") else {
        let err = APIError::ParameterError(String::from("drop_date"));
        return HttpResponse::InternalServerError().json(err.to_string());
    };

    let mut licences = Vec::new();
    if param.is_some() {
        let l = param.unwrap().split(',').map(str::to_string).collect();
        licences = AdditionalLicence::map_list(Some(l)).unwrap();
    }

    match Driver::get_with_licences(&db, licences, pickup, drop).await {
        Ok(clients) => HttpResponse::Ok().json(clients),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}