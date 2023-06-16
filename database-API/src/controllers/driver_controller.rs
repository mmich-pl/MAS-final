use std::collections::HashMap;

use actix_web::{HttpResponse, Responder, Scope, web};
use actix_web::web::Query;
use serde::{Deserialize, Serialize};

use crate::database::DbClient;
use crate::entities::address::Address;
use crate::entities::driver::{AdditionalLicence, Driver, DriverLicence, State};
use crate::entities::employee::Employee;
use crate::error::APIError;

pub fn routes() -> Scope {
    web::scope("/api/driver")
        .route("", web::get().to(get))
        .route("", web::post().to(create))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateDriverRequest {
    #[serde(flatten)]
    pub employee: Employee,
    pub driver_licence: DriverLicence,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub owned_licences: Option<Vec<String>>,
    pub driver_state: State,
}

/// [POST /driver] create new driver
async fn create(body: web::Json<CreateDriverRequest>, db: web::Data<DbClient>) -> impl Responder {
    match Address::create(&db, body.0.employee.address.postal_code, body.0.employee.address.city,
                          body.0.employee.address.country, body.0.employee.address.street,
                          body.0.employee.address.state, body.0.employee.address.latitude, body.0.employee.address.longitude).await {
        Ok(address) => {
            let licence = DriverLicence {
                document_id: body.0.driver_licence.document_id,
                expiration_date: body.0.driver_licence.expiration_date,
                categories: body.0.driver_licence.categories,
            };
            let licences = AdditionalLicence::map_list(body.0.owned_licences);

            let create_statement =
                Driver::create(&db, body.0.employee.first_name, body.0.employee.last_name,
                               body.0.employee.personal_id_number, body.0.employee.maiden_name,body.0.employee.gender, body.0.employee.birth_date,
                               body.0.employee.employment_date,  body.0.employee.dismissal_date,
                               body.0.employee.phone, body.0.employee.email, body.0.employee.salary,
                               address, licence, licences, body.0.driver_state);

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
    let expected_number = params.0.get("number").unwrap().parse::<usize>().unwrap();

    let mut licences = Vec::new();
    if param.is_some() {
        let l = param.unwrap().split(',').map(str::to_string).collect();
        licences = AdditionalLicence::map_list(Some(l)).unwrap();
    }

    match Driver::get_with_licences(&db, licences, pickup, drop).await {
        Ok(drivers) => {
            if drivers.len() < expected_number {
                HttpResponse::InternalServerError().json(
                    APIError::CantMatch(format!("Not enough drivers: Now there is only {} \
                    drivers but to realize carriage {} is necessary", drivers.len(), expected_number)).to_string())
            } else {
                HttpResponse::Ok().json(drivers)
            }
        }
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}