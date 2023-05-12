use actix_web::web::Data;
use serde::{Deserialize, Serialize};
use surrealdb::sql::{Thing};
use crate::database::DbClient;
use crate::error::APIError;

#[derive(Serialize, Deserialize, Debug)]
pub struct Address {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub zipcode: String,
    pub city: String,
    pub country: String,
    pub street: String,
}

impl Address {
    pub fn new(zipcode: String, city: String, country: String, street: String) -> Address {
        Address { id: None, zipcode, city, country, street }
    }

    pub async fn create(client: &Data<DbClient>, zipcode: String, city: String, country: String,
                        street: String) -> Result<Address, APIError> {
        let address: Address = Address::new(zipcode, city, country, street);
        match client.surreal.create("address").content(address).await {
            Ok(address) => Ok(address),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_all(client: &Data<DbClient>) -> Result<Vec<Address>, APIError> {
        match client.surreal.select("address").await {
            Ok(response) => Ok(response),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_by_id(client: &Data<DbClient>, id: String) -> Result<Address, APIError> {
        match client.surreal.select(("address", id)).await {
            Ok(response) => Ok(response),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }
}