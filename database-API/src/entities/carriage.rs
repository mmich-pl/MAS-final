use actix_web::web::Data;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
use uuid::Uuid;

use crate::controllers::carriage_controller::CreateTruckSetRequest;
use crate::database::DbClient;
use crate::error::APIError;

#[derive(Serialize, Deserialize, Debug)]
pub struct TruckSet {
    pub truck: Thing,
    pub trailer: Thing,
    pub driver: Thing,
}


#[derive(Serialize, Deserialize, Debug)]
pub struct CarriageItems {
    pub cargo_type: String,
    pub amount: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct Carriage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub pickup_time: DateTime<Utc>,

    pub load: Vec<CarriageItems>,
    pub truck_sets: Vec<TruckSet>,
}

impl Carriage {
    pub(crate) fn new(pickup_time: DateTime<Utc>, load: Vec<CarriageItems>,
                      truck_sets: Vec<TruckSet>) -> Carriage {
        Carriage { id: None, pickup_time, load, truck_sets }
    }

    pub(crate) async fn create(client: &Data<DbClient>, pickup_time: DateTime<Utc>,
                               pickup_address: Thing, drop_address: Thing,
                               load: Vec<CarriageItems>, truck_sets: Vec<CreateTruckSetRequest>, client_id: Thing)
                               -> Result<Carriage, APIError> {
        let uuid_id = Uuid::new_v4().to_string();

        let mut transaction = String::from("BEGIN TRANSACTION;");

        for s in truck_sets.iter() {
            transaction.push_str(&*format!("UPDATE {} SET available=false;", s.truck));
            transaction.push_str(&*format!("UPDATE {} SET available=false;", s.trailer));
            transaction.push_str(&*format!("UPDATE {} SET available=false;", s.driver));
        }

        transaction.push_str(&*format!("CREATE carriage SET id = $id, \
        pickup_time = type::datetime($date), load = {}, truck_sets={};",
                                       serde_json::to_string(&load).unwrap(),
                                       serde_json::to_string(&truck_sets).unwrap() ));
        transaction.push_str("COMMIT TRANSACTION;");

        match client.surreal.query(transaction)
            .bind(("id", &uuid_id))
            .bind(("date", pickup_time.to_string()))
            .await {
            Ok(resp) => {
                println!("{:?}", resp);

                client.surreal.query(format!("RELATE $client->order->carriage:⟨{}⟩;", &uuid_id))
                    .bind(("client", client_id)).await?;
                client.surreal.query(format!("RELATE carriage:⟨{}⟩->pickup->$address;", &uuid_id))
                    .bind(("address", pickup_address)).await?;
                client.surreal.query(format!("RELATE  carriage:⟨{}⟩->drop->$address;", &uuid_id))
                    .bind(("address", drop_address)).await?;
                let carriage: Option<Carriage> = client.surreal.select(("carriage", &uuid_id)).await?;
                Ok(carriage.unwrap())
            }
            Err(e) => { Err(APIError::Surreal(e)) }
        }
    }
}