use actix_web::web::Data;
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
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
    pub fn new(name: String, tax_number: String, phone: String,
               email: String, address: Address) -> Client {
        Client { id: None, name, tax_number, phone, email, address }
    }

    pub async fn create(dbclient: &Data<DbClient>, name: String, tax_number: String,
                        phone: String, email: String, address: Address, )
                        -> Result<Client, APIError> {
        let client: Client = Client::new(name, tax_number, phone, email, address);

        match dbclient.surreal.create("client").content(client).await {
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
}