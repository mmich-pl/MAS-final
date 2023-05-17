use actix_web::web::Data;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::database::DbClient;
use crate::error::APIError;

#[derive(Serialize, Deserialize, Debug)]
pub struct Truck {
    pub plate: String,
    pub axis_number: i8,
    pub mileage: i32,
    pub brand: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub purchase_date: Option<DateTime<Utc>>,
    pub available: bool,
}

impl Truck {
    pub(crate) fn new(plate: String, axis_num: i8, mileage: i32, brand: String,
                      date: Option<DateTime<Utc>>) -> Truck {
        Truck { plate, axis_number: axis_num, mileage, brand, purchase_date: date, available: true }
    }


    pub async fn create(client: &Data<DbClient>, plate: String, axis_num: i8, mileage: i32, brand: String,
                        date: Option<DateTime<Utc>>) -> Result<Truck, APIError> {
        let truck = Truck::new(plate, axis_num, mileage, brand, date);
        match client.surreal.create(("truck", &truck.plate)).content(truck).await {
            Ok(t) => Ok(t),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }

    pub(crate) async fn get_all(client: &Data<DbClient>) -> Result<Vec<Truck>, APIError> {
        match client.surreal.select("truck").await {
            Ok(response) => Ok(response),
            Err(e) => Err(APIError::Surreal(e)),
        }
    }
}