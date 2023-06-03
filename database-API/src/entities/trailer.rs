use std::cmp::Ordering;
use std::collections::btree_map::BTreeMap;
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

#[derive(Serialize, Deserialize, Debug, Clone)]
pub(crate) struct Trailer {
    pub carrying_capacity: u8,
    pub plate: String,
    pub axis_number: u8,
    pub brand: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub purchase_date: Option<DateTime<Utc>>,
    pub trailer_type: String,
}

impl PartialOrd for Trailer {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.carrying_capacity.partial_cmp(&other.carrying_capacity)
    }
}

impl PartialEq for Trailer {
    fn eq(&self, other: &Self) -> bool {
        self.carrying_capacity == other.carrying_capacity
    }
}


impl<'a> Trailer {
    pub(crate) fn new(plate: String, axis_num: u8, brand: String, date: Option<DateTime<Utc>>,
                      carrying_capacity: u8, trailer_type: String) -> Trailer {
        Trailer { plate, axis_number: axis_num, brand, purchase_date: date, carrying_capacity, trailer_type }
    }

    pub(crate) async fn create(client: &Data<DbClient>, plate: String, axis_num: u8, brand: String,
                               date: Option<DateTime<Utc>>, carrying_capacity: u8, trailer_type: String)
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

    pub(crate) async fn get_witch_mathing_cargo(client: &Data<DbClient>, cargo_type: &str, pickup_date: &str, drop_date: &str)
                                                -> Result<Vec<Trailer>, APIError> {
        let query = client.surreal.query(
            "let $a = SELECT truck_sets.trailer.id as trailers FROM carriage
                 WHERE $drop_date > pickup_time
                 AND $pickup_date < drop_time;
            SELECT * FROM
                (SELECT value t[WHERE id notinside array::flatten($a.trailers).id] FROM
                    (SELECT <-canCarry<-trailer.* as t FROM cargoType
                        WHERE $cargo_name inside ->contains->cargo.name)
                )[0]
                ORDER BY carrying_capacity ASC;")
            .bind(("cargo_name", cargo_type))
            .bind(("drop_date", drop_date))
            .bind(("pickup_date", pickup_date));

        match query.await {
            Ok(mut response) => {
                let ret: Vec<Trailer> = response.take(1)?;
                Ok(ret)
            }
            Err(e) => Err(APIError::Surreal(e)),
        }
    }


    fn find_best_combination(desired_capacity: u16, max_capacity: u16, trailers: Vec<Trailer>) -> Vec<Trailer> {
        // Initialize the dynamic programming table with zeros
        let num_trailers = trailers.len();
        let mut dp = vec![vec![0; (max_capacity + 1) as usize]; num_trailers + 1];

        // Fill the dynamic programming table using the given trailers and their capacities
        for i in 1..=num_trailers {
            for j in 1..=max_capacity as usize {
                if trailers[i - 1].carrying_capacity as usize <= j {
                    dp[i][j] = std::cmp::max(
                        trailers[i - 1].carrying_capacity as u16 + dp[i - 1][j - trailers[i - 1].carrying_capacity as usize],
                        dp[i - 1][j],
                    );
                } else {
                    dp[i][j] = dp[i - 1][j];
                }
            }
        }

        // Find the target capacity that minimizes the difference between target_capacity and desired_capacity
        // while keeping target_capacity >= desired_capacity
        let target_capacity = (desired_capacity as usize..=max_capacity as usize)
            .filter(|&i| dp[num_trailers][i] as u16 >= desired_capacity)
            .min_by_key(|&i| desired_capacity.abs_diff(dp[num_trailers][i] as u16))
            .unwrap_or(desired_capacity as usize) as u16;

        let mut result = Vec::new();
        let mut capacity = target_capacity;

        for i in (1..=num_trailers).rev() {
            if capacity == 0 { break; }
            if dp[i][capacity as usize] != dp[i - 1][capacity as usize] {
                result.push(trailers[i - 1].clone());
                capacity -= trailers[i - 1].carrying_capacity as u16;
            }
        }

        result
    }


    pub(crate) async fn get_best_matching_trailer(client: &Data<DbClient>, load: Vec<CarriageItems>, pickup_date: &str, drop_date: &str) ->
    Result<BTreeMap<String, Vec<Trailer>>, APIError> {
        let mut result = BTreeMap::new();

        for item in load {
            let response = Trailer::get_witch_mathing_cargo(client, &item.cargo_type, pickup_date, drop_date).await;
            if let Ok(trailers) = response {
                let max_capacity: u16 = trailers.iter().map(|t| t.carrying_capacity as u16).sum();
                if item.amount > max_capacity {
                    return Err(APIError::CantMatch(format!("No there are not enough trailers to carry {} of {}. At the moment we can transport only {}",
                                                           &item.amount, &item.cargo_type, max_capacity)));
                }
                result.insert(item.cargo_type, Trailer::find_best_combination(item.amount, max_capacity, trailers));
            } else if let Err(e) = response {
                return Err(e);
            }
        }


        Ok(result)
    }
}

// Test only on initial values
#[cfg(test)]
mod test {
    use crate::entities::trailer::Trailer;

    fn create_trailers<'a>() -> Vec<Trailer> {
        let t1 = Trailer::new("EL-1YLTP".to_string(), 3, "Wielton".to_string(),
                              None, 24, "DumbTruck".to_string());
        let t2 = Trailer::new("EL-2EWU8".to_string(), 3, "Schwarzmüeller".to_string(),
                              None, 16, "DumbTruck".to_string());
        let t3 = Trailer::new("EL-3ZXXC".to_string(), 3, "Feldbinder".to_string(),
                              None, 20, "DumbTruck".to_string());
        let t4 = Trailer::new("EL-3ZXXU".to_string(), 3, "Feldbinder".to_string(),
                              None, 24, "DumbTruck".to_string());
        let t5 = Trailer::new("EL-3ZXWE".to_string(), 2, "Feldbinder".to_string(),
                              None, 10, "DumbTruck".to_string());
        vec![t5, t2, t3, t4, t1]
    }

    #[test]
    fn test_find_combination_1() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(40, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![16, 24]);
    }

    #[test]
    fn test_find_combination_2() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(42, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![20, 24]);
    }

    #[test]
    fn test_find_combination_3() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(44, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![20, 24]);
    }

    #[test]
    fn test_find_combination_4() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(48, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![24, 24]);
    }

    #[test]
    fn test_find_combination_5() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(60, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![16, 20, 24]);
    }

    #[test]
    fn test_find_combination_6() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(16, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![16]);
    }

    #[test]
    fn test_find_combination_7() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(38, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![16, 24]);
    }

    #[test]
    fn test_find_combination_8() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(80, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![16, 20, 24, 24]);
    }

    #[test]
    fn test_find_combination_9() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(94, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![10, 16, 20, 24, 24]);
    }

    #[test]
    fn test_find_combination_10() {
        let mut trailers = create_trailers();
        let mut combination: Vec<u8> = Trailer::find_best_combination(50, 94, trailers)
            .iter().map(|t| t.carrying_capacity).collect();
        combination.sort();
        assert_eq!(combination, vec![10, 16, 24]);
    }
}