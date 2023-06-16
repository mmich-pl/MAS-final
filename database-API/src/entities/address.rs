use actix_web::web::Data;
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
use uuid::Uuid;

use crate::database::DbClient;
use crate::error::APIError;

#[derive(Serialize, Deserialize, Debug)]
pub struct Address {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    #[serde(rename(serialize="postalCode", deserialize="postalCode"))]
    pub postal_code: String,
    pub city: String,
    pub country: String,
    pub street: String,
    pub state: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub latitude: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub longitude: Option<f64>,
}

impl Address {
    pub fn new(zipcode: String, city: String, country: String, street: String, state:String,
               latitude: Option<f64>, longitude: Option<f64>) -> Address {
        Address { id: None, postal_code: zipcode, city, country, street, state, latitude, longitude }
    }

    pub async fn create(client: &Data<DbClient>, zipcode: String, city: String, country: String,
                        street: String, state:String, latitude: Option<f64>, longitude: Option<f64>) -> Result<Address, APIError> {
        let uuid_id = Uuid::new_v4();
        let address: Address = Address::new(zipcode, city, country, street, state, latitude, longitude);
        println!("{:?}", address);
        match client.surreal.create(("address", uuid_id.to_string())).content(address).await {
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

    pub(crate) async fn get_or_create(client: &Data<DbClient>, zipcode: String, city: String, country: String,
                                      street: String, state:String, latitude: Option<f64>, longitude: Option<f64>) -> Result<Address, APIError> {
        match client.surreal.query("SELECT * FROM address WHERE city == $city AND street == $street;")
            .bind(("city", &city))
            .bind(("street", &street)).await {
            Ok(mut response) => {
                let ret: Option<Address> = response.take(0)?;
                println!("{:?}", ret);
                match ret {
                    None => Address::create(client, zipcode, city, country, street, state, latitude, longitude).await,
                    Some(add) => Ok(add),
                }
            }
            Err(e) => Err(APIError::Surreal(e))
        }
    }
}