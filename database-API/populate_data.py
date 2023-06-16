import sys

import requests
from dotenv import dotenv_values

BASE_API_URL = "http://127.0.0.1:8080/api"

cargo = [
    {"name": "Apples", "unit": "psc.", "type_name": "Pallet"},
    {"name": "Big-Bags of Seeds ", "unit": "psc.", "type_name": "Pallet"},
    {"name": "Atlantic Cod Fillet", "unit": "t", "type_name": "Refrigerated"},
    {"name": "Beef", "unit": "t", "type_name": "Refrigerated"},
    {"name": "Barley", "unit": "t", "type_name": "Grain"},
    {"name": "Reinforcing Bars", "unit": "t", "type_name": "Buildings Materials"},
    {"name": "Logs", "unit": "t", "type_name": "Wood"},
    {"name": "Cement", "unit": "t", "type_name": "Dry Bulk Cargo"},
    {"name": "Coal", "unit": "t", "type_name": "Dry Bulk Cargo"},
    {"name": "Diesel", "unit": "hl", "required_licence": "Flammable", "type_name": "Liquid Bulk Cargo"},
    {"name": "Loaders", "unit": "psc.", "required_licence": "Overdimensional", "type_name": "Machines"},
    {"name": "Fuel Tanker", "unit": "psc.", "required_licence": "Flammable", "type_name": "Pallet"},
    {"name": "Pigs", "unit": "psc.", "required_licence": "Livestock", "type_name": "Livestock"},
]

clients = [
    {
        "name":"Tall Tales Craft Ales",
        "tax_number":"5268672572",
        "phone":"699604416",
        "email":"talltalles@gmail.com",
        "address":{
            "postalCode":"41-300",
            "city":"Dąbrowa Górnicza",
            "country":"Poland",
            "street":" ul. Adamieckiego Karola 116",
            "state":"Woj. Śląskie"
        }
    },
     {"name": "Tamsack Harbor", "tax_number": "7976065223", "phone": "694025155 ", "email": "tamsack@gmail.com",
     "address": {"postalCode": "80-014", "city": "Gdańsk", "country": "Poland", "street": "ul. Radwańska 97", "state":"Woj. Pomorskie"}}
]

drivers = [
    {
            "first_name": "Alex",
            "last_name": "White",
            "personal_id_number": "90041421993",
            "gender":"Man",
            "birth_date":"1990-04-14T00:00:00Z",
            "employment_date": "2021-04-15T12:00:32.129056200Z",
            "phone": "662009817",
            "email": "alexander@gmail.com",
            "salary": 7300,
            "address": {
                "postalCode": "60-009",
                "city": "Poznań",
                "state":"Woj. Wielkopolskie",
                "country": "Polska",
                "street": "Legionów Polskich 56/2"
            },
        "driver_licence": {
            "document_id": "P8676449",
            "expiration_date": "2028-10-15T12:00:32.129056200Z",
            "categories": ["C"]
        },
        "owned_licences": ["Toxic"],
        "driver_state":"Available"
    },
    {
            "first_name": "William",
            "last_name": "Black",
            "personal_id_number": "89031214633",
            "gender":"Man",
            "birth_date":"1989-03-12T00:00:00Z",
            "employment_date": "2023-01-15T12:00:32.129056200Z",
            "phone": "661006871",
            "email": "william@gmail.com",
            "salary": 5000,
            "address": {
                "postalCode": "52-051",
                "city": "Wrocław",
                "state":"Woj. Dolnoślaskie",
                "country": "Polska",
                "street": "ul. Mokry Dwór 5"
            },
        "driver_licence": {
            "document_id": "P2751088",
            "expiration_date": "2025-12-05T12:00:32.129056200Z",
            "categories": ["C"]
        },
        "owned_licences": ["Toxic"],
        "driver_state":"Available"
    },
    {
            "first_name": "Elvin",
            "last_name": "Rathke",
            "personal_id_number": "67120732572",
            "gender":"Woman",
            "birth_date":"1967-12-07T00:00:00Z",
            "employment_date": "2022-03-17T15:05:55Z",
            "phone": "877408081",
            "email": "erathke0@sun.com",
            "salary": 8212,
            "address": {
                "postalCode": "90-540",
                "city": "Łódź",
                "state":"Woj. Łódzkie",
                "country": "Poland",
                "street": "ul. Radwańska 97"
            },
        "driver_licence": {
            "document_id": "P1928072",
            "expiration_date": "2024-03-28T14:05:30Z",
            "categories": ["C"]
        },
        "owned_licences": ["Flammable", "Overdimensional"],
        "driver_state":"Available"
    },
    {
            "first_name": "Demeter",
            "last_name": "Gilman",
            "personal_id_number": "93022779964",
            "maiden_name":"Williams",
            "gender":"Woman",
            "birth_date":"1993-02-27T00:00:00Z",
            "employment_date": "2018-10-28T14:05:30Z",
            "phone": "917268559",
            "email": "dgilman1@fc2.com",
            "salary": 8992,
            "address": {
                "postalCode": "91-179",
                "city": "Łódź",
                "state":"Woj. Łódzkie",
                "country": "Poland",
                "street": "ul. Białych Róż 43"
            },
        "driver_licence": {
            "document_id": "P3084568",
            "expiration_date": "2025-07-11T14:05:30Z",
            "categories": ["C", "CE"]
        },
        "driver_state":"Available"
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
        "purchase_date": "2021-06-30T05:29:41Z"
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
        "brand": "MAN"
    },
    {
        "plate": "EL-3ZXZC",
        "axis_number": 3,
        "mileage": 204353,
        "brand": "Renault",
        "purchase_date": "2022-04-08T18:14:12Z"
    },
    {
        "plate": "EL-3ZXYC",
        "axis_number": 3,
        "mileage": 760954,
        "brand": "Scania",
        "purchase_date": "2019-02-19T00:57:00Z"
    },
    {
        "plate": "EL-3ZUXC",
        "axis_number": 3,
        "mileage": 721707,
        "brand": "MAN",
        "purchase_date": "2019-10-24T23:19:08Z"
    },

]

carriages = [

]

datasets = {"cargo": cargo, "client": clients, "driver": drivers,
            "truck": trucks, "trailer": trailers, "carriage": carriages}

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
                print(f'Data inserted successfully to column: {k}')
            else:
                print("Error: ", r.reason)


def main():
    drop()
    populate_data()


if __name__ == '__main__':
    sys.exit(main())
