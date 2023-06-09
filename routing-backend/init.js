db = new Mongo().getDB("mas");

db.createCollection('geocoding', {capped: true, size: 104857600});
db.createCollection('routes', {capped: true, size: 104857600});