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

impl Employee {
    pub(crate) fn new(first_name: String, last_name: String, personal_id_number: String, age: i8,
                      employment_date: DateTime<Utc>, dismissal_date: Option<DateTime<Utc>>, phone:
                      String, email: String, salary: i32, address: Address) -> Employee {
        Employee { first_name, last_name, personal_id_number, age, employment_date,
            dismissal_date, phone, email, salary, address }
    }
}


#[derive(Serialize, Deserialize, Debug)]
pub struct Forwarder {
    pub employee: Employee,
}

impl Forwarder {
    pub(crate) fn new(first_name: String, last_name: String, personal_id_number: String, age: i8,
                      employment_date: DateTime<Utc>, dismissal_date: Option<DateTime<Utc>>, phone:
                      String, email: String, salary: i32, address: Address) -> Forwarder {
        Forwarder { employee: Employee::new(first_name, last_name, personal_id_number, age,
                                          employment_date, dismissal_date, phone, email, salary, address) }
    }
}