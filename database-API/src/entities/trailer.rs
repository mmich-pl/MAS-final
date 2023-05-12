use std::str::FromStr;
use actix_web::web::Data;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::{Id, Thing};
use crate::database::DbClient;
use crate::entities::cargo::{CargoTypeResponse, CargoTypes};
use crate::error::APIError;

pub(crate) enum TrailerType {
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

impl FromStr for TrailerType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Curtainsider" => Ok(TrailerType::Curtainsider(vec![CargoTypes::Pallet])),
            "Flatbed" => Ok(TrailerType::Flatbed(vec![CargoTypes::BuildingsMaterials, CargoTypes::Machines])),
            "Logger" => Ok(TrailerType::Logger(vec![CargoTypes::Wood])),
            "Tank" => Ok(TrailerType::Tank(vec![CargoTypes::BulkLiquid])),
            "DryFreighter" => Ok(TrailerType::DryFreighter(vec![CargoTypes::Pallet])),
            "Silo" => Ok(TrailerType::Silo(vec![CargoTypes::Grain])),
            "DumbTruck" => Ok(TrailerType::DumbTruck(vec![CargoTypes::Grain, CargoTypes::BulkDry])),
            "Refrigerated" => Ok(TrailerType::Refrigerated(vec![CargoTypes::Refrigerated])),
            "LivestockTrailer" => Ok(TrailerType::LivestockTrailer(vec![CargoTypes::Livestock])),
            _ => Err(())
        }
    }
}

impl TrailerType {
    fn inner(&self) -> &Vec<CargoTypes> {
        match self {
            TrailerType::Curtainsider(v) | TrailerType::Flatbed(v) |
            TrailerType::Logger(v) | TrailerType::Tank(v) |
            TrailerType::DryFreighter(v) | TrailerType::Silo(v) |
            TrailerType::DumbTruck(v) | TrailerType::Refrigerated(v) |
            TrailerType::LivestockTrailer(v) => { v }
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct Trailer {
    pub carrying_capacity: i32,
    pub plate: String,
    pub axis_number: i8,
    pub brand: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub purchase_date: Option<DateTime<Utc>>,
    pub available: bool,
    pub trailer_type: String,
}

impl Trailer {
    pub(crate) fn new(plate: String, axis_num: i8, brand: String, date: Option<DateTime<Utc>>,
                      carrying_capacity: i32, trailer_type: String) -> Trailer {
        Trailer { plate, axis_number: axis_num, brand, purchase_date: date, available: true, carrying_capacity, trailer_type }
    }

    pub(crate) async fn create(client: &Data<DbClient>, plate: String, axis_num: i8, brand: String,
                               date: Option<DateTime<Utc>>, carrying_capacity: i32, trailer_type: String)
                               -> Result<Trailer, APIError> {
        let Ok(t_type) = TrailerType::from_str(&trailer_type) else {
            return Err(APIError::ValueNotOfType(format!("Unknown trailer type: {}", trailer_type)));
        };

        let trailer = Trailer::new(plate, axis_num, brand, date,
                                   carrying_capacity, trailer_type);
        let mut cargo_types = CargoTypeResponse::get_matching(client, t_type.inner()).await?;

        if cargo_types.len() == 0 {
            for t in t_type.inner() {
                let res: CargoTypeResponse = client.surreal.create("cargoType")
                    .content(CargoTypeResponse { id: None, cargo_type: t.to_string() })
                    .await?;
                cargo_types.push(res)
            }
        }

        match client.surreal.create(("trailer", &trailer.plate)).content(trailer).await {
            Ok::<Trailer, _>(t) => {
                let plate: &str = &t.plate;
                for t in cargo_types {
                    client.surreal
                        .query("RELATE $trailer->can_carry->$type;")
                        .bind(("trailer", Thing { tb: "trailer".to_string(), id: Id::from(plate) }))
                        .bind(("type", t.id)).await?;
                }
                Ok(t)
            }
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_all(client: &Data<DbClient>) -> Result<Vec<Trailer>, String> {
        match client.surreal.select("trailer").await {
            Ok(response) => Ok(response),
            Err(e) => Err(e.to_string()),
        }
    }
}