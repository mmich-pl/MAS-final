use actix_web::web::Data;
use serde::{Deserialize, Serialize};
use strum_macros::{Display, EnumString};
use surrealdb::sql::{Thing, Uuid};

use crate::controllers::cargo_controller::CreateCargoRequest;
use crate::database::DbClient;
use crate::entities::driver::{AdditionalLicence};
use crate::error::APIError;

#[derive(Serialize, Deserialize, EnumString, Display, Debug, PartialEq)]
pub enum CargoTypes {
    Grain,
    #[serde(rename(serialize = "Dry Bulk Cargo", deserialize = "Dry Bulk Cargo"))]
    #[strum(serialize = "Dry Bulk Cargo")]
    BulkDry,
    #[serde(rename(serialize = "Liquid Bulk Cargo", deserialize = "Liquid Bulk Cargo"))]
    #[strum(serialize = "Liquid Bulk Cargo")]
    BulkLiquid,
    #[serde(rename(serialize = "Buildings Materials", deserialize = "Buildings Materials"))]
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
    pub(crate) async fn get_by_types(client: &Data<DbClient>, list: &Vec<CargoTypes>)
                                     -> Result<Vec<CargoTypeResponse>, APIError> {
        match client.surreal
            .query("SELECT * FROM cargoType where type INSIDE $type")
            .bind(("type", list)).await {
            Ok(mut response) => Ok(response.take(0)?),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_or_create(client: &Data<DbClient>, c_type: &str)
                                      -> Result<CargoTypeResponse, APIError> {
        match client.surreal
            .query("SELECT * FROM cargoType where type == $type")
            .bind(("type", c_type)).await {
            Ok(mut response) => {
                let ret: Option<CargoTypeResponse> = response.take(0)?;
                match ret {
                    None => {
                        let res: CargoTypeResponse = client.surreal.create("cargoType")
                            .content(CargoTypeResponse { id: None, cargo_type: c_type.to_string() })
                            .await?;
                        Ok(res)
                    }
                    Some(cargo_type) => Ok(cargo_type)
                }
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
    pub required_licence: Option<AdditionalLicence>,
}

impl Cargo {
    pub fn new(name: String, unit: String, required_licences: Option<String>) -> Cargo {
        let licences = AdditionalLicence::map_single(required_licences);
        Cargo { id: None, name, unit, required_licence: licences }
    }

    pub async fn create(client: &Data<DbClient>, name: String, unit: String, cargo_type: String,
                        required_licences: Option<String>) -> Result<Cargo, APIError> {
        let cargo = Cargo::new(name, unit, required_licences);
        let c_type = CargoTypeResponse::get_or_create(client, &cargo_type).await?;

        let uuid_id = Uuid::new_v4();
        match client.surreal.create(("cargo", uuid_id)).content(cargo).await {
            Ok::<Cargo, _>(c) => {
                client.surreal
                    .query("RELATE $type->contains->$cargo")
                    .bind(("cargo", &c.id))
                    .bind(("type", c_type.id.unwrap())).await?;
                Ok(c)
            }
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_all(client: &Data<DbClient>) -> Result<Vec<CreateCargoRequest>, APIError> {
        match client.surreal.query("SELECT * , array::pop(<-contains<-cargoType.type) AS type_name FROM cargo;").await {
            Ok(mut response) => {
                let ret: Vec<CreateCargoRequest> = response.take(0)?;
                Ok(ret)
            },
            Err(e) => Err(APIError::Surreal(e)),
        }
    }
}
