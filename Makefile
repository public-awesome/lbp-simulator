
.PHONY: run build deploy build-docker

run:
	go run ./cmd/
build:
	CGO_ENABLED=0 go build -o build/lbp-simulator-api ./cmd/
build-docker: build
	docker build --no-cache -t public-awesome/lbp-simulator .
deploy: build-docker
	sh deploy.sh
