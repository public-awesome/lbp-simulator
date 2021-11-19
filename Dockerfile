FROM alpine:3.13
RUN apk add -U --no-cache ca-certificates

COPY ./build/lbp-simulator-api /usr/bin/lbp-simulator-api

EXPOSE 8080

CMD ["lbp-simulator-api"]
