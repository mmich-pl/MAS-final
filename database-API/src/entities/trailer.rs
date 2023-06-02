use std::collections::btree_map::BTreeMap;
use std::str::FromStr;

use actix_web::web::Data;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::method::Query;

use crate::controllers::trailer_controller::CreateTrailerRequest;
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
    pub carrying_capacity: i32,
    pub plate: String,
    pub axis_number: i8,
    pub brand: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub purchase_date: Option<DateTime<Utc>>,
    pub trailer_type: String,
}

impl<'a> Trailer {
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

    pub(crate) async fn get_all(client: &Data<DbClient>) -> Result<Vec<CreateTrailerRequest>, APIError> {
        match client.surreal.query("SELECT *, ->canCarry->cargoType.type AS cargo_type_name FROM trailer;").await {
            Ok(mut response) => {
                let ret: Vec<CreateTrailerRequest> = response.take(0)?;
                Ok(ret)
            }
            Err(e) => Err(APIError::Surreal(e)),
        }
    }


    pub(crate) async fn get_max_capacity_per_type(client: &Data<DbClient>, cargo_type: &str, pickup_date: &str, drop_date: &str)
                                                  -> Result<Vec<Trailer>, APIError> {
        let query = client.surreal.query(
            "let $a = SELECT truck_sets.trailer.id as trailers FROM carriage
             WHERE $drop_date > pickup_time AND $pickup_date < drop_time;
            SELECT * FROM (SELECT VALUE t[WHERE id NOTINSIDE array::flatten($a.trailers).id]
            FROM (SELECT <-canCarry<-trailer.* as t FROM cargoType WHERE type == $cargo_type))[0];")
            .bind(("cargo_type", cargo_type))
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

    // fn find_combination(coins: &mut Vec<(u32, u32)>, target: u32) -> Option<Vec<u32>> {
    //     let mut best_combination = None;
    //     let mut remaining = target;
    //
    //     // Helper function for backtracking
    //     fn backtrack(
    //         coins: &mut Vec<(u32, u32)>,
    //         target: u32,
    //         combination: &mut Vec<u32>,
    //         best_combination: &mut Option<Vec<u32>>,
    //         remaining: &mut u32,
    //         start_index: usize,
    //     ) {
    //         if *remaining == 0 {
    //             *best_combination = Some(combination.clone());
    //             return;
    //         }
    //
    //         for i in start_index..coins.len() {
    //             let (value, quantity) = coins[i];
    //             if *remaining >= value && quantity > 0 {
    //                 combination.push(value);
    //                 *remaining -= value;
    //                 coins[i].1 -= 1; // Reduce quantity of used coin
    //                 backtrack(
    //                     coins,
    //                     target,
    //                     combination,
    //                     best_combination,
    //                     remaining,
    //                     i,
    //                 );
    //                 *remaining += value;
    //                 coins[i].1 += 1; // Restore quantity of used coin
    //                 combination.pop();
    //             }
    //         }
    //     }
    //
    //     backtrack(coins, target, &mut Vec::new(), &mut best_combination, &mut remaining, 0);
    //
    //     best_combination
    // }

    pub(crate) async fn get_best_matching_trailer(client: &Data<DbClient>, load: Vec<CarriageItems>, pickup_date: &str, drop_date: &str) ->
    Result<Vec<Trailer>, APIError> {
        let result = Vec::new();

        for item in load {
            let response = Trailer::get_max_capacity_per_type(client, &item.cargo_type, pickup_date, drop_date).await;
            if let Ok(trailers) = response {
                let max_capacity: i32 = trailers.iter().map(|t| t.carrying_capacity).sum();

                if max_capacity < item.amount {
                    return Err(APIError::CantMatch(format!("No trailers that can carry {} of {}",
                                                           &item.amount, &item.cargo_type)));
                }
            } else if let Err(e) = response {
                return Err(e);
            }
        }


        // if let Some(combination) = find_combination(&mut coins, target) {
        //     println!("Combination: {:?}", combination);
        // } else {
        //     println!("No exact combination found. Finding next smallest combination...");
        //     let mut next_smallest = target + 1;
        //
        //     while next_smallest <= limit {
        //         if let Some(combination) = find_combination(&mut coins, next_smallest) {
        //             println!("Next smallest combination: {:?}", combination);
        //             break;
        //         }
        //         next_smallest += 1;
        //     }
        //
        //     if next_smallest > limit {
        //         println!("No combination possible.");
        //     }
        // }

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
        let drop_date = "2023-05-20 12:44:52 UTC";
        let pickup_date = "2023-05-20 09:30:00 UTC";
        let actual_value = Trailer::get_max_capacity_per_type(&client, &desired_cargo, pickup_date, drop_date).await.unwrap();
        assert_eq!(3, actual_value.len());
    }
}