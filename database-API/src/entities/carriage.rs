use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
use crate::entities::address::Address;
use crate::entities::cargo::Cargo;
use crate::entities::driver::Driver;
use crate::entities::trailer::Trailer;
use crate::entities::truck::Truck;

#[derive(Serialize, Deserialize, Debug)]
pub struct TruckSet {
    pub trailer: Trailer,
    pub truck: Truck,
    pub driver: Driver,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Carriage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Thing>,
    pub pickup_time: DateTime<Utc>,
    pub pickup_address: Address,
    pub drop_address: Address,
    pub route_length: i32,
    pub drive_time: f32,
    pub cargo: Vec<(Cargo, f32)>,
    pub truck_sets: Vec<TruckSet>,
}