import sys

import requests
from dotenv import dotenv_values

BASE_API_URL = "http://127.0.0.1:8080/api"

cargo = [
    {"name": "Apples", "unit": "psc.", "cargo_type": "Pallet"},
    {"name": "Big-Bags of Seeds ", "unit": "psc.", "cargo_type": "Pallet"},
    {"name": "Atlantic Cod Fillet", "unit": "t", "cargo_type": "Refrigerated"},
    {"name": "Beef", "unit": "t", "cargo_type": "Refrigerated"},
    {"name": "Barley", "unit": "t", "cargo_type": "Grain"},
    {"name": "Reinforcing Bars", "unit": "t", "cargo_type": "BuildingsMaterials"},
    {"name": "Logs", "unit": "t", "cargo_type": "Wood"},
    {"name": "Cement", "unit": "t", "cargo_type": "BulkDry"},
    {"name": "Coal", "unit": "t", "cargo_type": "BulkDry"},
    {"name": "Diesel", "unit": "hl", "required_licences": "Flammable", "cargo_type": "BulkLiquid"},
    {"name": "Loaders", "unit": "psc.", "required_licences": "Overdimensional", "cargo_type": "Machines"},
    {"name": "Fuel Tanker", "unit": "psc. ", "required_licences": "Flammable", "cargo_type": "Pallet"},
    {"name": "Pigs", "unit": "psc. ", "required_licences": "Livestock", "cargo_type": "Livestock"},
]

clients = [
    {"name": "Tall Tales Craft Ales", "tax_number": "5268672572", "phone": "699604416",
     "email": "talltalles@gmail.com"},
    {"name": "Tamsack Harbor", "tax_number": "7976065223", "phone": "694025155 ", "email": "tamsack@gmail.com"}
]

drivers = [
    {
        "employee": {
            "first_name": "Alex",
            "last_name": "White",
            "personal_id_number": "90041421993",
            "age": 33,
            "employment_date": "2021-04-15T12:00:32.129056200Z",
            "phone": "662009817",
            "email": "alexander@gmail.com",
            "salary": 7300,
            "address": {
                "zipcode": "60-009",
                "city": "Poznań",
                "country": "Polska",
                "street": "Legionów Polskich 56/2"
            }
        },
        "driver_licence": {
            "document_id": "P8676449",
            "expiration_date": "2028-10-15T12:00:32.129056200Z",
            "categories": ["C"]
        },
        "owned_licences": ["Toxic"]
    },
    {
        "employee": {
            "first_name": "Elvin",
            "last_name": "Rathke",
            "personal_id_number": "67120732572",
            "age": 55,
            "employment_date": "2022-03-17T15:05:55Z",
            "phone": "877408081",
            "email": "erathke0@sun.com",
            "salary": 8212,
            "address": {
                "zipcode": "90-540",
                "city": "Łódź",
                "country": "Poland",
                "street": "ul. Radwańska 97"
            }
        },
        "driver_licence": {
            "document_id": "P1928072",
            "expiration_date": "2024-03-28T14:05:30Z",
            "categories": ["C"]
        },
        "owned_licences": ["Flammable", "Overdimensional"]
    },
    {
        "employee": {
            "first_name": "Demeter",
            "last_name": "Gilman",
            "personal_id_number": "93022779964",
            "age": 30,
            "employment_date": "2018-10-28T14:05:30Z",
            "phone": "917268559",
            "email": "dgilman1@fc2.com",
            "salary": 8992,
            "address": {
                "zipcode": "91-179",
                "city": "Łódź",
                "country": "Poland",
                "street": "ul. Białych Róż 43"
            },
        },
        "driver_licence": {
            "document_id": "P3084568",
            "expiration_date": "2025-07-11T14:05:30Z",
            "categories": ["C, CE"]
        }
    }
]

