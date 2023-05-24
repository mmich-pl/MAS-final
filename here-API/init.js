db = new Mongo().getDB("mas");

db.createCollection('test', { capped: false });