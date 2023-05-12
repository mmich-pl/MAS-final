use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::entities::address::Address;

#[derive(Serialize, Deserialize, Debug)]
pub struct Employee {
    pub first_name: String,
    pub last_name: String,
    pub personal_id_number: String,
    pub age: i8,
    pub employment_date: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dismissal_date: Option<DateTime<Utc>>,
    pub phone: String,
    pub email: String,
    pub salary: i32,
    pub address: Address,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Forwarder {
    pub person: Employee,
}