FROM golang:1.23-alpine AS build
WORKDIR /src
COPY matching-engine/src/main.go ./main.go
RUN CGO_ENABLED=0 go build -o /out/paper-engine main.go
FROM scratch
COPY --from=build /out/paper-engine /paper-engine
EXPOSE 9090
ENTRYPOINT ["/paper-engine"]
