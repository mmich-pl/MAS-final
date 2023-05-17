#[derive(thiserror::Error, Debug)]
pub enum APIError {
    #[error("Value not of type '{0}'")]
    ValueNotOfType(String),

    #[error("Currently in database there are no record that fulfill your requirements: '{0}'")]
    CantMatch(String),

    #[error(transparent)]
    Surreal(#[from] surrealdb::Error),
}