trailers = [
    {
        "plate": "EL-3ZXXC",
        "axis_number": 3,
        "brand": "Feldbinder",
        "carrying_capacity": 20,
        "trailer_type": "Silo"
    },
    {
        "plate": "EL-ZEDGC",
        "axis_number": 3,
        "brand": "Krone",
        "carrying_capacity": 21,
        "trailer_type": "Curtainsider",
        "purchase_date": "2018-04-20T16:55:26Z"
    },
    {
        "plate": "EL-078AV",
        "axis_number": 2,
        "brand": "Schwarzmüeller",
        "carrying_capacity": 18,
        "trailer_type": "DumbTruck",
        "purchase_date": "2021-06-23T03:21:38Z"
    },
    {
        "plate": "EL-8RNI6",
        "axis_number": 2,
        "brand": "Schwarzmüeller",
        "carrying_capacity": 12,
        "trailer_type": "Tank"
    },
    {
        "plate": "EL-2EWU8",
        "axis_number": 3,
        "brand": "Schwarzmüeller",
        "carrying_capacity": 24,
        "trailer_type": "DumbTruck"
    },
    {
        "plate": "EL-7M1RT",
        "axis_number": 3,
        "brand": "Schwarzmüeller",
        "carrying_capacity": 18,
        "trailer_type": "Logger",
        "purchase_date": "2019-02-09T13:45:09Z"
    },
    {
        "plate": "EL-8GI65",
        "axis_number": 2,
        "brand": "Schwarzmüeller",
        "carrying_capacity": 12,
        "trailer_type": "Curtainsider"
    },
    {
        "plate": "EL-AK8AK",
        "axis_number": 3,
        "brand": "Krone",
        "carrying_capacity": 18,
        "trailer_type": "Curtainsider",
        "purchase_date": "2021-06-30T05:29:41Z",
    },
    {
        "plate": "EL-1YLTP",
        "axis_number": 3,
        "brand": "Wielton",
        "carrying_capacity": 24,
        "trailer_type": "DumbTruck",
        "purchase_date": "2022-03-25T15:45:18Z"
    },
    {
        "plate": "EL-1SAOA",
        "axis_number": 2,
        "brand": "Schmitz Cargobull",
        "carrying_capacity": 12,
        "trailer_type": "Refrigerated"
    },
]

trucks = [
    {
        "plate": "EL-3ZXXC",
        "axis_number": 3,
        "mileage": 678307,
        "brand": "MAN",
    },
    {
        "plate": "EL-3ZXXC",
        "axis_number": 3,
        "mileage": 204353,
        "brand": "Renault",
        "purchase_date": "2022-04-08T18:14:12Z"
    },
    {
        "plate": "EL-3ZXXC",
        "axis_number": 3,
        "mileage": 760954,
        "brand": "Scania",
        "purchase_date": "2019-02-19T00:57:00Z"
    },
    {
        "plate": "EL-3ZXXC",
        "axis_number": 3,
        "mileage": 721707,
        "brand": "MAN",
        "purchase_date": "2019-10-24T23:19:08Z"
    },

]

carriages = [
    {
        "client": {
            "name": "Tall Tales Craft Ales",
            "tax_number": "5268672572",
            "phone": "699604416",
            "email": "talltalles@gmail.com"
        },
        "pickup_time": "2023-05-15T07:18:52Z",
        "pickup_address": {
            "zipcode": "41-300",
            "city": "Dąbrowa Górnicza",
            "country": "Poland",
            "street": "ul. Adamieckiego Karola 116"
        },
        "drop_address": {
            "zipcode": "80-014",
            "city": "Gdańsk",
            "country": "Poland",
            "street": "ul. Radwańska 97"
        },
        "load": [{
            "cargo_type": "Grain",
            "amount": 12
        }],
        "truck_sets": [["truck:⟨EL-3ZXXC⟩", "trailer:⟨EL-078AV⟩", "driver:⟨90041421993⟩"]]
    }
]

datasets = {"cargo": cargo, "client": clients, "driver": drivers,
            "trailer": trailers, "truck": trucks, "carriage": carriages}

tables = [
    "address", "cargo", "cargoType", "carriage", "client", "driver", "trailer", "truck",
    "canCarry", "order", "pickup", "drop", "contains"
]


def drop():
    config = dotenv_values(".env")
    headers = {'Accept': 'application/json',
               'NS': config.get("DATABASE_NAMESPACE"),
               'DB': config.get("DATABASE_NAME")}

    db_url = f'http://{config.get("DATABASE_URL")}/sql'
    username = config.get("DATABASE_USER")
    password = config.get("DATABASE_PASSWORD")

    for i in tables:
        query = f'remove table {i}'
        r = requests.post(url=db_url,
                          headers=headers,
                          auth=(username, password),
                          data=query)
        if r.ok:
            print(f'Table {i} dropped successfully')


def populate_data():
    for k, v in datasets.items():
        for item in v:
            r = requests.post(url=f'{BASE_API_URL}/{k}',
                              json=item)
            if r.ok:
                print(f'Data inserted successfully')


def main():
    drop()
    populate_data()


if __name__ == '__main__':
    sys.exit(main())
