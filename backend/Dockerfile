FROM rust:1 AS builder
WORKDIR /app

# Cache dependencies by building a dummy binary first
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -f target/release/deps/wikiguess*

COPY src ./src
COPY migrations ./migrations
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/wikiguess .
EXPOSE 3000
CMD ["./wikiguess"]
