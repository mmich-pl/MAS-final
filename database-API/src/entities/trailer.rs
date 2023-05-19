use std::any::Any;
use std::collections::HashMap;
use std::str::FromStr;

use actix_web::web::Data;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::database::DbClient;
use crate::entities::cargo::{CargoTypeResponse, CargoTypes};
use crate::entities::carriage::CarriageItems;
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
    pub trailer_type: String,
}

impl Trailer {
    pub(crate) fn new(plate: String, axis_num: i8, brand: String, date: Option<DateTime<Utc>>,
                      carrying_capacity: i32, trailer_type: String) -> Trailer {
        Trailer { plate, axis_number: axis_num, brand, purchase_date: date, carrying_capacity, trailer_type }
    }

    pub(crate) async fn create(client: &Data<DbClient>, plate: String, axis_num: i8, brand: String,
                               date: Option<DateTime<Utc>>, carrying_capacity: i32, trailer_type: String)
                               -> Result<Trailer, APIError> {
        let Ok(t_type) = TrailerType::from_str(&trailer_type) else {
            return Err(APIError::ValueNotOfType(format!("Unknown trailer type: {}", trailer_type)));
        };

        let trailer = Trailer::new(plate, axis_num, brand, date,
                                   carrying_capacity, trailer_type);
        let mut cargo_types = CargoTypeResponse::get_by_types(client, t_type.inner()).await?;

        if cargo_types.len() != t_type.inner().len() {
            for t in t_type.inner() {
                let res: CargoTypeResponse = client.surreal.create("cargoType")
                    .content(CargoTypeResponse { id: None, cargo_type: t.to_string() })
                    .await?;
                cargo_types.push(res)
            }
        }

        match client.surreal.create(("trailer", &trailer.plate)).content(trailer).await {
            Ok::<Trailer, _>(trailer) => {
                for t in cargo_types {
                    println!("{}", &trailer.plate);
                    client.surreal
                        .query(format!("RELATE trailer:⟨{}⟩->canCarry->$type;", &trailer.plate))
                        .bind(("type", t.id)).await?;
                }
                Ok(trailer)
            }
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_all(client: &Data<DbClient>) -> Result<Vec<Trailer>, APIError> {
        match client.surreal.select("trailer").await {
            Ok(response) => Ok(response),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_max_capacity_per_type(client: &Data<DbClient>, cargo_type: &str)
                                                  -> Result<i32, APIError> {

        // TODO: add check if trailer is available
        let query = client.surreal.query(
            "SELECT math::sum(<-canCarry<-trailer.carrying_capacity) \
            FROM cargoType \
            WHERE type == $cargo_type")
            .bind(("cargo_type", cargo_type));

        match query.await {
            Ok(mut response) => {
                let ret: Option<HashMap<String, i32>> = response.take(0)?;
                Ok(*ret.unwrap().values().next().unwrap())
            }
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_best_matching_trailer(client: &Data<DbClient>, load: Vec<CarriageItems>) ->
    Result<Vec<Trailer>, APIError> {
        let result = Vec::new();

        for item in load {
            let response = Trailer::get_max_capacity_per_type(client, &item.cargo_type).await;
            if let Ok(max_cap) = response {
                if max_cap < item.amount {
                    return Err(APIError::CantMatch(format!("No trailers that can carry {} of {}",
                                                           &item.amount, &item.cargo_type)));
                }
            } else if let Err(e) = response {
                return Err(e);
            }
        }


        // Other logic after processing all elements
        Ok(result)
    }
}

// Test only on initial values
#[cfg(test)]
mod test {
    use std::sync::Arc;

    use actix_web::web::Data;

    use crate::database::{DbClient, init_database, init_env};
    use crate::entities::trailer::Trailer;

    async fn crate_client() -> Data<DbClient> {
        init_env();
        let client = init_database().await;
        Data::new(DbClient { surreal: Arc::new(client).clone() })
    }


    #[actix_rt::test]
    async fn get_max_capacity() {
        let client = crate_client().await;
        let desired_cargo = String::from("Grain");
        let expected_value = 86;
        let actual_value = Trailer::get_max_capacity_per_type(&client, &desired_cargo).await.unwrap();
        assert_eq!(expected_value, actual_value);
    }
}