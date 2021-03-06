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
	Fees struct {
		Swap string `json:"swap"`
		Exit string `json:"exit"`
	} `json:"fees"`
}

func (r SimulateRequest) Marshal() ([]byte, error) {
	tpl := `{
		"weights": "%sustars,%suosmo",
		"initial-deposit": "%sustars,%suosmo",
		"swap-fee": "%s",
		"exit-fee": "%s",
		"lbp-params": {
			"duration": "%s",
			"target-pool-weights": "%sustars,%suosmo"
		}
	}
	`
	tmp := fmt.Sprintf(tpl,
		strconv.Itoa(r.InitialWeight.Stars), strconv.Itoa(r.InitialWeight.Osmo),
		strconv.Itoa(r.Deposit.Stars*1_000_000), strconv.Itoa(r.Deposit.Osmo*1_000_000),
		r.Fees.Swap, r.Fees.Exit,
		r.Duration,
		strconv.Itoa(r.EndWeight.Stars), strconv.Itoa(r.EndWeight.Osmo),
	)
	return []byte(tmp), nil
}
