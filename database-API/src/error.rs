#[derive(thiserror::Error, Debug)]
pub enum APIError {
    #[error("Value not of type '{0}'")]
    ValueNotOfType(String),

    #[error(transparent)]
    Surreal(#[from] surrealdb::Error),
}