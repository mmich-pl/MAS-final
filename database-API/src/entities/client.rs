use actix_web::web::Data;
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
use uuid::Uuid;

use crate::database::DbClient;
use crate::entities::address::Address;
use crate::error::APIError;

#[derive(Serialize, Deserialize, Debug)]
pub struct Client {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub name: String,
    pub tax_number: String,
    pub phone: String,
    pub email: String,
    pub address: Address,
}

impl Client {
    pub fn new(name: String, tax_number: String, phone: String, email: String, address: Address) -> Client {
        Client { id: None, name, tax_number, phone, email, address }
    }

    pub async fn create(dbclient: &Data<DbClient>, name: String, tax_number: String,
                        phone: String, email: String, address: Address) -> Result<Client, APIError> {
        let client: Client = Client::new(name, tax_number, phone, email, address);
        let uuid_id = Uuid::new_v4();
        match dbclient.surreal.create(("client", uuid_id.to_string())).content(client).await {
            Ok(c) => Ok(c),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_all(client: &Data<DbClient>) -> Result<Vec<Client>, APIError> {
        match client.surreal.select("client").await {
            Ok(response) => Ok(response),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_by_tax_number(client: &Data<DbClient>, number: &str)
                                          -> Result<Option<Client>, APIError> {
        let query = client.surreal
            .query("SELECT * FROM client WHERE tax_number == $tax ;")
            .bind(("tax", number));

        match query.await {
            Ok(mut response) => {
                let ret: Option<Client> = response.take(0)?;
                Ok(ret)
            }
            Err(e) => Err(APIError::CantMatch(e.to_string()))
        }
    }
}