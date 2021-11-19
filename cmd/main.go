package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/public-awesome/lbp-simulator/simulator"
)

func main() {
	fmt.Println("listening: 8080")
	http.HandleFunc("/api/simulate", func(rw http.ResponseWriter, r *http.Request) {
		sample := []byte(`{
			"weights": "90ustars,10uosmo",
			"initial-deposit": "50000000000000ustars,125000000000uosmo",
			"swap-fee": "0.003",
			"exit-fee": "0.001",
			"lbp-params": {
				"duration": "120h",
				"target-pool-weights": "1ustars,1uosmo"
			}
		}`)
		poolMsg, err := simulator.CreatePoolMsg(sample)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		rw.Header().Add("content-type", "application/json")
		data, err := simulator.Simulate(poolMsg.PoolParams, poolMsg.PoolAssets)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		resp := struct {
			Data []simulator.PriceData `json:"data"`
		}{
			data,
		}
		json.NewEncoder(rw).Encode(resp)
	})
	http.ListenAndServe(":8080", nil)
}
