use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
use crate::entities::driver::Licences;
use strum_macros::{Display, EnumString};

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


#[derive(Serialize, Deserialize, Debug)]
pub struct Cargo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub name: String,
    pub cargo_type: CargoTypes,
    pub unit: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required_licences: Licences,
}
