use actix_web::{HttpResponse, Responder, Scope, web};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

use crate::controllers::address_controller::CreateAddressRequest;
use crate::controllers::client_controller::CreateClientRequest;
use crate::database::DbClient;
use crate::entities::address::Address;
use crate::entities::carriage::{Carriage, CarriageItems};
use crate::entities::client::Client;

pub fn routes() -> Scope {
    web::scope("/api/carriage")
        .route("", web::post().to(create))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateTruckSetRequest {
    pub truck: String,
    pub trailer: String,
    pub driver: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateCarriageRequest {
    pub client: CreateClientRequest,
    pub pickup_time: DateTime<Utc>,
    pub drop_time: DateTime<Utc>,
    pub pickup_address: CreateAddressRequest,
    pub drop_address: CreateAddressRequest,
    pub load: Vec<CarriageItems>,
    pub truck_sets: Vec<CreateTruckSetRequest>,
}

/// [POST /carriage] create new carriage
async fn create(body: web::Json<CreateCarriageRequest>, db: web::Data<DbClient>) -> impl Responder {
    let client_id: Thing = match Client::get_by_tax_number(&db, &body.client.tax_number).await {
        Ok(id) => match id {
            None => {
                let address = match Address::get_or_create(&db, body.0.client.address.zipcode,
                                                           body.0.client.address.city, body.0.client.address.country, body.0.client.address.street,
                                                           body.0.client.address.latitude, body.0.client.address.longitude).await {
                    Ok(address) => address,
                    Err(e) => return HttpResponse::InternalServerError().json(e.to_string()),
                };
                let create_client_query =
                    Client::create(&db, body.0.client.name, body.0.client.tax_number,
                                   body.0.client.phone, body.0.client.email, address);
                match create_client_query.await {
                    Ok(c) => c.id.unwrap(),
                    Err(e) => return HttpResponse::InternalServerError().json(e.to_string()),
                }
            }
            Some(client) => client.id.unwrap()
        },
        Err(e) => return HttpResponse::InternalServerError().json(e.to_string()),
    };

    let pickup_address = match Address::get_or_create(&db, body.0.pickup_address.zipcode,
                                                      body.0.pickup_address.city, body.0.pickup_address.country,
                                                      body.0.pickup_address.street, body.0.pickup_address.latitude,
                                                      body.0.pickup_address.longitude).await {
        Ok(a) => a.id.unwrap(),
        Err(e) => return HttpResponse::InternalServerError().json(e.to_string()),
    };

    let drop_address = match Address::get_or_create(&db, body.0.drop_address.zipcode,
                                                    body.0.drop_address.city, body.0.drop_address.country,
                                                    body.0.drop_address.street, body.0.drop_address.latitude,
                                                    body.0.drop_address.longitude).await {
        Ok(a) => a.id.unwrap(),
        Err(e) => return HttpResponse::InternalServerError().json(e.to_string()),
    };

    match Carriage::create(&db, body.0.pickup_time, body.0.drop_time, pickup_address, drop_address, body.0.load,
                           body.0.truck_sets, client_id).await {
        Ok(c) => HttpResponse::Created().json(c),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}