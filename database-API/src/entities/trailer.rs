use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::entities::cargo::CargoTypes;

#[derive(Serialize, Deserialize, Debug)]
pub enum TrailerType {
    Curtainsider(Vec<CargoTypes>),
    Flatbed(Vec<CargoTypes>),
    Logger(Vec<CargoTypes>),
    Tank(Vec<CargoTypes>),
    DryFreighter(Vec<CargoTypes>),
    Silo(Vec<CargoTypes>),
    DumbTruck(Vec<CargoTypes>),
    Refrigerated(Vec<CargoTypes>),
    LivestockTrailer(Vec<CargoTypes>),
}


#[derive(Serialize, Deserialize, Debug)]
pub struct Trailer {
    pub carrying_capacity: i32,
    pub plate: String,
    pub axis_number: i8,
    pub brand: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub purchase_date: Option<DateTime<Utc>>,
    pub available: bool,
    pub trailer_type: String,
}

