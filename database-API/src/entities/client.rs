use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
use crate::entities::address::Address;

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
