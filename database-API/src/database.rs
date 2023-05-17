use std::sync::Arc;

use dotenv::dotenv;
use surrealdb::engine::remote::ws::{Client, Ws};
use surrealdb::opt::auth::Root;
use surrealdb::Surreal;

pub type SurrealClient = Surreal<Client>;

pub struct DbClient {
    pub surreal: Arc<SurrealClient>,
}

fn getenv(key: &str) -> String {
    std::env::var(key).expect(&format!("{} must be set", key))
}

pub fn init_env() {
    dotenv().ok();
    let env_list = [
        "DATABASE_URL", "DATABASE_USER", "DATABASE_PASSWORD",
        "DATABASE_NAMESPACE", "DATABASE_NAME",
    ];
    for env in env_list {
        getenv(env);
    }
}

pub async fn init_database() -> SurrealClient {
    let client = Surreal::new::<Ws>(getenv("DATABASE_URL"))
        .await
        .expect("Failed to connect to Surreal database");

    // Sign in as a namespace, database, or root user
    client.signin(Root {
            username: getenv("DATABASE_USER").as_str(),
            password: getenv("DATABASE_PASSWORD").as_str(),
        })
        .await
        .expect("Failed to sign in");

    // Select a specific namespace and database
    client
        .use_ns(getenv("DATABASE_NAMESPACE"))
        .use_db(getenv("DATABASE_NAME"))
        .await
        .expect("Failed to select namespace and database");

    client
}