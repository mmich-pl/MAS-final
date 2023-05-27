use std::collections::BTreeMap;
use std::fmt::Debug;
use std::str::FromStr;

use actix_web::web::Data;
use chrono::{DateTime, Utc};
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
    pub categories: Vec<char>,
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

    pub(crate) async fn get_all(client: &Data<DbClient>) -> Result<Vec<Driver>, APIError> {
        match client.surreal.select("driver").await {
            Ok(response) => Ok(response),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_with_licences(client: &Data<DbClient>, licences: Vec<AdditionalLicences>) -> Result<Vec<Thing>, APIError> {
        match client.surreal.query("SELECT id FROM driver WHERE owned_licences CONTAINSALL $licences;")
            .bind(("licences", licences)).await {
            Ok(mut response) => {
                let result: Vec<BTreeMap<String, Thing>> = response.take(0)?;
                return Ok(result.into_iter()
                    .map(|m| m.into_iter().next().unwrap().1)
                    .collect());
            },
            Err(e) => Err(APIError::Surreal(e)),
        }
    }
}


// Test only on initial values
#[cfg(test)]
mod test {
    use std::sync::Arc;

    use actix_web::web::Data;

    use crate::database::{DbClient, init_database, init_env};
    use crate::entities::driver::{AdditionalLicences, Driver};
    use crate::entities::trailer::Trailer;

    async fn crate_client() -> Data<DbClient> {
        init_env();
        let client = init_database().await;
        Data::new(DbClient { surreal: Arc::new(client).clone() })
    }


    #[actix_rt::test]
    async fn get_with_multiple_licences() {
        let client = crate_client().await;
        let required_licences = AdditionalLicences::map_licences(Some(vec!["Flammable".to_string(), "Overdimensional".to_string()]));
        let ids = Driver::get_with_licences(&client, required_licences.unwrap()).await.unwrap();
        assert_eq!(ids.len(), 1);
    }

    #[actix_rt::test]
    async fn get_multiple_drivers() {
        let client = crate_client().await;
        let required_licences = AdditionalLicences::map_licences(Some(vec!["Flammable".to_string()]));
        let ids = Driver::get_with_licences(&client, required_licences.unwrap()).await.unwrap();
        assert_eq!(ids.len(), 2);
    }
}