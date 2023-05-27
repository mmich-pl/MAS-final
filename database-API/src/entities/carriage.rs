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
    pub(crate) async fn create(client: &Data<DbClient>, pickup_time: DateTime<Utc>,
                               pickup_address: Thing, drop_address: Thing,
                               load: Vec<CarriageItems>, truck_sets: Vec<CreateTruckSetRequest>, client_id: Thing)
                               -> Result<Carriage, APIError> {
        let uuid_id = Uuid::new_v4().to_string();

        let transaction = format!(
            "BEGIN TRANSACTION;
            CREATE carriage SET id = $id, pickup_time = type::datetime($date), load = {}, truck_sets={}; \
            RELATE $client->order->carriage:⟨{}⟩;\
            RELATE carriage:⟨{}⟩->pickup->$pickup_address;\
            RELATE carriage:⟨{}⟩->drop->$drop_address;\
            COMMIT TRANSACTION;",
            serde_json::to_string(&load).unwrap(),
            serde_json::to_string(&truck_sets).unwrap(),
            &uuid_id, &uuid_id, &uuid_id);


        match client.surreal.query(transaction)
            .bind(("id", &uuid_id))
            .bind(("date", pickup_time.to_string()))
            .bind(("client", client_id))
            .bind(("pickup_address", &pickup_address))
            .bind(("drop_address", &drop_address))
            .await {
            Ok(mut resp) => {
                let carriage: Option<Carriage> = resp.take(0)?;
                Ok(carriage.unwrap())
            }
            Err(e) => {
                client.surreal.delete(("address", &pickup_address.to_string())).await?;
                client.surreal.delete(("address", &drop_address.to_string())).await?;
                Err(APIError::Surreal(e))
            }
        }
    }
}