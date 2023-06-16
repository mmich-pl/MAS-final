use actix_web::{HttpResponse, Responder, Scope, web};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;

use crate::database::DbClient;
use crate::entities::address::Address;
use crate::entities::carriage::{Carriage, CarriageItems, TruckSet};
use crate::entities::client::Client;
use crate::entities::driver::Driver;
use crate::entities::trailer::Trailer;
use crate::entities::truck::Truck;

use super::driver_controller::CreateDriverRequest;

pub fn routes() -> Scope {
    web::scope("/api/carriage")
        .route("", web::post().to(create))
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct TruckSetReq{
    pub truck: Truck,
    pub trailer: Trailer,
    pub driver: CreateDriverRequest,
    pub load: CarriageItems,
    pub sections: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct CreateCarriageRequest {
    pub client: Client,
    pub all_stops: Vec<Address>,
    pub pickup_time: DateTime<Utc>,
    pub drop_time: DateTime<Utc>,
    #[serde(rename(deserialize="_pickup_address", deserialize="pickup_address"))]
    pub pickup_address: Address,
    #[serde(rename(deserialize="_drop_address", deserialize="drop_address"))]
    pub drop_address: Address,
    pub truck_sets: Vec<TruckSetReq>,
}

/// [POST /carriage] create new carriage
async fn create(body: web::Json<CreateCarriageRequest>, db: web::Data<DbClient>) -> impl Responder {
    let client_id: Thing = match Client::get_by_tax_number(&db, &body.client.tax_number).await {
        Ok(id) => match id {
            None => {
                let address = match Address::get_or_create(&db, body.0.client.address.postal_code,
                                                           body.0.client.address.city, body.0.client.address.country, body.0.client.address.street,
                                                           body.0.client.address.state, body.0.client.address.latitude, body.0.client.address.longitude).await {
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

    let mut drop_address: Option<Thing>= None;
    let mut pickup_address: Option<Thing>=None;
    let mut all = Vec::new();


    for a in body.0.all_stops {
        let address = match Address::get_or_create(&db, a.postal_code, a.city,
                                                   a.country, a.street, a.state, a.latitude, a.longitude).await {
            Ok(a) => a.id.unwrap(),
            Err(e) => return HttpResponse::InternalServerError().json(e.to_string()),
        };

        if a.latitude == body.0.pickup_address.latitude && a.longitude == body.0.pickup_address.longitude {
            pickup_address = Some(address);
        } else if a.latitude == body.0.drop_address.latitude && a.longitude == body.0.drop_address.longitude {
            drop_address = Some(address);
        } else {
            all.push(address);
        }
    }

    if pickup_address.is_none() || drop_address.is_none() {
        return  HttpResponse::InternalServerError().json("Cannot initialize address");
    }

    let mut ts = Vec::new();

    body.0.truck_sets.into_iter().for_each(|s| {
        let t = TruckSet{
            truck: Thing::from(("truck", s.truck.plate.as_str())),
            trailer: Thing::from(("trailer", s.trailer.plate.as_str())),
            driver: Thing::from(("driver", s.driver.employee.personal_id_number.as_str())),
            load: s.load,
            sections: s.sections,
        };
        ts.push(t);
    });

    match Carriage::create(&db, body.0.pickup_time, body.0.drop_time, pickup_address.unwrap(),
                           drop_address.unwrap(), all, ts, client_id).await {
        Ok(c) => HttpResponse::Created().json(c),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}