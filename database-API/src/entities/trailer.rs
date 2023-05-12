use std::str::FromStr;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::entities::cargo::CargoTypes;
use crate::entities::trailer::TrailerType::Unknown;

#[derive(Serialize, Deserialize, Debug)]
pub enum TrailerType {
    Curtainsider(CargoTypes),
    Flatbed(Vec<CargoTypes>),
    Logger(CargoTypes),
    Tank(CargoTypes),
    DryFreighter(CargoTypes),
    Silo(CargoTypes),
    DumbTruck(Vec<CargoTypes>),
    Refrigerated(CargoTypes),
    LivestockTrailer(CargoTypes),
    Unknown,
}

impl From<&str> for TrailerType {
    fn from(s: &str) -> Self {
        match s {
            "Curtainsider" => TrailerType::Curtainsider(CargoTypes::Pallet),
            "Flatbed" => TrailerType::Flatbed(vec![CargoTypes::BuildingsMaterials, CargoTypes::Machines]),
            "Logger" => TrailerType::Logger(CargoTypes::Wood),
            "Tank" => TrailerType::Tank(CargoTypes::BulkLiquid),
            "DryFreighter" => TrailerType::DryFreighter(CargoTypes::Pallet),
            "Silo" => TrailerType::Silo(CargoTypes::Grain),
            "DumbTruck" => TrailerType::Flatbed(vec![CargoTypes::Grain, CargoTypes::BulkDry]),
            "Refrigerated" => TrailerType::Refrigerated(CargoTypes::Refrigerated),
            "LivestockTrailer" => TrailerType::LivestockTrailer(CargoTypes::Livestock),
            _ => Unknown,
        }
    }
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

#[cfg(test)]
mod tests {
    use crate::entities::cargo::CargoTypes;
    use crate::entities::trailer::TrailerType;
    use crate::utils::cast;

    #[test]
    fn test_cast() {
        let trailer_type = TrailerType::from("Silo");
        let cargo_type = cast!(trailer_type, TrailerType::Silo);
        assert_eq!(cargo_type, CargoTypes::Grain);
    }

    #[test]
    fn test_cast_vec() {
        let trailer_type = TrailerType::from("DumbTruck");
        let cargo_type = cast!(trailer_type, TrailerType::DumbTruck);
        assert_eq!(cargo_type, vec![CargoTypes::Grain, CargoTypes::BulkDry]);
    }
}