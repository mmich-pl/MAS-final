use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::entities::address::Address;

#[derive(Serialize, Deserialize, Debug)]
pub enum Gender {
    Man, Woman
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Employee {
    pub personal_id_number: String,
    pub first_name: String,
    pub last_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maiden_name: Option<String>,
    pub birth_date: DateTime<Utc>,
    pub gender: Gender,
    pub employment_date: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dismissal_date: Option<DateTime<Utc>>,
    pub phone: String,
    pub email: String,
    #[serde(rename(deserialize="_salary", deserialize="salary"))]
    pub salary: i32,
    pub address: Address,
}

impl Employee {
    pub(crate) fn new(first_name: String, last_name: String, personal_id_number: String, maiden_name:Option<String>,
                      birth_date:DateTime<Utc>, gender:Gender, employment_date: DateTime<Utc>, dismissal_date: Option<DateTime<Utc>>, phone:
                      String, email: String, salary: i32, address: Address) -> Employee {
        Employee { first_name, last_name, personal_id_number, maiden_name, birth_date, gender, employment_date,
            dismissal_date, phone, email, salary, address }
    }
}