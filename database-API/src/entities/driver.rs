use std::collections::BTreeMap;
use std::fmt::Debug;
use std::str::FromStr;

use actix_web::cookie::time::Date;
use actix_web::web::Data;
use chrono::{DateTime, TimeZone, Utc};
use serde::{Deserialize, Serialize};
use strum_macros::{Display, EnumString};
use surrealdb::sql::Thing;

use crate::database::DbClient;
use crate::entities::address::Address;
use crate::entities::employee::Employee;
use crate::error::APIError;

#[derive(Serialize, Deserialize, EnumString, Display, Debug)]
pub enum AdditionalLicences {
    Flammable,
    Toxic,
    Delicate,
    Livestock,
    Overdimensional,
}

pub type Licences = Option<Vec<AdditionalLicences>>;

impl AdditionalLicences {
    pub(crate) fn map_licences(l: Option<Vec<String>>) -> Licences {
        let Some(licences) = l else { return None; };
        Some(licences.into_iter()
            .map(|x| AdditionalLicences::from_str(&x))
            .flat_map(|x| x.ok()).collect()
        )
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DriverLicence {
    pub document_id: String,
    pub expiration_date: DateTime<Utc>,
    pub categories: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Driver {
    pub employee: Employee,
    pub driver_licence: DriverLicence,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub owned_licences: Licences,
}

impl Driver {
    pub(crate) fn new(first_name: String, last_name: String, personal_id_number: String, age: i8,
                      employment_date: DateTime<Utc>, dismissal_date: Option<DateTime<Utc>>, phone:
                      String, email: String, salary: i32, address: Address, driver_licence: DriverLicence,
                      owned_licences: Licences) -> Driver {
        let employee = Employee::new(first_name, last_name, personal_id_number, age,
                                     employment_date, dismissal_date, phone, email, salary, address);
        Driver { employee, driver_licence, owned_licences }
    }

    pub async fn create(dbclient: &Data<DbClient>, first_name: String, last_name: String,
                        personal_id_number: String, age: i8, employment_date: DateTime<Utc>,
                        dismissal_date: Option<DateTime<Utc>>, phone: String, email: String,
                        salary: i32, address: Address, driver_licence: DriverLicence,
                        owned_licences: Licences) -> Result<Driver, APIError> {
        let driver = Driver::new(first_name, last_name, personal_id_number.clone(), age, employment_date,
                                 dismissal_date, phone, email, salary, address, driver_licence, owned_licences);
        match dbclient.surreal.create(("driver", &personal_id_number)).content(driver).await {
            Ok(c) => Ok(c),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }


    pub(crate) async fn get_with_licences(client: &Data<DbClient>, licences: Vec<AdditionalLicences>,
                                          pickup_date: &str, drop_date: &str)
                                          -> Result<Vec<Driver>, APIError> {
        match client.surreal.query(
            "let $a = SELECT truck_sets.driver.id AS drivers FROM carriage
             WHERE $drop_date > pickup_time AND $pickup_date < drop_time;
             let $arr = SELECT id FROM array::flatten($a.drivers);
             SELECT * FROM driver WHERE id NOTINSIDE $arr.id and owned_licences CONTAINSALL $licences;")
            .bind(("licences", licences))
            .bind(("drop_date", drop_date))
            .bind(("pickup_date", pickup_date))
            .await {
            Ok(mut response) => {
                let result: Vec<Driver> = response.take(2)?;
                Ok(result)
            }
            Err(e) => Err(APIError::Surreal(e)),
        }
    }
}

