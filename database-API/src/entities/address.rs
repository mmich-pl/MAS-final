use serde::{Deserialize, Serialize};
use surrealdb::sql::{Thing};

#[derive(Serialize, Deserialize, Debug)]
pub struct Address {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub zipcode: String,
    pub city: String,
    pub country: String,
    pub street: String,
}
