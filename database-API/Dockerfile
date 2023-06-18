# generate a recipe file for dependencies
FROM rust:1.70 as planner
WORKDIR /app
RUN cargo install cargo-chef

COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# build dependencies
FROM rust:1.70 as cacher
WORKDIR /app
RUN cargo install cargo-chef
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# build main app
FROM rust:1.70 AS builder

# create app user
ENV USER=web
ENV UID=1001

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    "${USER}"


# copy the app into the image
COPY . /app

# set the work directory
WORKDIR /app

# copy dependencies
COPY --from=cacher /app/target target
COPY --from=cacher /usr/local/cargo /usr/local/cargo

# build the app
RUN cargo build --release

# run image
FROM gcr.io/distroless/cc-debian11

# copy app from builder
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group
COPY --from=builder /app/target/release/database-API /app/database-API

WORKDIR /app
USER web:web

#run app
CMD ["./database-API"]
