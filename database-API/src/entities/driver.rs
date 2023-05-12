use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::entities::employee::Employee;
use strum_macros::{EnumString, Display};

#[derive(Serialize, Deserialize,EnumString, Display, Debug)]
pub enum AdditionalLicences {
    Flammable,
    Toxic,
    Delicate,
    Livestock,
    Overdimensional,
}

pub type Licences = Option<Vec<AdditionalLicences>>;

#[derive(Serialize, Deserialize, Debug)]
pub struct DriverLicence {
    pub document_id: String,
    pub expiration_date: DateTime<Utc>,
    pub categories: Vec<char>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Driver {
    pub employee: Employee,
    pub available: bool,
    pub driver_licence: DriverLicence,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub additional_licences: Licences,
}
