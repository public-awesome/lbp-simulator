package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/public-awesome/lbp-simulator/simulator"
)

func main() {
	fmt.Println("listening: 8080")
	http.HandleFunc("/api/simulate", func(rw http.ResponseWriter, r *http.Request) {
		req := SimulateRequest{}
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}

		// sample := []byte(`{
		// 	"weights": "90ustars,10uosmo",
		// 	"initial-deposit": "50000000000000ustars,125000000000uosmo",
		// 	"swap-fee": "0.003",
		// 	"exit-fee": "0.001",
		// 	"lbp-params": {
		// 		"duration": "120h",
		// 		"target-pool-weights": "1ustars,1uosmo"
		// 	}
		// }`)
		bz, _ := req.Marshal()
		poolMsg, err := simulator.CreatePoolMsg(bz)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		rw.Header().Add("content-type", "application/json")
		resp, err := simulator.Simulate(poolMsg.PoolParams, poolMsg.PoolAssets, req.Volume)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(rw).Encode(resp)
	})
	http.ListenAndServe(":8080", nil)
}

type SimulateRequest struct {
	Duration      string `json:"duration"`
	InitialWeight struct {
		Stars int `json:"stars"`
		Osmo  int `json:"osmo"`
	} `json:"initialWeight"`
	EndWeight struct {
		Stars int `json:"stars"`
		Osmo  int `json:"osmo"`
	} `json:"endWeight"`
	Volume  int64 `json:"volume"`
	Deposit struct {
		Stars int `json:"stars"`
		Osmo  int `json:"osmo"`
	} `json:"deposit"`
}

func (r SimulateRequest) Marshal() ([]byte, error) {
	tpl := `{
		"weights": "%sustars,%suosmo",
		"initial-deposit": "%sustars,%suosmo",
		"swap-fee": "0.003",
		"exit-fee": "0.001",
		"lbp-params": {
			"duration": "%s",
			"target-pool-weights": "%sustars,%suosmo"
		}
	}
	`
	tmp := fmt.Sprintf(tpl,
		strconv.Itoa(r.InitialWeight.Stars), strconv.Itoa(r.InitialWeight.Osmo),
		strconv.Itoa(r.Deposit.Stars*1_000_000), strconv.Itoa(r.Deposit.Osmo*1_000_000),
		r.Duration,
		strconv.Itoa(r.EndWeight.Stars), strconv.Itoa(r.EndWeight.Osmo),
	)
	return []byte(tmp), nil
}
