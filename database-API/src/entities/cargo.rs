use std::str::FromStr;
use actix_web::web::Data;
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
use crate::entities::driver::{AdditionalLicences, Licences};
use strum_macros::{Display, EnumString};
use crate::database::DbClient;
use crate::error::APIError;

#[derive(Serialize, Deserialize, EnumString, Display, Debug, PartialEq)]
pub enum CargoTypes {
    Grain,
    BulkDry,
    BulkLiquid,
    #[serde(rename = "Buildings Materials")]
    #[strum(serialize = "Buildings Materials")]
    BuildingsMaterials,
    Machines,
    Wood,
    Livestock,
    Pallet,
    Refrigerated,
}


#[derive(Serialize, Deserialize, Debug)]
pub struct CargoTypeResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    #[serde(rename = "type")]
    pub cargo_type: String,
}


impl CargoTypeResponse {
    pub(crate) async fn get_matching(client: &Data<DbClient>, list: &Vec<CargoTypes>)
                                     -> Result<Vec<CargoTypeResponse>, APIError> {
        match client.surreal
            .query("SELECT * FROM cargoType where type INSIDE $type")
            .bind(("type", list)).await {
            Ok(mut response) => Ok(response.take(0)?),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_by_type(client: &Data<DbClient>, c_type: &str)
                                    -> Result<Option<CargoTypeResponse>, APIError> {
        match client.surreal
            .query("SELECT * FROM cargoType where type == $type")
            .bind(("type", c_type)).await {
            Ok(mut response) => {
                let ret: Option<CargoTypeResponse> = response.take(0)?;
                Ok(ret)
            }
            Err(e) => Err(APIError::Surreal(e)),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Cargo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub name: String,
    pub unit: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required_licences: Licences,
}

impl Cargo {
    pub fn new(name: String, unit: String, required_licences: Option<Vec<String>>) -> Cargo {
        let licences = AdditionalLicences::map_licences(required_licences);
        Cargo { id: None, name, unit, required_licences: licences }
    }

    pub async fn create(client: &Data<DbClient>, name: String, unit: String, cargo_type: String,
                        required_licences: Option<Vec<String>>) -> Result<Cargo, APIError> {
        let cargo = Cargo::new(name, unit, required_licences);
        let Some(c_type) = CargoTypeResponse::get_by_type(client, &cargo_type).await? else {
            return Err(APIError::ValueNotOfType(format!("Unknown cargo type: {}", cargo_type)));
        };

        match client.surreal.create("cargo").content(cargo).await {
            Ok::<Cargo, _>(c) => {
                client.surreal
                    .query("RELATE $type->contains->$cargo")
                    .bind(("cargo", &c.id))
                    .bind(("type", c_type)).await?;
                Ok(c)
            }
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_all(client: &Data<DbClient>) -> Result<Vec<Cargo>, APIError> {
        match client.surreal.select("cargo").await {
            Ok(response) => Ok(response),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }
}
