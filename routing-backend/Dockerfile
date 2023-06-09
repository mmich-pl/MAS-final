FROM golang:1.20 AS build

ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main .

WORKDIR /dist
RUN cp /build/main .
RUN cp /build/.env .


FROM alpine
WORKDIR /app

COPY --from=build /dist/main .
COPY --from=build /build/.env .

CMD [ "./main" ]
