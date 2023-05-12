use serde::{Deserialize, Serialize};
use surrealdb::sql::Datetime;

#[derive(Serialize, Deserialize, Debug)]
pub struct Truck {
    pub plate: String,
    pub axis_number:i8,
    pub mileage: i32,
    pub brand: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub purchase_date: Option<Datetime>,
    pub available: bool
}

